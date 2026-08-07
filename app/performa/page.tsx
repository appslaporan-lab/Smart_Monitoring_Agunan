import Link from 'next/link';

export const dynamic = 'force-dynamic';
export default function PerformaPage() {
  return (
    <main className="container">
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <h1>Modul Performa Kantor</h1>
        <p style={{ color: '#64748b' }}>Modul ini sedang dalam pengembangan. Segera hadir.</p>
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/performa/kolektibilitas" className="button secondary">Laporan Kolektibilitas</Link>
          <Link href="/collecting/upload" className="button">Kelola Upload Nominatif</Link>
        </div>
      </div>
    </main>
  );
}