import ManualBeritaAcaraForm from './ManualBeritaAcaraForm';

export const dynamic = 'force-dynamic';

export default function ManualBeritaAcaraPage() {
  return (
    <main className="container" style={{ paddingTop: 24 }}>
      <h1>Berita Acara Serah Terima Agunan (Manual)</h1>
      <p>Khusus untuk nasabah yang belum memiliki nomor register di sistem.</p>
      <ManualBeritaAcaraForm />
    </main>
  );
}