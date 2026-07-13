import { format } from 'date-fns';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tambah Stock Opname',
};

async function getAgunanOptions() {
  return prisma.agunan.findMany({ orderBy: { kodeRegister: 'asc' } });
}

export default async function CreateStockOpnamePage() {
  const agunanOptions = await getAgunanOptions();

  return (
    <main style={{ padding: 24 }}>
      <h1>Tambah Stock Opname</h1>
      <form method="post" action="/api/stock-opname">
        <div className="field">
          <label htmlFor="agunanId">Pilih Agunan</label>
          <select id="agunanId" name="agunanId" defaultValue="">
            <option value="">-- Pilih Agunan --</option>
            {agunanOptions.map((agunan) => (
              <option key={agunan.id} value={agunan.id}>{agunan.kodeRegister}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="pelaksana">Pelaksana</label>
          <select id="pelaksana" name="pelaksana" defaultValue="SPI" required>
            <option value="SPI">SPI</option>
            <option value="OJK">OJK</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="tanggal">Tanggal</label>
          <input id="tanggal" name="tanggal" type="date" required />
        </div>
        <div className="field">
          <label htmlFor="hasilTemuan">Hasil Temuan</label>
          <textarea id="hasilTemuan" name="hasilTemuan" rows={3} required />
        </div>
        <div className="field">
          <label htmlFor="rekomendasi">Rekomendasi</label>
          <textarea id="rekomendasi" name="rekomendasi" rows={3} required />
        </div>
        <div className="field">
          <label htmlFor="tindakLanjut">Tindak Lanjut</label>
          <select id="tindakLanjut" name="tindakLanjut" defaultValue="PERBAIKAN_ADMINISTRASI" required>
            <option value="PERBAIKAN_ADMINISTRASI">Perbaikan Administrasi</option>
            <option value="PENGAMANAN_ULANG">Pengamanan Ulang</option>
            <option value="PELAPORAN_MANAGEMENT">Pelaporan ke Manajemen</option>
            <option value="PEMANTAUAN">Pemantauan</option>
            <option value="LAINNYA">Lainnya</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="targetSelesai">Target Selesai</label>
          <input id="targetSelesai" name="targetSelesai" type="date" />
        </div>
        <div className="field">
          <label htmlFor="catatan">Catatan Tambahan</label>
          <textarea id="catatan" name="catatan" rows={3} />
        </div>
        <div>
          <button type="submit" className="button">Simpan Stock Opname</button>
        </div>
      </form>
    </main>
  );
}
