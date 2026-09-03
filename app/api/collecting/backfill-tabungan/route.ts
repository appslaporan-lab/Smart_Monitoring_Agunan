import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const all = await prisma.pinjamanPeriode.findMany({ 
    where: { norekTabungan: null },
    select: { id: true, rawDataJson: true } 
  });
  let updated = 0;
  for (const p of all) {
    if (p.rawDataJson) {
      try {
        const raw = JSON.parse(p.rawDataJson);
        const norek = raw['BC'] ? String(raw['BC']).trim() : null;
        let saldo = null;
        if (raw['BD'] !== undefined && raw['BD'] !== null) {
            const num = typeof raw['BD'] === 'number' ? raw['BD'] : parseFloat(String(raw['BD']).replace(/,/g, ''));
            if (!isNaN(num)) saldo = num;
        }
        if (norek || saldo !== null) {
            await prisma.pinjamanPeriode.update({ where: { id: p.id }, data: { norekTabungan: norek, saldoTabungan: saldo } });
            updated++;
        }
      } catch(e) {}
    }
  }
  return NextResponse.json({ updated, total: all.length });
}
