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
    const allRows: any[] = XLSX.utils.sheet_to_json(sheet);

    // Get the active COLLECTING period
    const activePeriode = await prisma.periodeNominatif.findFirst({
      where: { jenisUpload: 'COLLECTING' },
      orderBy: { id: 'desc' },
    });

    if (!activePeriode) {
      return NextResponse.json({ error: 'Tidak ada periode Collecting yang aktif.' }, { status: 400 });
    }

    // Pre-fetch all norek in active period to cross-reference
    const allPinjaman = await prisma.pinjamanPeriode.findMany({
      where: { periodeId: activePeriode.id },
      select: { norek: true }
    });
    const activeNoreks = new Set(allPinjaman.map(p => p.norek));

    let updatedCount = 0;
    const errors: string[] = [];

    for (const row of allRows) {
      const rowStr = JSON.stringify(row).toLowerCase();
      
      // Look for ANY 10-digit number in the row
      const norekMatches = rowStr.match(/\\b\\d{10}\\b/g);
      
      if (norekMatches) {
        // Find the first 10-digit number that is an actual active Norek
        const validNorek = norekMatches.find(n => activeNoreks.has(n));
        
        if (validNorek) {
          // Extract nominal: usually in 'Kredit' or 'Mutasi Kredit' column
          // We will find the largest number in this row's values
          let nominal = 0;
          for (const key in row) {
            const val = row[key];
            if (typeof val === 'number' && val > nominal) {
              nominal = val;
            } else if (typeof val === 'string') {
              const num = parseFloat(val.replace(/[^\\d.-]/g, ''));
              if (!isNaN(num) && num > nominal && num !== parseInt(validNorek)) {
                // ignore if the number is exactly the norek
                nominal = num;
              }
            }
          }

          // Update DB
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
