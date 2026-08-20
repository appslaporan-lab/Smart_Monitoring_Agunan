import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { parseNominatifExcel } from '@/lib/excelParser';
import { appendAuditLog } from '@/lib/audit';

export async function POST(request: Request) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Anda harus login.' }, { status: 401 });
  if (user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Hanya Superadmin yang boleh upload nominatif.' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const bulan = Number(formData.get('bulan'));
  const tahun = Number(formData.get('tahun'));
  const jenisUpload = String(formData.get('jenisUpload') || 'COLLECTING').toUpperCase();
  const uploadType = jenisUpload === 'PERFORM_KOLEKTIBILITAS' ? 'PERFORM_KOLEKTIBILITAS' : 'COLLECTING';

  if (!file || !bulan || !tahun) {
    return NextResponse.json({ error: 'Data tidak lengkap (file, bulan, tahun wajib diisi).' }, { status: 400 });
  }

  const existing = await prisma.periodeNominatif.findUnique({ where: { bulan_tahun_jenisUpload: { bulan, tahun, jenisUpload: uploadType } } });
  if (existing) {
    return NextResponse.json({ error: `Periode ${bulan}/${tahun} sudah pernah diupload sebelumnya.` }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Ambil list mapping AO dari database
    const aoList = await prisma.masterAO.findMany();
    
    const { rows, totalBarisAsli, totalDilewati } = parseNominatifExcel(buffer, uploadType, aoList);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Tidak ada baris data yang valid untuk diimport.' }, { status: 400 });
    }

    // Cari AO baru yang belum ada di MasterAO
    const newAos = new Set<string>();
    rows.forEach(r => {
      let raw = 'KOSONG';
      if (r.rawDataJson) {
        const parsedRaw = JSON.parse(r.rawDataJson);
        raw = String(parsedRaw['AQ'] || '').trim();
        if (!raw) raw = 'KOSONG';
      }
      if (!aoList.some(a => a.rawName === raw)) {
        newAos.add(raw);
      }
    });

    if (newAos.size > 0) {
      const dataToInsert = Array.from(newAos).map(name => ({
        rawName: name,
        mappedName: name // default sama dengan raw
      }));
      await prisma.masterAO.createMany({
        data: dataToInsert,
        skipDuplicates: true
      });
    }

    const periode = await prisma.periodeNominatif.create({
      data: {
        bulan,
        tahun,
        namaFile: file.name,
        diuploadOlehId: user.id,
        totalBaris: rows.length,
        jenisUpload: uploadType,
      },
    });

    const BATCH_SIZE = 200;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      await prisma.$transaction(
        batch.map((row) =>
          prisma.pinjamanPeriode.create({
            data: {
              periodeId: periode.id,
              norek: row.norek,
              namaNasabahExcel: row.namaNasabahExcel,
              alamatExcel: row.alamatExcel,
              noIdentitas: row.noIdentitas,
              noTelepon: row.noTelepon,
              subKantor: row.subKantor,
              namaAO: row.namaAO,
              kategoriDebitur: row.kategoriDebitur,
              namaKategoriDebitur: row.namaKategoriDebitur,
              jenisJaminan: row.jenisJaminan,
              plafon: row.plafon,
              outstanding: row.outstanding,
              tunggakanPokok: row.tunggakanPokok,
              tunggakanBunga: row.tunggakanBunga,
              angsuranPerBulan: row.angsuranPerBulan,
              sukuBunga: row.sukuBunga,
              tglRealisasi: row.tglRealisasi,
              tglJatuhTempo: row.tglJatuhTempo,
              jangkaBulan: row.jangkaBulan,
              kdKolektibilitas: row.kdKolektibilitas,
              produkKredit: row.produkKredit,
              sektorEkonomi: row.sektorEkonomi,
              jarakKantorKm: row.jarakKantorKm,
              hariTunggakan: row.hariTunggakan,
              jenisUpload: uploadType,
              rawDataJson: row.rawDataJson,
            },
          }),
        ),
      );
    }

    await appendAuditLog({
      action: 'upload_nominatif',
      actor: `${user.nama} (${user.role})`,
      details: `${uploadType === 'PERFORM_KOLEKTIBILITAS' ? 'Perform Kolektibilitas' : 'Collecting'} — Periode ${bulan}/${tahun}, ${rows.length} baris diimport, ${totalDilewati} dilewati dari total ${totalBarisAsli} baris.`,
    });

    return NextResponse.json({
      success: true,
      periodeId: periode.id,
      totalDiimport: rows.length,
      totalDilewati,
      totalBarisAsli,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal memproses file nominatif.' }, { status: 500 });
  }
}