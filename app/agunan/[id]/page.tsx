import { prisma } from '@/lib/prisma';
import { format, differenceInDays } from 'date-fns';
import Link from 'next/link';
import HerKembaliForm from '@/components/HerKembaliForm';

export const dynamic = 'force-dynamic';

const formatDate = (date?: Date | string | null) => {
  if (!date) return '-';
  return format(new Date(date), 'dd MMM yyyy');
};

const hitungHari = (date?: Date | string | null) => {
  if (!date) return null;
  return differenceInDays(new Date(), new Date(date));
};

const statusClass = (status: string) => {
  switch (status) {
    case 'DI_BRANKAS':
      return 'status-pending';
    case 'PROSES_KELUAR':
      return 'status-warning';
    case 'HER_5_TAHUNAN':
      return 'status-warning';
    case 'PROSES_SERTIFIKASI':
      return 'status-warning';
    case 'TRANSFER_CABANG':
      return 'status-dikeluarkan';
    case 'PENCAIRAN_ULANG':
      return 'status-disetujui';
    case 'DISERAHKAN':
      return 'status-diserahkan';
    case 'KEMBALI':
      return 'status-kembali';
    default:
      return 'status-pending';
  }
};

export async function generateStaticParams() {
  try {
    const agunans: { id: number }[] = await prisma.agunan.findMany({ select: { id: true } });
    return agunans.map((agunan) => ({ id: agunan.id.toString() }));
  } catch (error) {
    console.warn('Prisma database unavailable during build; skipping static params generation.', error);
    return [];
  }
}

export default async function AgunanDetail({ params }: { params: { id: string } }) {
  const agunan = await prisma.agunan.findUnique({
    where: { id: Number(params.id) },
    include: { nasabah: true, registrasi: true },
  });

  if (!agunan) {
    return (
      <main className="container">
        <div className="card" style={{ padding: 24 }}>
          <h1>Agunan tidak ditemukan</h1>
        </div>
      </main>
    );
  }

  const hariKeluar = hitungHari(agunan.tanggalKeluarBrankas);
  const hariSertifikasi = hitungHari(agunan.tanggalTerbitCovernote || agunan.createdAt);
  const showHerKembaliForm = agunan.status === 'PROSES_KELUAR' || agunan.status === 'HER_5_TAHUNAN';

  return (
    <main className="container">
      <section style={{ marginBottom: 32 }}>
        <h1>Detail Agunan</h1>
        <p>Informasi lengkap agunan.</p>
      </section>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'grid', gap: 18 }}>
          <div>
            <strong>{agunan.kodeRegister}</strong>
            <p>{agunan.jenis} — {agunan.deskripsi || '-'}</p>
            <p>Status: <span className={`status-pill ${statusClass(agunan.status)}`}>{agunan.status.replace(/_/g, ' ')}</span></p>

            {(agunan.status === 'PROSES_KELUAR' || agunan.status === 'HER_5_TAHUNAN') && hariKeluar !== null && (
              <div className="alert alert-danger" style={{ marginTop: 10 }}>
                Agunan sudah keluar dari brankas selama <strong>{hariKeluar} hari</strong> ({formatDate(agunan.tanggalKeluarBrankas)}).
                {agunan.status === 'HER_5_TAHUNAN' && ' STNK/Notice sudah kembali, menunggu BPKB baru dari Samsat.'}
              </div>
            )}

            {agunan.status === 'PROSES_SERTIFIKASI' && hariSertifikasi !== null && (
              <div className="alert alert-danger" style={{ marginTop: 10 }}>
                Proses sertifikasi sudah berjalan selama <strong>{hariSertifikasi} hari</strong> (estimasi 6 bulan / ~180 hari).
                {agunan.perkiraanJadiSHM && ` Perkiraan jadi SHM: ${formatDate(agunan.perkiraanJadiSHM)}.`}
              </div>
            )}
          </div>

          <div>
            <h2>Nasabah</h2>
            <p>Nama: {agunan.nasabah.nama}</p>
            <p>NIK: {agunan.nasabah.nik}</p>
            <p>Alamat: {agunan.nasabah.alamat ?? '-'}</p>
            <p>Telepon: {agunan.nasabah.telepon ?? '-'}</p>
            <p>Nomor Rekening: {agunan.registrasi.nomorRekening ?? '-'}</p>
          </div>

          {agunan.jenis === 'BPKB' && (
            <div>
              <h2>Data BPKB / Kendaraan</h2>
              <p>Jenis Kendaraan: {agunan.jenisKendaraan ?? '-'}</p>
              <p>Nomor Plat: {agunan.nomorPolisi ?? '-'}</p>
              <p>Nama Pemilik: {agunan.namaPemilik ?? '-'}</p>
              <p>Merk / Type / Warna: {agunan.merk ?? '-'} / {agunan.tipeKendaraan ?? '-'} / {agunan.warna ?? '-'}</p>
              <p>Tahun Pembuatan: {agunan.tahunPembuatan ?? '-'}</p>
              <p>Nomor Rangka: {agunan.noRangka ?? '-'}</p>
              <p>Nomor Mesin: {agunan.noMesin ?? '-'}</p>
              <p>Nomor BPKB: {agunan.nomorBPKB ?? '-'}</p>
              <p>Pengingat HER 5 Tahunan: {formatDate(agunan.her5Reminder)}</p>
            </div>
          )}

          {agunan.jenis === 'SHM_AJB' && (
            <div>
              <h2>Data SHM / AJB</h2>
              <p>Nomor SHM/Akta: {agunan.nomorSHM ?? '-'}</p>
              <p>Nama Pemilik: {agunan.namaPemilikSHM ?? '-'}</p>
              <p>Lokasi Tanah: {agunan.lokasiTanah ?? '-'}</p>
              <p>Luas: {agunan.luasTanah ? `${agunan.luasTanah} m2` : '-'}</p>
            </div>
          )}

          {agunan.jenis === 'SK' && (
            <div>
              <h2>Data SK</h2>
              <p>Nomor SK: {agunan.nomorSK ?? '-'}</p>
              <p>Nama Pemilik: {agunan.namaPemilikSK ?? '-'}</p>
              <p>Dinas/Desa: {agunan.dinasDesa ?? '-'}</p>
            </div>
          )}

          {(agunan.jenis === 'EMAS' || agunan.jenis === 'DEPOSITO') && (
            <div>
              <h2>Data {agunan.jenis === 'EMAS' ? 'Emas' : 'Deposito'}</h2>
              <p>Berat: {agunan.beratEmas ? `${agunan.beratEmas} gram` : '-'}</p>
              <p>Karat: {agunan.karatEmas ?? '-'}</p>
              <p>Taksiran Harga: {agunan.taksiranHarga ? `Rp ${agunan.taksiranHarga.toLocaleString('id-ID')}` : '-'}</p>
            </div>
          )}

          {agunan.jenis === 'PROSES_SERTIFIKASI' && (
            <div>
              <h2>Data Proses Sertifikasi</h2>
              <p>Nomor Covernote: {agunan.nomorCovernote ?? '-'}</p>
              <p>Tanggal Terbit: {formatDate(agunan.tanggalTerbitCovernote)}</p>
              <p>Nomor AJB: {agunan.nomorAJB ?? '-'}</p>
              <p>Atas Nama: {agunan.atasNamaSertifikasi ?? '-'}</p>
              <p>Letak Tanah: {agunan.letakTanahSertifikasi ?? '-'}</p>
              <p>Luas: {agunan.luasSertifikasi ? `${agunan.luasSertifikasi} m2` : '-'}</p>
              <p>Perkiraan Jadi SHM: {formatDate(agunan.perkiraanJadiSHM)}</p>
            </div>
          )}

          {agunan.warningPesan && (
            <div className="alert alert-danger">
              <strong>Catatan/Peringatan:</strong> {agunan.warningPesan}
            </div>
          )}

          {showHerKembaliForm && <HerKembaliForm agunanId={agunan.id} />}

        </div>
      </div>
    </main>
  );
}