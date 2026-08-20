import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { determineEWS } from '@/lib/ews';
import { getKantorLabel } from '@/lib/kantor';
import { format } from 'date-fns';
import Link from 'next/link';
import KunjunganForm from './KunjunganForm';
import ExportHistoriButtons from './ExportHistoriButtons';

export const dynamic = 'force-dynamic';

const formatDate = (date?: Date | string | null) => {
  if (!date) return '-';
  return format(new Date(date), 'dd MMM yyyy');
};

const formatRupiah = (val?: number | null) => {
  if (val === null || val === undefined) return '-';
  return `Rp ${val.toLocaleString('id-ID')}`;
};

export default async function PinjamanDetailPage({ params }: { params: { id: string } }) {
  const user = getCurrentUser();
  if (!user) redirect('/auth/login');

  const pinjaman = await prisma.pinjamanPeriode.findUnique({
    where: { id: Number(params.id) },
    include: {
      nasabah: true,
      periode: true,
      kunjunganPenagihan: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!pinjaman) {
    return (
      <main className="container">
        <div className="card" style={{ padding: 24 }}>
          <h1>Data pinjaman tidak ditemukan</h1>
          <Link href="/collecting" className="button secondary" style={{ marginTop: 16, display: 'inline-block' }}>Kembali ke Dashboard</Link>
        </div>
      </main>
    );
  }

  const ews = determineEWS(pinjaman.hariTunggakan, pinjaman.tglJatuhTempo);

  return (
    <main className="container">
      <section style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/collecting" className="button secondary" style={{ padding: '6px 12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Kembali
            </Link>
            Detail Pinjaman — {pinjaman.namaNasabahExcel}
          </h1>
          <p style={{ margin: '8px 0 0 0' }}>Periode: {pinjaman.periode.bulan}/{pinjaman.periode.tahun}</p>
        </div>
      </section>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <strong>{pinjaman.norek}</strong>
            <p style={{ margin: '4px 0' }}>{pinjaman.namaNasabahExcel}</p>
          </div>
          <span className={`status-pill ${ews.colorClass}`}>{ews.label}</span>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <p>Alamat: {pinjaman.alamatExcel || '-'}</p>
          <p>No. Telepon: {pinjaman.noTelepon || '-'}</p>
          <p>Kantor: {getKantorLabel(pinjaman.subKantor)} (Sub: {pinjaman.subKantor || '-'})</p>
          <p>Nama AO: {pinjaman.namaAO || '-'}</p>
          <p>Plafon: {formatRupiah(pinjaman.plafon)}</p>
          <p>Outstanding: {formatRupiah(pinjaman.outstanding)}</p>
          <p>Tunggakan Pokok: {formatRupiah(pinjaman.tunggakanPokok)}</p>
          <p>Tunggakan Bunga: {formatRupiah(pinjaman.tunggakanBunga)}</p>
          <p>Angsuran/Bulan: {formatRupiah(pinjaman.angsuranPerBulan)}</p>
          <p>Tgl Jatuh Tempo: {formatDate(pinjaman.tglJatuhTempo)}</p>
          <p>Hari Tunggakan: {pinjaman.hariTunggakan} hari</p>
          <p>Kolektibilitas: {pinjaman.kdKolektibilitas || '-'}</p>
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2>Catat Kunjungan / Kontak Baru</h2>
        <KunjunganForm pinjamanPeriodeId={pinjaman.id} />
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h2>Riwayat Kunjungan/Kontak</h2>
        <ExportHistoriButtons
          namaNasabah={pinjaman.namaNasabahExcel}
          norek={pinjaman.norek}
          riwayat={pinjaman.kunjunganPenagihan}
        />
        {pinjaman.kunjunganPenagihan.length === 0 ? (
          <p>Belum ada kunjungan tercatat.</p>
        ) : (
          <div style={{ display: 'grid', gap: 14, marginTop: 12 }}>
            {pinjaman.kunjunganPenagihan.map((k) => (
              <article key={k.id} className="card" style={{ padding: 16 }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{formatDate(k.tanggalKunjungan)} — {k.jenisKontak}</p>
                <p style={{ margin: '4px 0' }}>Hasil: <strong>{k.hasil.replace(/_/g, ' ')}</strong></p>
                {k.nominalDibayar && <p style={{ margin: '4px 0' }}>Nominal Dibayar: {formatRupiah(k.nominalDibayar)}</p>}
                {k.tanggalJanjiBayar && <p style={{ margin: '4px 0' }}>Janji Bayar: {formatDate(k.tanggalJanjiBayar)}</p>}
                {k.catatan && <p style={{ margin: '4px 0' }}>Catatan: {k.catatan}</p>}
                {k.fotoDataUrl && (
                  <img src={k.fotoDataUrl} alt="Dokumentasi" style={{ maxHeight: 120, marginTop: 8, borderRadius: 8 }} />
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}