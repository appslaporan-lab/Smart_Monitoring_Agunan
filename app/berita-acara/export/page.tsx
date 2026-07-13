import Link from 'next/link';

export const metadata = {
  title: 'Ekspor Berita Acara',
};

export default function ExportPage() {
  return (
    <main className="container" style={{ paddingTop: 24 }}>
      <h1>Ekspor Data Berita Acara</h1>
      <p>Unduh semua data berita acara dalam format Excel atau PDF.</p>
      <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
        <a href="/api/berita-acara/export?format=excel" className="button">Ekspor Excel</a>
        <a href="/api/berita-acara/export?format=pdf" className="button secondary">Ekspor PDF Ringkas</a>
        <Link href="/berita-acara" className="button" style={{ marginTop: 12 }}>Kembali</Link>
      </div>
    </main>
  );
}
