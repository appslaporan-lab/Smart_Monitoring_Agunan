import { format } from 'date-fns';
import Link from 'next/link';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Laporan Stock Opname',
};

async function getStockOpnames() {
  return prisma.stockOpname.findMany({
    orderBy: { tanggal: 'desc' },
    include: { agunan: true },
  });
}

export default async function StockOpnameReportPage() {
  const stockOpnames = await getStockOpnames();
  const pendingFollowUps = stockOpnames.filter((item) => item.statusTindakLanjut !== 'SELESAI');
  const overdueFollowUps = pendingFollowUps.filter(
    (item) => item.targetSelesai && new Date(item.targetSelesai) <= new Date(),
  );

  const statusCounts = stockOpnames.reduce<Record<string, number>>((acc, item) => {
    acc[item.statusTindakLanjut] = (acc[item.statusTindakLanjut] || 0) + 1;
    return acc;
  }, {});

  const pelaksanaCounts = stockOpnames.reduce<Record<string, number>>((acc, item) => {
    acc[item.pelaksana] = (acc[item.pelaksana] || 0) + 1;
    return acc;
  }, {});

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1>Laporan Stock Opname</h1>
          <p>Ringkasan OJK/SPI dan tindak lanjut agunan.</p>
        </div>
        <Link href="/stock-opname" className="button secondary">
          Kembali ke Stock Opname
        </Link>
      </div>

      <div className="grid" style={{ gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <h2>Ringkasan</h2>
          <p>Total Stock Opname: {stockOpnames.length}</p>
          <p>Pending tindak lanjut: {pendingFollowUps.length}</p>
          <p>Overdue tindak lanjut: {overdueFollowUps.length}</p>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h2>Distribusi Status</h2>
          {Object.keys(statusCounts).length === 0 ? (
            <p>Tidak ada data status.</p>
          ) : (
            <ul>
              {Object.entries(statusCounts).map(([status, count]) => (
                <li key={status}>{status.replace(/_/g, ' ')}: {count}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h2>Distribusi Pelaksana</h2>
          {Object.keys(pelaksanaCounts).length === 0 ? (
            <p>Tidak ada pelaksana.</p>
          ) : (
            <ul>
              {Object.entries(pelaksanaCounts).map(([pelaksana, count]) => (
                <li key={pelaksana}>{pelaksana}: {count}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h2>Follow up yang perlu tindakan</h2>
        {pendingFollowUps.length === 0 ? (
          <p>Tidak ada tindak lanjut yang tertunda.</p>
        ) : (
          <ul>
            {pendingFollowUps.map((item) => (
              <li key={item.id} style={{ marginBottom: 10 }}>
                {item.agunan ? item.agunan.kodeRegister : 'Agunan tidak terkait'} - {item.tindakLanjut.replace(/_/g, ' ')}
                {item.targetSelesai ? `, target selesai: ${format(new Date(item.targetSelesai), 'dd MMM yyyy')}` : ''}
                {' '}
                <Link href={`/stock-opname/${item.id}`} className="button secondary" style={{ marginLeft: 8 }}>
                  Ubah status
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
