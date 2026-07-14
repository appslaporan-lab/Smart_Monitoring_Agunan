import type { Metadata } from 'next';
import './globals.css';
import { getCurrentUser } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Agunan Monitoring',
  description: 'Aplikasi monitoring agunan kredit dengan peringatan HER BPKB dan penyerahan brankas.',
};

type MenuItem = { href: string; label: string; roles: string[] | 'all' };

const MENU_CONFIG: MenuItem[] = [
  { href: '/', label: 'Dashboard', roles: 'all' },
  { href: '/create', label: 'Tambah Agunan', roles: ['ADM_KREDIT_PUSAT', 'ADM_KREDIT_CABANG', 'KEPALA_KAS'] },
  { href: '/nasabah', label: 'Data Nasabah', roles: ['ADM_KREDIT_PUSAT', 'ADM_KREDIT_CABANG', 'KEPALA_KAS', 'KASUBAG_PUSAT', 'KASUBAG_CABANG'] },
  { href: '/stock-opname', label: 'Stock Opname', roles: ['KASUBAG_PUSAT', 'KASUBAG_CABANG', 'KABAG_OPERASIONAL', 'PIMPINAN_CABANG', 'DIREKTUR'] },
  { href: '/reports', label: 'Laporan', roles: ['KASUBAG_PUSAT', 'KASUBAG_CABANG', 'KABAG_OPERASIONAL', 'PIMPINAN_CABANG', 'DIREKTUR'] },
  { href: '/audit', label: 'Audit', roles: ['KABAG_OPERASIONAL', 'PIMPINAN_CABANG', 'DIREKTUR'] },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();

  const visibleMenu = MENU_CONFIG.filter((item) => {
    if (!user) return false;
    return item.roles === 'all' || item.roles.includes(user.role);
  });

  return (
    <html lang="id">
      <body>
        <header className="app-header">
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '18px 0', flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem' }}>Agunan Monitoring</p>
              <span style={{ color: '#475569', fontSize: '0.95rem' }}>Sistem online untuk monitoring agunan kredit</span>
            </div>
            <nav style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              {visibleMenu.map((item) => (
                <a key={item.href} href={item.href} className="button secondary">{item.label}</a>
              ))}
              {user ? (
                <>
                  <span style={{ color: '#475569', fontSize: '0.9rem' }}>
                    {user.nama} ({user.role})
                  </span>
                  <form method="post" action="/auth/logout/api">
                    <button type="submit" className="button">Logout</button>
                  </form>
                </>
              ) : (
                <>
                  <a href="/auth/login" className="button secondary">Login</a>
                  <a href="/auth/register" className="button">Register</a>
                </>
              )}
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}