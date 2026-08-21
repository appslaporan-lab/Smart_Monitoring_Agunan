import type { Metadata } from 'next';
import './globals.css';
import { getCurrentUser } from '@/lib/session';
import IdleLogout from '@/components/IdleLogout';
import PasswordExpiryNotice from '@/components/PasswordExpiryNotice';
import ModuleSidebar from '@/components/ModuleSidebar';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Smart Monitoring',
  description: 'Sistem informasi terpadu: monitoring agunan, collecting kredit, KPI, dan performa kantor.',
};
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

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
          <ModuleSidebar userNama={user.nama} userRole={user.role} />

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