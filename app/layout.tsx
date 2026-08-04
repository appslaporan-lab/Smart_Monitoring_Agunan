import type { Metadata } from 'next';
import './globals.css';
import { getCurrentUser } from '@/lib/session';
import { LayoutDashboard, PlusCircle, Users, ClipboardCheck, FileText, ShieldCheck, LogOut, Shield, Archive, FileSignature, PackageOpen, CheckCircle2, UserCog, Wallet, TrendingUp, BarChart3 } from 'lucide-react';
import IdleLogout from '@/components/IdleLogout';
import PasswordExpiryNotice from '@/components/PasswordExpiryNotice';
import ModuleSidebar from '@/components/ModuleSidebar';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'BPR Suite',
  description: 'Sistem informasi terpadu: monitoring agunan, collecting kredit, KPI, dan performa kantor.',
};
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

type MenuItem = { href: string; label: string; roles: string[] | 'all'; icon: any; module: string };

const MODULES = [
  { key: 'agunan', label: 'Agunan Monitoring', icon: Shield, pathPrefix: '/' },
  { key: 'collecting', label: 'Collecting Kredit', icon: Wallet, pathPrefix: '/collecting' },
  { key: 'kpi', label: 'KPI', icon: TrendingUp, pathPrefix: '/kpi' },
  { key: 'performa', label: 'Performa Kantor', icon: BarChart3, pathPrefix: '/performa' },
];

const MENU_CONFIG: MenuItem[] = [
  { href: '/superadmin/users', label: 'Approval User', roles: ['SUPERADMIN'], icon: UserCog, module: 'agunan' },
  { href: '/', label: 'Dashboard', roles: 'all', icon: LayoutDashboard, module: 'agunan' },
  { href: '/auth/change-password', label: 'Ganti Password', roles: 'all', icon: Shield, module: 'agunan' },
  { href: '/pengambilan', label: 'Pengambilan Agunan', roles: ['ADM_KREDIT_PUSAT', 'ADM_KREDIT_CABANG', 'KEPALA_KAS'], icon: PackageOpen, module: 'agunan' },
  { href: '/approval', label: 'Approval', roles: ['KABAG_OPERASIONAL', 'PIMPINAN_CABANG', 'DIREKTUR', 'ADM_KREDIT_PUSAT', 'ADM_KREDIT_CABANG'], icon: CheckCircle2, module: 'agunan' },
  { href: '/create', label: 'Tambah Agunan', roles: ['ADM_KREDIT_PUSAT', 'ADM_KREDIT_CABANG', 'KEPALA_KAS'], icon: PlusCircle, module: 'agunan' },
  { href: '/nasabah', label: 'Data Nasabah', roles: ['ADM_KREDIT_PUSAT', 'ADM_KREDIT_CABANG', 'KEPALA_KAS', 'KASUBAG_PUSAT', 'KASUBAG_CABANG'], icon: Users, module: 'agunan' },
  { href: '/agunan', label: 'Data Agunan', roles: ['ADM_KREDIT_PUSAT', 'ADM_KREDIT_CABANG', 'KEPALA_KAS', 'KASUBAG_PUSAT', 'KASUBAG_CABANG'], icon: Archive, module: 'agunan' },
  { href: '/berita-acara', label: 'Penyerahan Agunan', roles: ['ADM_KREDIT_PUSAT', 'ADM_KREDIT_CABANG', 'KEPALA_KAS', 'KASUBAG_PUSAT', 'KASUBAG_CABANG'], icon: FileSignature, module: 'agunan' },
  { href: '/stock-opname', label: 'Stock Opname', roles: ['KASUBAG_PUSAT', 'KASUBAG_CABANG', 'KABAG_OPERASIONAL', 'PIMPINAN_CABANG', 'DIREKTUR'], icon: ClipboardCheck, module: 'agunan' },
  { href: '/reports', label: 'Laporan', roles: ['KASUBAG_PUSAT', 'KASUBAG_CABANG', 'KABAG_OPERASIONAL', 'PIMPINAN_CABANG', 'DIREKTUR'], icon: FileText, module: 'agunan' },
  { href: '/audit', label: 'Audit', roles: ['KABAG_OPERASIONAL', 'PIMPINAN_CABANG', 'DIREKTUR'], icon: ShieldCheck, module: 'agunan' },

  { href: '/collecting', label: 'Dashboard Collecting', roles: 'all', icon: LayoutDashboard, module: 'collecting' },

  { href: '/kpi', label: 'Dashboard KPI', roles: 'all', icon: LayoutDashboard, module: 'kpi' },

  { href: '/performa', label: 'Dashboard Performa', roles: 'all', icon: LayoutDashboard, module: 'performa' },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();
  let passwordNotice = null;

  if (user) {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordChangedAt: true } });
    if (dbUser?.passwordChangedAt) {
      const daysSinceChange = Math.floor((Date.now() - new Date(dbUser.passwordChangedAt).getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, 90 - daysSinceChange);
      passwordNotice = <PasswordExpiryNotice daysRemaining={daysRemaining} isExpired={daysRemaining <= 0} />;
    }
  }

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
          <ModuleSidebar
            menuItems={visibleMenu}
            modules={MODULES}
            userNama={user.nama}
            userRole={user.role}
          />

          <main className="app-main">
            <header className="app-topbar">
              <div />
              <div className="topbar-actions" />
            </header>
            <div className="app-content">
              {passwordNotice}
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}