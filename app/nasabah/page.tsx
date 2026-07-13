import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type NasabahWithAgunans = Prisma.NasabahGetPayload<{ include: { agunans: true } }>;

export default async function NasabahPage() {
  const nasabahs = await prisma.nasabah.findMany({
    include: { agunans: true },
    orderBy: { nama: 'asc' },
  }) as NasabahWithAgunans[];

  return (
    <main className="container">
      <section style={{ marginBottom: 32 }}>
        <h1>Data Nasabah</h1>
        <p>Daftar nasabah yang terdaftar beserta jumlah agunan yang dimiliki.</p>
      </section>

      <div className="card" style={{ padding: 24 }}>
        {nasabahs.length === 0 ? (
          <p>Belum ada data nasabah.</p>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {nasabahs.map((nasabah) => (
              <article key={nasabah.id} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <strong>{nasabah.nama}</strong>
                    <p>NIK: {nasabah.nik}</p>
                    <p>Telepon: {nasabah.telepon ?? '-'}</p>
                    <p>Alamat: {nasabah.alamat ?? '-'}</p>
                  </div>
                  <span className="status-pill status-pending">{nasabah.agunans.length} agunan</span>
                </div>
                {nasabah.agunans.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <h3>Agunan</h3>
                    <ul>
                      {nasabah.agunans.map((agunan: { id: number; kodeRegister: string; jenis: string }) => (
                        <li key={agunan.id}>
                          <Link href={`/agunan/${agunan.id}`}>{agunan.kodeRegister}</Link> — {agunan.jenis}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
