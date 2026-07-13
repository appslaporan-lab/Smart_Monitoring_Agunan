import Link from 'next/link';
import { readAuditLog } from '@/lib/audit';

export const metadata = {
  title: 'Audit Trail',
};

export default async function AuditPage() {
  const logs = await readAuditLog();

  return (
    <main className="container" style={{ paddingTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1>Audit Trail</h1>
          <p>Riwayat perubahan dan approval yang dilakukan pada agunan.</p>
        </div>
        <Link href="/reports" className="button secondary">Kembali ke Laporan</Link>
      </div>

      <section className="card" style={{ padding: 24, marginTop: 24 }}>
        {logs.length === 0 ? (
          <p>Belum ada catatan audit.</p>
        ) : (
          <ul>
            {logs.map((log: any) => (
              <li key={log.id} style={{ marginBottom: 12 }}>
                <strong>{log.agunanKodeRegister}</strong> — {log.action} oleh {log.actor}<br />
                <span style={{ color: '#64748b' }}>{log.details}</span><br />
                <small>{new Date(log.createdAt).toLocaleString('id-ID')}</small>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
