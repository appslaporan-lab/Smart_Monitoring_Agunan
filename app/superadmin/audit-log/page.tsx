import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Activity } from 'lucide-react';
import TableSearch from '@/components/TableSearch';
import ExportExcelButton from '@/components/ExportExcelButton';
import EmptyState from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

export default async function AuditLogPage() {
  const currentUser = getCurrentUser();
  if (!currentUser) redirect('/auth/login');
  if (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'DIREKSI' && currentUser.role !== 'DIREKTUR') {
    redirect('/');
  }

  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1000 // Limit to 1000 for safety, ideal is pagination
  });

  const excelData = logs.map(l => ({
    'Waktu': new Date(l.createdAt).toLocaleString('id-ID'),
    'Aktor': l.username || 'System',
    'Role': l.role || '-',
    'Aksi': l.action,
    'Entitas': l.entity || '-',
    'ID Entitas': l.entityId || '-',
    'Detail': l.details || '-'
  }));

  return (
    <main className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Activity size={28} color="#0f172a" />
        <div>
          <h1 style={{ margin: 0 }}>Log Aktivitas (Audit Trail)</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Rekam jejak tindakan penting di dalam sistem.</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <EmptyState title="Belum ada aktivitas" description="Log aktivitas sistem akan muncul di sini." />
      ) : (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
            <TableSearch tableId="table-audit" placeholder="Cari aksi, nama, atau detail..." />
            <ExportExcelButton data={excelData} fileName="Audit_Log" sheetName="Log" />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table id="table-audit" className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Waktu</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Aktor</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Aksi</th>
                  <th style={{ borderBottom: '2px solid #e2e8f0', padding: '12px' }}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                      {new Date(l.createdAt).toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <strong>{l.username || 'System'}</strong><br/>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{l.role || '-'}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: 4, fontSize: '0.85rem', fontWeight: 500 }}>
                        {l.action}
                      </span>
                      {l.entity && (
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                          {l.entity} #{l.entityId}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.9rem' }}>{l.details || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
