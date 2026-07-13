import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import Link from 'next/link';

const formatDate = (date?: Date | string | null) => {
  if (!date) return '-';
  return format(new Date(date), 'dd MMM yyyy');
};

const statusClass = (status: string) => {
  switch (status) {
    case 'DIKELUARKAN':
      return 'status-dikeluarkan';
    case 'DISETUJUI_OPERASIONAL':
    case 'DISETUJUI_PIMPINAN':
    case 'DISETUJUI':
      return 'status-disetujui';
    case 'TRANSFER_CABANG':
    case 'RE_DISBURSE':
      return 'status-warning';
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
    include: { nasabah: true },
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

  return (
    <main className="container">
      <section style={{ marginBottom: 32 }}>
        <h1>Detail Agunan</h1>
        <p>Informasi lengkap agunan dan riwayat penyerahan.</p>
      </section>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'grid', gap: 18 }}>
          <div>
            <strong>{agunan.kodeRegister}</strong>
            <p>{agunan.jenis} — {agunan.deskripsi}</p>
            <p>Status: <span className={`status-pill ${statusClass(agunan.status)}`}>{agunan.status}</span></p>
          </div>

          <div>
            <h2>Nasabah</h2>
            <p>Nama: {agunan.nasabah.nama}</p>
            <p>NIK: {agunan.nasabah.nik}</p>
            <p>Alamat: {agunan.nasabah.alamat ?? '-'}</p>
            <p>Telepon: {agunan.nasabah.telepon ?? '-'}</p>
          </div>

          <div>
            <h2>Status Penyerahan</h2>
            <p>Keluar dari brankas: {agunan.keluarDariBrankas ? 'Ya' : 'Tidak'}</p>
            <p>Diserahkan ke nasabah: {agunan.diserahkanKeNasabah ? 'Ya' : 'Tidak'}</p>
            <p>Keluar oleh: {agunan.keluarOleh ?? '-'}</p>
            <p>Diserahkan oleh: {agunan.diserahkanOleh ?? '-'}</p>
            <p>Tanggal keluar: {formatDate(agunan.tanggalKeluar)}</p>
            <p>Tanggal serah: {formatDate(agunan.tanggalSerah)}</p>
          </div>

          {agunan.jenis === 'BPKB' && (
            <div>
              <h2>Data BPKB / Kendaraan</h2>
              <p>HER 5 reminder: {formatDate(agunan.her5Reminder)}</p>
              <p>Catatan: {agunan.warningPesan ?? '-'}</p>
            </div>
          )}

          <div>
            <h2>Workflow Approval</h2>
            <p>Gunakan tombol di bawah untuk mengubah status agunan sesuai alur approval.</p>
            <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <form action="/api/approval" method="post" style={{ display: 'inline-flex' }}>
                  <input type="hidden" name="agunanId" value={agunan.id} />
                  <input type="hidden" name="action" value="approve_operasional" />
                  <input type="hidden" name="actor" value="Admin Kredit" />
                  <button type="submit" className="button">Setujui Operasional</button>
                </form>
                <form action="/api/approval" method="post" style={{ display: 'inline-flex' }}>
                  <input type="hidden" name="agunanId" value={agunan.id} />
                  <input type="hidden" name="action" value="approve_pimpinan" />
                  <input type="hidden" name="actor" value="Pimpinan" />
                  <button type="submit" className="button secondary">Setujui Pimpinan</button>
                </form>
                <form action="/api/approval" method="post" style={{ display: 'inline-flex' }}>
                  <input type="hidden" name="agunanId" value={agunan.id} />
                  <input type="hidden" name="action" value="handover" />
                  <input type="hidden" name="actor" value="Petugas" />
                  <button type="submit" className="button secondary">Tandai Diserahkan</button>
                </form>
              </div>
              <textarea name="note" rows={3} placeholder="Tambahkan catatan approval atau penyerahan" style={{ width: '100%', maxWidth: 560 }} />
            </div>
          </div>

          <div>
            <Link href={`/agunan/${agunan.id}/berita-acara/formal`} className="button">Buat Berita Acara Formal</Link>
            <Link href="/reports" className="button secondary" style={{ marginLeft: 8 }}>Lihat Laporan</Link>
            <Link href="/audit" className="button" style={{ marginLeft: 8 }}>Lihat Audit Trail</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
