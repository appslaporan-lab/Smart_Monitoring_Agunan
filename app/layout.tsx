import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agunan Monitoring',
  description: 'Aplikasi monitoring agunan kredit dengan peringatan HER BPKB dan penyerahan brankas.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <header className="app-header">
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '18px 0' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem' }}>Agunan Monitoring</p>
              <span style={{ color: '#475569', fontSize: '0.95rem' }}>Sistem online untuk monitoring agunan kredit</span>
            </div>
            <nav style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <a href="/" className="button secondary">Dashboard</a>
              <a href="/create" className="button">Tambah Agunan</a>
              <a href="/nasabah" className="button secondary">Data Nasabah</a>
              <a href="/stock-opname" className="button secondary">Stock Opname</a>
              <a href="/reports" className="button secondary">Laporan</a>
              <a href="/audit" className="button secondary">Audit</a>
              <a href="/auth/login" className="button secondary">Login</a>
              <a href="/auth/register" className="button">Register</a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
