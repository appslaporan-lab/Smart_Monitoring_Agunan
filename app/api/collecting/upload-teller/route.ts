import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import * as XLSX from 'xlsx';

export async function POST(req: Request) {
  try {
    const user = getCurrentUser();
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Read as 2D array to easily check previous rows and ignore column headers
    const allRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const activePeriode = await prisma.periodeNominatif.findFirst({
      where: { jenisUpload: 'COLLECTING' },
      orderBy: { id: 'desc' },
    });

    if (!activePeriode) {
      return NextResponse.json({ error: 'Tidak ada periode Collecting yang aktif.' }, { status: 400 });
    }

    const allPinjaman = await prisma.pinjamanPeriode.findMany({
      where: { periodeId: activePeriode.id },
      select: { norek: true }
    });
    const activeNoreks = new Set(allPinjaman.map(p => p.norek));

    let updatedCount = 0;
    const errors: string[] = [];

    // Process rows
    for (let i = 0; i < allRows.length; i++) {
      const row = allRows[i];
      if (!row || row.length === 0) continue;
      
      const rowStr = row.join(' ').toLowerCase();
      const norekMatches = rowStr.match(/\b\d{10}\b/g);
      
      if (norekMatches) {
        const validNorek = norekMatches.find(n => activeNoreks.has(n));
        
        if (validNorek) {
          // Extract nominal: look in current row AND previous row 
          // because CBS often splits descriptions and amounts across two visual rows
          let nominal = 0;
          
          const extractMaxNum = (r: any[]) => {
            let max = 0;
            for (const val of r) {
              if (typeof val === 'number' && val > max) max = val;
              else if (typeof val === 'string') {
                const numStr = val.replace(/[^\\d.-]/g, '');
                const num = parseFloat(numStr);
                if (!isNaN(num) && num > max && num !== parseInt(validNorek)) {
                  max = num;
                }
              }
            }
            return max;
          };

          const maxCurrent = extractMaxNum(row);
          let maxPrev = 0;
          if (i > 0 && allRows[i-1]) {
            maxPrev = extractMaxNum(allRows[i-1]);
          }

          nominal = Math.max(maxCurrent, maxPrev);

          const updated = await prisma.pinjamanPeriode.updateMany({
            where: {
              periodeId: activePeriode.id,
              norek: validNorek
            },
            data: {
              sudahBayar: true,
              nominalBayarHariIni: nominal
            }
          });

          if (updated.count > 0) {
            updatedCount++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      errors
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan' }, { status: 500 });
  }
}
