import { format } from 'date-fns';
import Link from 'next/link';
import { prisma } from '../../lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Stock Opname',
};

async function getStockOpnames() {
  return prisma.stockOpname.findMany({
    orderBy: { tanggal: 'desc' },
    include: { agunan: true },
  });
}

export default async function StockOpnamePage() {
  const stockOpnames = await getStockOpnames();

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1>Stock Opname</h1>
          <p>Daftar stock opname OJK/SPI dan tindak lanjut.</p>
        </div>
        <Link href="/stock-opname/create" className="button">
          Tambah Stock Opname
        </Link>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {stockOpnames.map((item) => (
          <div key={item.id} className="card">
            <h2>{item.agunan ? item.agunan.kodeRegister : 'Agunan tidak terkait'}</h2>
            <p>
              <strong>Pelaksana:</strong> {item.pelaksana}
            </p>
            <p>
              <strong>Tanggal:</strong> {format(new Date(item.tanggal), 'dd MMM yyyy')}
            </p>
            <p>
              <strong>Temuan:</strong> {item.hasilTemuan}
            </p>
            <p>
              <strong>Rekomendasi:</strong> {item.rekomendasi}
            </p>
            <p>
              <strong>Status TL:</strong> {item.statusTindakLanjut}
            </p>
            {item.targetSelesai ? (
              <p><strong>Target selesai:</strong> {format(new Date(item.targetSelesai), 'dd MMM yyyy')}</p>
            ) : null}
            <Link href={`/stock-opname/${item.id}`} className="button secondary">
              Lihat detail
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
