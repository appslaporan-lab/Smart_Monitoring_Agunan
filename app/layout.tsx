import type { Metadata } from 'next';
import './globals.css';
import { getCurrentUser } from '@/lib/session';
import { LayoutDashboard, PlusCircle, Users, ClipboardCheck, FileText, ShieldCheck, LogOut, Shield, Archive, FileSignature, PackageOpen, CheckCircle2, UserCog } from 'lucide-react';
import Link from 'next/link';
import IdleLogout from '@/components/IdleLogout';

export const metadata: Metadata = {
  title: 'Agunan Monitoring',
  description: 'Aplikasi monitoring agunan kredit dengan peringatan HER BPKB dan penyerahan brankas.',
};
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

type MenuItem = { href: string; label: string; roles: string[] | 'all'; icon: any };

const MENU_CONFIG: MenuItem[] = [
  { href: '/superadmin/users', label: 'Approval User', roles: ['SUPERADMIN'], icon: UserCog },
  { href: '/', label: 'Dashboard', roles: 'all', icon: LayoutDashboard },
  { href: '/pengambilan', label: 'Pengambilan Agunan', roles: ['ADM_KREDIT_PUSAT', 'ADM_KREDIT_CABANG', 'KEPALA_KAS'], icon: PackageOpen },
  { href: '/approval', label: 'Approval', roles: ['KABAG_OPERASIONAL', 'PIMPINAN_CABANG', 'DIREKTUR', 'ADM_KREDIT_PUSAT', 'ADM_KREDIT_CABANG'], icon: CheckCircle2 },
  { href: '/create', label: 'Tambah Agunan', roles: ['ADM_KREDIT_PUSAT', 'ADM_KREDIT_CABANG', 'KEPALA_KAS'], icon: PlusCircle },
  { href: '/nasabah', label: 'Data Nasabah', roles: ['ADM_KREDIT_PUSAT', 'ADM_KREDIT_CABANG', 'KEPALA_KAS', 'KASUBAG_PUSAT', 'KASUBAG_CABANG'], icon: Users },
  { href: '/agunan', label: 'Data Agunan', roles: ['ADM_KREDIT_PUSAT', 'ADM_KREDIT_CABANG', 'KEPALA_KAS', 'KASUBAG_PUSAT', 'KASUBAG_CABANG'], icon: Archive },
  { href: '/berita-acara', label: 'Penyerahan Agunan', roles: ['ADM_KREDIT_PUSAT', 'ADM_KREDIT_CABANG', 'KEPALA_KAS', 'KASUBAG_PUSAT', 'KASUBAG_CABANG'], icon: FileSignature },
  { href: '/stock-opname', label: 'Stock Opname', roles: ['KASUBAG_PUSAT', 'KASUBAG_CABANG', 'KABAG_OPERASIONAL', 'PIMPINAN_CABANG', 'DIREKTUR'], icon: ClipboardCheck },
  { href: '/reports', label: 'Laporan', roles: ['KASUBAG_PUSAT', 'KASUBAG_CABANG', 'KABAG_OPERASIONAL', 'PIMPINAN_CABANG', 'DIREKTUR'], icon: FileText },
  { href: '/audit', label: 'Audit', roles: ['KABAG_OPERASIONAL', 'PIMPINAN_CABANG', 'DIREKTUR'], icon: ShieldCheck },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();

  const visibleMenu = MENU_CONFIG.filter((item) => {
    if (!user) return false;
    return item.roles === 'all' || item.roles.includes(user.role);
  });

  if (!user) {
    return (
      <html lang="id" suppressHydrationWarning>
        <body suppressHydrationWarning>
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <IdleLogout />
        <div className="app-layout">
          {/* Sidebar */}
          <aside className="app-sidebar">
            <div className="app-sidebar-header">
              <div className="app-logo">
                <div className="app-logo-icon">
                  <Shield size={20} />
                </div>
                Agunan App
              </div>
            </div>
            
            <nav className="app-sidebar-nav">
              {visibleMenu.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="sidebar-link">
                    <Icon />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="app-sidebar-footer">
              <div className="user-profile-widget">
                <div className="user-avatar">
                  {user.nama.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.nama}</span>
                  <span className="user-role">{user.role}</span>
                </div>
              </div>
              <form method="post" action="/auth/logout/api" style={{ marginTop: '16px' }}>
                <button type="submit" className="button secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <LogOut size={18} />
                  Logout
                </button>
              </form>
            </div>
          </aside>

          {/* Main Content */}
          <main className="app-main">
            <header className="app-topbar">
              <div>
                {/* Could place a breadcrumb or title here */}
              </div>
              <div className="topbar-actions">
                {/* Actions like notifications can go here */}
              </div>
            </header>
            <div className="app-content">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}