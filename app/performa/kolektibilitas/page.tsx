import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { getKantorLabel, getKantorGroup } from '@/lib/kantor';
import { COLLECTING_REPORT_CONFIG, classifyByKeywords, classifyByRange, normalizeMoName } from '@/lib/collecting-report-config';

export const dynamic = 'force-dynamic';

type ReportRow = {
  subKantor: string | null;
  kantorGroup: string | null;
  kantorLabel: string;
  kol: string | null;
  isNpl: boolean;
  moName: string;
  productBucket: string;
  interestRateBucket: string;
  tenorBucket: string;
  arrearsBucket: string;
  plafondBucket: string;
  collateralBucket: string;
};

function createChartBars(labels: string[], values: number[]) {
  const max = Math.max(...values, 1);
  return labels.map((label, index) => ({
    label,
    value: values[index],
    width: `${(values[index] / max) * 100}%`,
  }));
}

export default async function PerformaKolektibilitasPage() {
  const user = getCurrentUser();
  if (!user) redirect('/auth/login');

  const periodeAktif = await prisma.periodeNominatif.findFirst({
    where: { jenisUpload: 'PERFORM_KOLEKTIBILITAS' },
    orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
  });

  if (!periodeAktif) {
    return (
      <main className="container">
        <section style={{ marginBottom: 24 }}>
          <h1>Laporan Kolektibilitas</h1>
          <p>Belum ada data nominatif yang diupload.</p>
        </section>
      </main>
    );
  }

  const rows = await prisma.pinjamanPeriode.findMany({
    where: { periodeId: periodeAktif.id },
    orderBy: { id: 'asc' },
  });

  const reportRows: ReportRow[] = rows.map((row) => ({
    subKantor: row.subKantor,
    kantorGroup: getKantorGroup(row.subKantor),
    kantorLabel: getKantorLabel(row.subKantor),
    kol: row.kdKolektibilitas,
    isNpl: !!row.kdKolektibilitas && COLLECTING_REPORT_CONFIG.nplCodes.includes(String(row.kdKolektibilitas).trim().toUpperCase()),
    moName: normalizeMoName(row.namaAO),
    productBucket: classifyByKeywords(row.produkKredit || row.namaKategoriDebitur, COLLECTING_REPORT_CONFIG.creditProductCategories),
    interestRateBucket: classifyByRange(row.plafon ? 0 : null, COLLECTING_REPORT_CONFIG.interestRateRanges),
    tenorBucket: classifyByRange(row.jangkaBulan, COLLECTING_REPORT_CONFIG.tenorRanges),
    arrearsBucket: classifyByRange(row.hariTunggakan, COLLECTING_REPORT_CONFIG.arrearsRanges),
    plafondBucket: classifyByRange(row.plafon, COLLECTING_REPORT_CONFIG.plafondRanges),
    collateralBucket: classifyByKeywords(row.namaKategoriDebitur, COLLECTING_REPORT_CONFIG.collateralCategories),
  }));

  const groupSummary = new Map<string, { total: number; npl: number; nonNpl: number }>();
  for (const row of reportRows) {
    const key = row.kantorLabel;
    const current = groupSummary.get(key) || { total: 0, npl: 0, nonNpl: 0 };
    current.total += 1;
    if (row.isNpl) current.npl += 1; else current.nonNpl += 1;
    groupSummary.set(key, current);
  }

  const kantorGroups = ['Pusat 1', 'Pusat 2', 'Cabang'];
  const rowsByGroup = kantorGroups.map((group) => {
    const entries = reportRows.filter((row) => row.kantorLabel === group);
    return { group, total: entries.length, npl: entries.filter((row) => row.isNpl).length, nonNpl: entries.filter((row) => !row.isNpl).length };
  });

  const moSummary = Array.from(new Map(reportRows.map((row) => [row.moName, 0])).keys()).map((mo) => {
    const entries = reportRows.filter((row) => row.moName === mo);
    return { mo, total: entries.length, npl: entries.filter((row) => row.isNpl).length, nonNpl: entries.filter((row) => !row.isNpl).length };
  });

  const productSummary = COLLECTING_REPORT_CONFIG.creditProductCategories.map((range) => ({
    label: range.label,
    total: reportRows.filter((row) => row.productBucket === range.label).length,
    npl: reportRows.filter((row) => row.productBucket === range.label && row.isNpl).length,
  }));

  const interestSummary = COLLECTING_REPORT_CONFIG.interestRateRanges.map((range) => ({
    label: range.label,
    total: reportRows.filter((row) => row.interestRateBucket === range.label).length,
    npl: reportRows.filter((row) => row.interestRateBucket === range.label && row.isNpl).length,
  }));

  const tenorSummary = COLLECTING_REPORT_CONFIG.tenorRanges.map((range) => ({
    label: range.label,
    total: reportRows.filter((row) => row.tenorBucket === range.label).length,
    npl: reportRows.filter((row) => row.tenorBucket === range.label && row.isNpl).length,
  }));

  const arrearsSummary = COLLECTING_REPORT_CONFIG.arrearsRanges.map((range) => ({
    label: range.label,
    total: reportRows.filter((row) => row.arrearsBucket === range.label).length,
    npl: reportRows.filter((row) => row.arrearsBucket === range.label && row.isNpl).length,
  }));

  const plafondSummary = COLLECTING_REPORT_CONFIG.plafondRanges.map((range) => ({
    label: range.label,
    total: reportRows.filter((row) => row.plafondBucket === range.label).length,
    npl: reportRows.filter((row) => row.plafondBucket === range.label && row.isNpl).length,
  }));

  const collateralSummary = COLLECTING_REPORT_CONFIG.collateralCategories.map((range) => ({
    label: range.label,
    total: reportRows.filter((row) => row.collateralBucket === range.label).length,
    npl: reportRows.filter((row) => row.collateralBucket === range.label && row.isNpl).length,
  }));

  return (
    <main className="container">
      <section style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Laporan Kolektibilitas</h1>
          <p>Periode {periodeAktif.bulan}/{periodeAktif.tahun}</p>
        </div>
        <Link href="/performa" className="button secondary">Kembali ke Performa</Link>
      </section>

      <section className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2>Ringkasan NPL per Kantor</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e2e8f0' }}>Kantor</th>
                <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #e2e8f0' }}>Total</th>
                <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #e2e8f0' }}>NPL</th>
                <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #e2e8f0' }}>Non NPL</th>
                <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #e2e8f0' }}>% NPL</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(groupSummary.entries()).map(([kantor, value]) => (
                <tr key={kantor}>
                  <td style={{ padding: 8 }}>{kantor}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>{value.total}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>{value.npl}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>{value.nonNpl}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>{value.total ? ((value.npl / value.total) * 100).toFixed(2) : '0.00'}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2>Grafik NPL per Kelompok Kantor</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {rowsByGroup.map((item) => {
            const bars = createChartBars(['NPL', 'Non NPL'], [item.npl, item.nonNpl]);
            return (
              <div key={item.group}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: 6 }}>{item.group}</div>
                {bars.map((bar) => (
                  <div key={bar.label} style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: '0.8rem', marginBottom: 2 }}>{bar.label}: {bar.value}</div>
                    <div style={{ height: 10, background: '#e2e8f0', borderRadius: 999 }}>
                      <div style={{ width: bar.width, height: 10, background: bar.label === 'NPL' ? '#ef4444' : '#10b981', borderRadius: 999 }} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      <section className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2>Non NPL vs NPL per MO</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {moSummary.map((item) => {
            const bars = createChartBars(['NPL', 'Non NPL'], [item.npl, item.nonNpl]);
            return (
              <div key={item.mo}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: 6 }}>{item.mo}</div>
                {bars.map((bar) => (
                  <div key={bar.label} style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: '0.8rem', marginBottom: 2 }}>{bar.label}: {bar.value}</div>
                    <div style={{ height: 10, background: '#e2e8f0', borderRadius: 999 }}>
                      <div style={{ width: bar.width, height: 10, background: bar.label === 'NPL' ? '#ef4444' : '#10b981', borderRadius: 999 }} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      <section className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2>Non NPL vs NPL per Produk Kredit</h2>
        {productSummary.map((item) => (
          <div key={item.label} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>{item.label} <span>{item.total}</span></div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>NPL: {item.npl} | Non NPL: {item.total - item.npl}</div>
          </div>
        ))}
      </section>

      <section className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2>Non NPL vs NPL per Range Suku Bunga</h2>
        {interestSummary.map((item) => (
          <div key={item.label} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>{item.label} <span>{item.total}</span></div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>NPL: {item.npl} | Non NPL: {item.total - item.npl}</div>
          </div>
        ))}
      </section>

      <section className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2>Non NPL vs NPL per Range Tenor</h2>
        {tenorSummary.map((item) => (
          <div key={item.label} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>{item.label} <span>{item.total}</span></div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>NPL: {item.npl} | Non NPL: {item.total - item.npl}</div>
          </div>
        ))}
      </section>

      <section className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2>Non NPL vs NPL per Range Hari Tunggakan</h2>
        {arrearsSummary.map((item) => (
          <div key={item.label} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>{item.label} <span>{item.total}</span></div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>NPL: {item.npl} | Non NPL: {item.total - item.npl}</div>
          </div>
        ))}
      </section>

      <section className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2>Non NPL vs NPL per Range Plafond</h2>
        {plafondSummary.map((item) => (
          <div key={item.label} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>{item.label} <span>{item.total}</span></div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>NPL: {item.npl} | Non NPL: {item.total - item.npl}</div>
          </div>
        ))}
      </section>

      <section className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2>Non NPL vs NPL per Range Plafond</h2>
        {collateralSummary.map((item) => (
          <div key={item.label} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>{item.label} <span>{item.total}</span></div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>NPL: {item.npl} | Non NPL: {item.total - item.npl}</div>
          </div>
        ))}
      </section>
    </main>
  );
}
