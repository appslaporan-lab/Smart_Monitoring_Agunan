import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import UserApprovalList from './UserApprovalList';

export const dynamic = 'force-dynamic';

export default async function SuperadminUsersPage() {
  const currentUser = getCurrentUser();
  if (!currentUser) redirect('/auth/login');
  if (currentUser.role !== 'SUPERADMIN') redirect('/');

  const pendingUsers = await prisma.user.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  });

  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="container">
      <section style={{ marginBottom: 32 }}>
        <h1>Approval User</h1>
        <p>Setujui atau tolak pendaftaran user baru.</p>
      </section>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2>Menunggu Persetujuan ({pendingUsers.length})</h2>
        {pendingUsers.length === 0 ? (
          <p>Tidak ada user yang menunggu persetujuan.</p>
        ) : (
          <UserApprovalList
            items={pendingUsers.map((u) => ({ id: u.id, nama: u.nama, username: u.username, role: u.role }))}
          />
        )}
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h2>Semua User</h2>
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          {allUsers.map((u) => (
            <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span>{u.nama} — {u.username} ({u.role})</span>
              <span className={`status-pill ${u.status === 'APPROVED' ? 'status-disetujui' : u.status === 'REJECTED' ? 'status-kembali' : 'status-pending'}`}>
                {u.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}