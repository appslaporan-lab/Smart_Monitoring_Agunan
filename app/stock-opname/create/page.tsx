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
    <main className="container">
      <section className="card" style={{ padding: 32 }}>
        <div className="page-header">
          <div>
            <p className="page-subtitle">Stock Opname</p>
            <h1>Tambah Stock Opname</h1>
          </div>
        </div>

        <form method="post" action="/api/stock-opname" className="form-grid">
          <div className="field">
            <label htmlFor="agunanId" className="form-label">Pilih Agunan</label>
            <select id="agunanId" name="agunanId" defaultValue="" className="inputField" required>
              <option value="">-- Pilih Agunan --</option>
              {agunanOptions.map((agunan) => (
                <option key={agunan.id} value={agunan.id}>{agunan.kodeRegister}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="pelaksana" className="form-label">Pelaksana</label>
            <select id="pelaksana" name="pelaksana" defaultValue="SPI" className="inputField" required>
              <option value="SPI">SPI</option>
              <option value="OJK">OJK</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="tanggal" className="form-label">Tanggal</label>
            <input id="tanggal" name="tanggal" type="date" className="inputField" required />
          </div>

          <div className="field full-width">
            <label htmlFor="hasilTemuan" className="form-label">Hasil Temuan</label>
            <textarea id="hasilTemuan" name="hasilTemuan" rows={4} className="inputField" required />
          </div>

          <div className="field full-width">
            <label htmlFor="rekomendasi" className="form-label">Rekomendasi</label>
            <textarea id="rekomendasi" name="rekomendasi" rows={4} className="inputField" required />
          </div>

          <div className="field">
            <label htmlFor="tindakLanjut" className="form-label">Tindak Lanjut</label>
            <select id="tindakLanjut" name="tindakLanjut" defaultValue="PERBAIKAN_ADMINISTRASI" className="inputField" required>
              <option value="PERBAIKAN_ADMINISTRASI">Perbaikan Administrasi</option>
              <option value="PENGAMANAN_ULANG">Pengamanan Ulang</option>
              <option value="PELAPORAN_MANAGEMENT">Pelaporan ke Manajemen</option>
              <option value="PEMANTAUAN">Pemantauan</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="targetSelesai" className="form-label">Target Selesai</label>
            <input id="targetSelesai" name="targetSelesai" type="date" className="inputField" />
          </div>

          <div className="field full-width">
            <label htmlFor="catatan" className="form-label">Catatan Tambahan</label>
            <textarea id="catatan" name="catatan" rows={4} className="inputField" />
          </div>

          <div className="form-actions full-width">
            <button type="submit" className="button">Simpan Stock Opname</button>
          </div>
        </form>
      </section>
    </main>
  );
}
