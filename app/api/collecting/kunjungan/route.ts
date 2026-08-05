import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { appendAuditLog } from '@/lib/audit';

export async function POST(request: Request) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Anda harus login.' }, { status: 401 });

  const body = await request.json();
  const { pinjamanPeriodeId, tanggalKunjungan, jenisKontak, hasil, nominalDibayar, tanggalJanjiBayar, catatan, fotoDataUrl } = body;

  if (!pinjamanPeriodeId || !tanggalKunjungan || !jenisKontak || !hasil) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
  }

  try {
    const pinjaman = await prisma.pinjamanPeriode.findUnique({ where: { id: Number(pinjamanPeriodeId) } });
    if (!pinjaman) return NextResponse.json({ error: 'Data pinjaman tidak ditemukan.' }, { status: 404 });

    const created = await prisma.kunjunganPenagihan.create({
      data: {
        pinjamanPeriodeId: Number(pinjamanPeriodeId),
        petugasId: user.id,
        tanggalKunjungan: new Date(tanggalKunjungan),
        jenisKontak,
        hasil,
        nominalDibayar: nominalDibayar ? Number(nominalDibayar) : null,
        tanggalJanjiBayar: tanggalJanjiBayar ? new Date(tanggalJanjiBayar) : null,
        catatan: catatan || null,
        fotoDataUrl: fotoDataUrl || null,
      },
    });

    await appendAuditLog({
      action: 'catat_kunjungan_penagihan',
      actor: `${user.nama} (${user.role})`,
      details: `Norek: ${pinjaman.norek}, Nasabah: ${pinjaman.namaNasabahExcel}, Hasil: ${hasil}`,
    });

    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menyimpan kunjungan.' }, { status: 500 });
  }
}