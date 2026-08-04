'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Shield } from 'lucide-react';

type MenuItem = { href: string; label: string; roles: string[] | 'all'; icon: any; module: string };
type ModuleDef = { key: string; label: string; icon: any; pathPrefix: string };

export default function ModuleSidebar({
  menuItems,
  modules,
  userNama,
  userRole,
}: {
  menuItems: MenuItem[];
  modules: ModuleDef[];
  userNama: string;
  userRole: string;
}) {
  const pathname = usePathname();

  const activeModuleKey =
    modules.find((m) => m.pathPrefix !== '/' && pathname.startsWith(m.pathPrefix))?.key || 'agunan';

  const visibleMenu = menuItems.filter((item) => item.module === activeModuleKey);

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
        {modules.map((m) => {
          const ModIcon = m.icon;
          const isActive = m.key === activeModuleKey;
          const firstItem = menuItems.find((item) => item.module === m.key);
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