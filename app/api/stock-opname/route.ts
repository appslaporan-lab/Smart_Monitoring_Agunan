import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const agunanId = formData.get('agunanId');
  const pelaksana = formData.get('pelaksana');
  const tanggal = formData.get('tanggal');
  const hasilTemuan = formData.get('hasilTemuan');
  const rekomendasi = formData.get('rekomendasi');
  const tindakLanjut = formData.get('tindakLanjut');
  const targetSelesai = formData.get('targetSelesai');
  const catatan = formData.get('catatan');

  if (!pelaksana || !tanggal || !hasilTemuan || !rekomendasi || !tindakLanjut) {
    return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
  }

  await prisma.stockOpname.create({
    data: {
      agunanId: agunanId ? Number(agunanId) : undefined,
      pelaksana: String(pelaksana) as any,
      tanggal: new Date(String(tanggal)),
      hasilTemuan: String(hasilTemuan),
      rekomendasi: String(rekomendasi),
      tindakLanjut: String(tindakLanjut) as any,
      targetSelesai: targetSelesai ? new Date(String(targetSelesai)) : undefined,
      catatan: catatan ? String(catatan) : undefined,
    },
  });

  return NextResponse.redirect(new URL('/stock-opname', request.url));
}
