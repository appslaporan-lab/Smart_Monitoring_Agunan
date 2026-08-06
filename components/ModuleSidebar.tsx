'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LogOut, Shield, LayoutDashboard, PlusCircle, Users, ClipboardCheck,
  FileText, ShieldCheck, Archive, FileSignature, PackageOpen, CheckCircle2,
  UserCog, Wallet, TrendingUp, BarChart3,
} from 'lucide-react';

type MenuItem = { href: string; label: string; roles: string[] | 'all'; icon: any; module: string };
type ModuleDef = { key: string; label: string; icon: any; pathPrefix: string };

const MODULES: ModuleDef[] = [
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

  { href: '/collecting/upload', label: 'Upload Nominatif', roles: ['SUPERADMIN'], icon: PlusCircle, module: 'collecting' },
  { href: '/collecting/report', label: 'Laporan Kolektibilitas', roles: ['SUPERADMIN', 'KASUBAG_KREDIT_PUSAT_1', 'KASUBAG_KREDIT_PUSAT_2', 'KASUBAG_KREDIT_CABANG', 'KABAG_MARKETING_PUSAT_1', 'KABAG_MARKETING_PUSAT_2', 'PIMPINAN_CABANG', 'DIREKTUR', 'KABAG_OPERASIONAL'], icon: FileText, module: 'collecting' },

  { href: '/kpi', label: 'Dashboard KPI', roles: 'all', icon: LayoutDashboard, module: 'kpi' },

  { href: '/performa', label: 'Dashboard Performa', roles: 'all', icon: LayoutDashboard, module: 'performa' },
];

export default function ModuleSidebar({
  userNama,
  userRole,
}: {
  userNama: string;
  userRole: string;
}) {
  const pathname = usePathname();

  const visibleMenuAll = MENU_CONFIG.filter((item) => item.roles === 'all' || item.roles.includes(userRole));

  const activeModuleKey =
    MODULES.find((m) => m.pathPrefix !== '/' && pathname.startsWith(m.pathPrefix))?.key || 'agunan';

  const visibleMenu = visibleMenuAll.filter((item) => item.module === activeModuleKey);

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-header">
        <div className="app-logo">
          <div className="app-logo-icon">
            <Shield size={20} />
          </div>
          BPR Suite
        </div>
      </div>

      <div className="module-switcher">
        {MODULES.map((m) => {
          const ModIcon = m.icon;
          const isActive = m.key === activeModuleKey;
          const firstItem = visibleMenuAll.find((item) => item.module === m.key);
          return (
            <Link
              key={m.key}
              href={firstItem?.href || '/'}
              className={`module-switcher-item ${isActive ? 'active' : ''}`}
              title={m.label}
            >
              <ModIcon size={16} />
              <span>{m.label}</span>
            </Link>
          );
        })}
      </div>

      <nav className="app-sidebar-nav">
        {visibleMenu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="app-sidebar-footer">
        <div className="user-profile-widget">
          <div className="user-avatar">{userNama.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <span className="user-name">{userNama}</span>
            <span className="user-role">{userRole}</span>
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
  );
}