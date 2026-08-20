import LintasKantorBeritaAcaraForm from './LintasKantorBeritaAcaraForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Berita Acara Lintas Kantor',
};

export default function LintasKantorBeritaAcaraPage() {
  return (
    <main className="container" style={{ paddingTop: 24, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Berita Acara Lintas Kantor</h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>Template khusus untuk serah terima agunan antar kantor (Pusat ke Cabang / Cabang ke Pusat).</p>
      </div>
      
      <LintasKantorBeritaAcaraForm />
    </main>
  );
}
