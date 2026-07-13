import { format } from 'date-fns';
import { prisma } from '../../../lib/prisma';

interface Params {
  params: { id: string };
}

export const metadata = {
  title: 'Detail Stock Opname',
};

async function getStockOpname(id: string) {
  return prisma.stockOpname.findUnique({
    where: { id: Number(id) },
    include: { agunan: true },
  });
}

export default async function StockOpnameDetailPage({ params }: Params) {
  const opname = await getStockOpname(params.id);

  if (!opname) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Stock Opname tidak ditemukan</h1>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Detail Stock Opname</h1>
      <div className="card">
        <p><strong>Agunan:</strong> {opname.agunan ? opname.agunan.kodeRegister : 'Tidak terkait'}</p>
        <p><strong>Pelaksana:</strong> {opname.pelaksana}</p>
        <p><strong>Tanggal:</strong> {format(new Date(opname.tanggal), 'dd MMM yyyy')}</p>
        <p><strong>Temuan:</strong> {opname.hasilTemuan}</p>
        <p><strong>Rekomendasi:</strong> {opname.rekomendasi}</p>
        <p><strong>Tindak lanjut:</strong> {opname.tindakLanjut}</p>
        <p><strong>Status tindak lanjut:</strong> {opname.statusTindakLanjut}</p>
        {opname.targetSelesai ? (
          <p><strong>Target selesai:</strong> {format(new Date(opname.targetSelesai), 'dd MMM yyyy')}</p>
        ) : null}
        {opname.catatan ? (
          <p><strong>Catatan:</strong> {opname.catatan}</p>
        ) : null}
      </div>
    </main>
  );
}
