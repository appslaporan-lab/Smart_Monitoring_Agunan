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
  outstanding: number;
  moName: string;
  productBucket: string;
  interestRateBucket: string;
  tenorBucket: string;
  arrearsBucket: string;
  plafondBucket: string;
  collateralBucket: string;
  radiusBucket: string;
};

function createChartBars(labels: string[], values: number[]) {
  const max = Math.max(...values, 1);
  return labels.map((label, index) => ({
    label,
    value: values[index],
    width: `${(values[index] / max) * 100}%`,
  }));
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

type SummaryRow = {
  label: string;
  total: number;
  nonNplCount: number;
  nonNplNominal: number;
  nplCount: number;
  nplNominal: number;
  totalNominal: number;
};

function renderSummaryTable(title: string, rows: SummaryRow[]) {
  // Hitung Grand Total dari semua baris yang ada
  const grandTotal = rows.reduce(
    (acc, row) => {
      acc.total += row.total;
      acc.nonNplCount += row.nonNplCount;
	  acc.nonNplNominal += row.nonNplNominal;
      acc.nplCount += row.nplCount;     
      acc.nplNominal += row.nplNominal;
      acc.totalNominal += row.totalNominal;
      return acc;
    },
    {
      total: 0,
      nonNplCount: 0,
	  nonNplNominal: 0,
      nplCount: 0,      
      nplNominal: 0,
      totalNominal: 0,
    }
  );

    const grandTotalPercentage = grandTotal.totalNominal
    ? ((grandTotal.nplNominal / grandTotal.totalNominal) * 100).toFixed(2)
    : '0.00';

  return (
    <section className="card" style={{ padding: 24, marginBottom: 24 }}>
      <h2>{title}</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '2px solid #e2e8f0' }}>Label</th>
              <th style={{ textAlign: 'right', padding: 8, borderBottom: '2px solid #e2e8f0' }}>Total Rekening</th>
              <th style={{ textAlign: 'right', padding: 8, borderBottom: '2px solid #e2e8f0' }}>Non NPL Rek</th>
	      <th style={{ textAlign: 'right', padding: 8, borderBottom: '2px solid #e2e8f0' }}>Non NPL Nominal</th>
              <th style={{ textAlign: 'right', padding: 8, borderBottom: '2px solid #e2e8f0' }}>NPL Rek</th>              
              <th style={{ textAlign: 'right', padding: 8, borderBottom: '2px solid #e2e8f0' }}>NPL Nominal</th>
              <th style={{ textAlign: 'right', padding: 8, borderBottom: '2px solid #e2e8f0' }}>Total Nominal</th>
              <th style={{ textAlign: 'right', padding: 8, borderBottom: '2px solid #e2e8f0' }}>% NPL</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.label} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: 8 }}>{item.label}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{item.total}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{item.nonNplCount}</td>
		<td style={{ padding: 8, textAlign: 'right' }}>{formatRupiah(item.nonNplNominal)}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{item.nplCount}</td>                
                <td style={{ padding: 8, textAlign: 'right' }}>{formatRupiah(item.nplNominal)}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{formatRupiah(item.totalNominal)}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>
                  {item.totalNominal ? ((item.nplNominal / item.totalNominal) * 100).toFixed(2) : '0.00'}%
                </td>
              </tr>
            ))}
          </tbody>
          {/* Tambahan TFOOT untuk Grand Total */}
          <tfoot>
            <tr style={{ fontWeight: 'bold', backgroundColor: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
              <td style={{ padding: 8 }}>Grand Total</td>
              <td style={{ padding: 8, textAlign: 'right' }}>{grandTotal.total}</td>
              <td style={{ padding: 8, textAlign: 'right' }}>{grandTotal.nonNplCount}</td>
	      <td style={{ padding: 8, textAlign: 'right' }}>{formatRupiah(grandTotal.nonNplNominal)}</td>
              <td style={{ padding: 8, textAlign: 'right' }}>{grandTotal.nplCount}</td>              
              <td style={{ padding: 8, textAlign: 'right' }}>{formatRupiah(grandTotal.nplNominal)}</td>
              <td style={{ padding: 8, textAlign: 'right' }}>{formatRupiah(grandTotal.totalNominal)}</td>
              <td style={{ padding: 8, textAlign: 'right' }}>{grandTotalPercentage}%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

export default async function PerformaKolektibilitasPage() {
  const user = getCurrentUser();
  if (!user) redirect('/auth/login');

    const periodeAktif = await prisma.periodeNominatif.findFirst({
    where: { jenisUpload: 'PERFORM_KOLEKTIBILITAS' },
    orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
  });

  if (!periodeAktif) {
    
  const matrixRadiusRanges = [
    { label: '1-10 KM', min: 0, max: 10 },
    { label: '11-20 KM', min: 11, max: 20 },
    { label: '21-30 KM', min: 21, max: 30 },
    { label: '31-50 KM', min: 31, max: 50 },
    { label: '51-100 KM', min: 51, max: 100 },
    { label: '>100 KM', min: 101 },
  ];
  
  const matrixTunggakanRanges = [
    { label: '0 - 15 Hari', min: 0, max: 15 },
    { label: '16 - 30 Hari', min: 16, max: 30 },
    { label: '31 - 60 Hari', min: 31, max: 60 },
    { label: '61 - 90 Hari', min: 61, max: 90 },
    { label: '91 - 120 Hari', min: 91, max: 120 },
    { label: '120 - 180 Hari', min: 121, max: 180 },
    { label: '> 181 Hari', min: 181 },
  ];

  const matrixData = matrixTunggakanRanges.map(tRow => {
    const rowEntries = rows.filter(r => classifyByRange(r.hariTunggakan, matrixTunggakanRanges) === tRow.label);
    const rowRadiusData = matrixRadiusRanges.map(rCol => {
      const cellEntries = rowEntries.filter(r => classifyByRange(r.jarakKantorKm || 0, matrixRadiusRanges) === rCol.label);
      return cellEntries.reduce((sum, r) => sum + (r.outstanding || 0), 0);
    });
    const rowTotal = rowRadiusData.reduce((a, b) => a + b, 0);
    return {
      label: tRow.label,
      columns: rowRadiusData,
      total: rowTotal
    };
  });

  const overallMatrixTotal = matrixData.reduce((sum, r) => sum + r.total, 0);
  const matrixColTotals = matrixRadiusRanges.map((_, colIdx) => matrixData.reduce((sum, r) => sum + r.columns[colIdx], 0));

  return (
    <main className="container">
        <section style={{ marginBottom: 24 }}>
          <h1>Laporan Kolektibilitas</h1>
          <p>Belum ada data nominatif yang diupload.</p>
        </section>
      
      <section className="card" style={{ padding: 24, marginBottom: 24, overflowX: 'auto' }}>
        <h2>Matrix Range Tunggakan vs Radius (Nominal Outstanding)</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ backgroundColor: '#db2777', color: 'white' }}>
              <th rowSpan={2} style={{ padding: 8, border: '1px solid #94a3b8', textAlign: 'left', minWidth: '150px' }}>RANGE TUNGGAKAN HARI</th>
              <th colSpan={matrixRadiusRanges.length} style={{ padding: 8, border: '1px solid #94a3b8', textAlign: 'center' }}>RANGE RADIUS</th>
              <th rowSpan={2} style={{ padding: 8, border: '1px solid #94a3b8', minWidth: '150px' }}>Grand Total</th>
              <th rowSpan={2} style={{ padding: 8, border: '1px solid #94a3b8' }}>%</th>
            </tr>
            <tr style={{ backgroundColor: '#f472b6', color: 'white' }}>
              {matrixRadiusRanges.map(col => (
                <th key={col.label} style={{ padding: 8, border: '1px solid #94a3b8' }}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrixData.map(row => (
              <tr key={row.label}>
                <td style={{ padding: 8, border: '1px solid #cbd5e1', textAlign: 'left', fontWeight: 600 }}>{row.label}</td>
                {row.columns.map((val, idx) => (
                  <td key={idx} style={{ padding: 8, border: '1px solid #cbd5e1' }}>{val === 0 ? '-' : formatRupiah(val)}</td>
                ))}
                <td style={{ padding: 8, border: '1px solid #cbd5e1', fontWeight: 600 }}>{formatRupiah(row.total)}</td>
                <td style={{ padding: 8, border: '1px solid #cbd5e1' }}>{overallMatrixTotal > 0 ? ((row.total / overallMatrixTotal) * 100).toFixed(2) : '0.00'}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#0ea5e9', color: 'white', fontWeight: 'bold' }}>
              <td style={{ padding: 8, border: '1px solid #94a3b8', textAlign: 'left' }}>Grand Total</td>
              {matrixColTotals.map((val, idx) => (
                <td key={idx} style={{ padding: 8, border: '1px solid #94a3b8' }}>{formatRupiah(val)}</td>
              ))}
              <td style={{ padding: 8, border: '1px solid #94a3b8' }}>{formatRupiah(overallMatrixTotal)}</td>
              <td style={{ padding: 8, border: '1px solid #94a3b8' }}>100.00%</td>
            </tr>
          </tfoot>
        </table>
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
    outstanding: row.outstanding ?? 0,
    moName: normalizeMoName(row.namaAO),
    productBucket: row.produkKredit || "Tidak diketahui",
    interestRateBucket: classifyByRange(row.sukuBunga, COLLECTING_REPORT_CONFIG.interestRateRanges),
    tenorBucket: classifyByRange(row.jangkaBulan, COLLECTING_REPORT_CONFIG.tenorRanges),
    arrearsBucket: classifyByRange(row.hariTunggakan, COLLECTING_REPORT_CONFIG.arrearsRanges),
    plafondBucket: classifyByRange(row.plafon, COLLECTING_REPORT_CONFIG.plafondRanges),
    collateralBucket: row.jenisJaminan || "Tidak diketahui",
	radiusBucket: classifyByRange(row.jarakKantorKm, [{label: "< 10 km", min:0, max:9}, {label: "10 - 20 km", min:10, max:20}, {label: "> 20 km", min:21}]),
  }));

  const subKantorSummary = new Map<string, { nplCount: number; nonNplCount: number; nplNominal: number; nonNplNominal: number; total: number; totalNominal: number }>();
  for (const row of reportRows) {
    const key = row.subKantor || 'Tidak Diketahui';
    const current = subKantorSummary.get(key) || { nplCount: 0, nonNplCount: 0, nplNominal: 0, nonNplNominal: 0, total: 0, totalNominal: 0 };
    current.total += 1;
    current.totalNominal += row.outstanding;
    if (row.isNpl) {
      current.nplCount += 1;
      current.nplNominal += row.outstanding;
    } else {
      current.nonNplCount += 1;
      current.nonNplNominal += row.outstanding;
    }
    subKantorSummary.set(key, current);
  }
  
  // Format Map menjadi Array agar bisa dipakai di renderSummaryTable
  const formattedSubKantorSummary = Array.from(subKantorSummary.entries()).map(([label, value]) => ({
    label,
    total: value.total,
    nonNplCount: value.nonNplCount,
	nonNplNominal: value.nonNplNominal,
    nplCount: value.nplCount,    
    nplNominal: value.nplNominal,
    totalNominal: value.totalNominal,
  }));

  const groupSummary = new Map<string, { total: number; nplCount: number; nonNplCount: number; nplNominal: number; nonNplNominal: number; totalNominal: number }>();
  for (const row of reportRows) {
    const key = row.kantorLabel;
    const current = groupSummary.get(key) || { total: 0, nplCount: 0, nonNplCount: 0, nplNominal: 0, nonNplNominal: 0, totalNominal: 0 };
    current.total += 1;
    current.totalNominal += row.outstanding;
    if (row.isNpl) {
      current.nplCount += 1;
      current.nplNominal += row.outstanding;
    } else {
      current.nonNplCount += 1;
      current.nonNplNominal += row.outstanding;
    }
    groupSummary.set(key, current);
  }

  // Format Map menjadi Array agar bisa dipakai di renderSummaryTable
  const formattedGroupSummary = Array.from(groupSummary.entries()).map(([label, value]) => ({
    label,
    total: value.total,
    nonNplCount: value.nonNplCount,
	nonNplNominal: value.nonNplNominal,
    nplCount: value.nplCount,    
    nplNominal: value.nplNominal,
    totalNominal: value.totalNominal,
  }));

  const kantorGroups = ['Pusat 1', 'Pusat 2', 'Cabang'];
  const rowsByGroup = kantorGroups.map((group) => {
    const entries = reportRows.filter((row) => row.kantorLabel === group);
    return {
      group,
      total: entries.length,
      nplCount: entries.filter((row) => row.isNpl).length,
	  nplNominal: entries.filter((row) => row.isNpl).reduce((sum, row) => sum + row.outstanding, 0),
      nonNplCount: entries.filter((row) => !row.isNpl).length,      
      nonNplNominal: entries.filter((row) => !row.isNpl).reduce((sum, row) => sum + row.outstanding, 0),
      totalNominal: entries.reduce((sum, row) => sum + row.outstanding, 0),
    };
  });

  const moSummary = Array.from(new Map(reportRows.map((row) => [row.moName, 0])).keys()).map((mo) => {
    const entries = reportRows.filter((row) => row.moName === mo);
    return {
      label: mo,
      total: entries.length,
      nplCount: entries.filter((row) => row.isNpl).length,
	  nplNominal: entries.filter((row) => row.isNpl).reduce((sum, row) => sum + row.outstanding, 0),
      nonNplCount: entries.filter((row) => !row.isNpl).length,      
      nonNplNominal: entries.filter((row) => !row.isNpl).reduce((sum, row) => sum + row.outstanding, 0),
      totalNominal: entries.reduce((sum, row) => sum + row.outstanding, 0),
    };
  });

  const productSummary = Array.from(new Map(reportRows.map((row) => [row.productBucket, 0])).keys()).map((label) => {
    const entries = reportRows.filter((row) => row.productBucket === label);
    return {
      label,
      total: entries.length,
      nplCount: entries.filter((row) => row.isNpl).length,
	  nplNominal: entries.filter((row) => row.isNpl).reduce((sum, row) => sum + row.outstanding, 0),
      nonNplCount: entries.filter((row) => !row.isNpl).length,      
      nonNplNominal: entries.filter((row) => !row.isNpl).reduce((sum, row) => sum + row.outstanding, 0),
      totalNominal: entries.reduce((sum, row) => sum + row.outstanding, 0),
    };
  });

  const interestSummary = COLLECTING_REPORT_CONFIG.interestRateRanges.map((range) => {
    const entries = reportRows.filter((row) => row.interestRateBucket === range.label);
    return {
      label: range.label,
      total: entries.length,
      nplCount: entries.filter((row) => row.isNpl).length,
	  nplNominal: entries.filter((row) => row.isNpl).reduce((sum, row) => sum + row.outstanding, 0),
      nonNplCount: entries.filter((row) => !row.isNpl).length,      
      nonNplNominal: entries.filter((row) => !row.isNpl).reduce((sum, row) => sum + row.outstanding, 0),
      totalNominal: entries.reduce((sum, row) => sum + row.outstanding, 0),
    };
  });

  const tenorSummary = COLLECTING_REPORT_CONFIG.tenorRanges.map((range) => {
    const entries = reportRows.filter((row) => row.tenorBucket === range.label);
    return {
      label: range.label,
      total: entries.length,
      nplCount: entries.filter((row) => row.isNpl).length,
	  nplNominal: entries.filter((row) => row.isNpl).reduce((sum, row) => sum + row.outstanding, 0),
      nonNplCount: entries.filter((row) => !row.isNpl).length,      
      nonNplNominal: entries.filter((row) => !row.isNpl).reduce((sum, row) => sum + row.outstanding, 0),
      totalNominal: entries.reduce((sum, row) => sum + row.outstanding, 0),
    };
  });

  const arrearsSummary = COLLECTING_REPORT_CONFIG.arrearsRanges.map((range) => {
    const entries = reportRows.filter((row) => row.arrearsBucket === range.label);
    return {
      label: range.label,
      total: entries.length,
      nplCount: entries.filter((row) => row.isNpl).length,
	  nplNominal: entries.filter((row) => row.isNpl).reduce((sum, row) => sum + row.outstanding, 0),
      nonNplCount: entries.filter((row) => !row.isNpl).length,      
      nonNplNominal: entries.filter((row) => !row.isNpl).reduce((sum, row) => sum + row.outstanding, 0),
      totalNominal: entries.reduce((sum, row) => sum + row.outstanding, 0),
    };
  });

  const plafondSummary = COLLECTING_REPORT_CONFIG.plafondRanges.map((range) => {
    const entries = reportRows.filter((row) => row.plafondBucket === range.label);
    return {
      label: range.label,
      total: entries.length,
      nplCount: entries.filter((row) => row.isNpl).length,
	  nplNominal: entries.filter((row) => row.isNpl).reduce((sum, row) => sum + row.outstanding, 0),
      nonNplCount: entries.filter((row) => !row.isNpl).length,      
      nonNplNominal: entries.filter((row) => !row.isNpl).reduce((sum, row) => sum + row.outstanding, 0),
      totalNominal: entries.reduce((sum, row) => sum + row.outstanding, 0),
    };
  });

  const collateralSummary = Array.from(new Map(reportRows.map((row) => [row.collateralBucket, 0])).keys()).map((label) => {
    const entries = reportRows.filter((row) => row.collateralBucket === label);
    return {
      label,
      total: entries.length,
      nplCount: entries.filter((row) => row.isNpl).length,
	  nplNominal: entries.filter((row) => row.isNpl).reduce((sum, row) => sum + row.outstanding, 0),
      nonNplCount: entries.filter((row) => !row.isNpl).length,      
      nonNplNominal: entries.filter((row) => !row.isNpl).reduce((sum, row) => sum + row.outstanding, 0),
      totalNominal: entries.reduce((sum, row) => sum + row.outstanding, 0),
    };
  });
  
  const radiusSummary = Array.from(new Map(reportRows.map((row) => [row.radiusBucket, 0])).keys()).map((label) => {
    const entries = reportRows.filter((row) => row.radiusBucket === label);
    return {
      label,
      total: entries.length,
      nplCount: entries.filter((row) => row.isNpl).length,
	  nplNominal: entries.filter((row) => row.isNpl).reduce((sum, row) => sum + row.outstanding, 0),
      nonNplCount: entries.filter((row) => !row.isNpl).length,      
      nonNplNominal: entries.filter((row) => !row.isNpl).reduce((sum, row) => sum + row.outstanding, 0),
      totalNominal: entries.reduce((sum, row) => sum + row.outstanding, 0),
    };
  });

  return (
    <main className="container">
      <section style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Laporan Kolektibilitas</h1>
          <p>Periode {periodeAktif.bulan}/{periodeAktif.tahun}</p>
        </div>
        <Link href="/performa" className="button secondary">Kembali ke Performa</Link>
      </section>

      {/* Gunakan renderSummaryTable juga agar konsisten & ada Grand Total */}
      {renderSummaryTable('Ringkasan NPL per Kelompok Kantor', formattedGroupSummary)}
      {renderSummaryTable('Ringkasan NPL per Sub Kantor', formattedSubKantorSummary)}

      <section className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2>Grafik NPL per Kelompok Kantor</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {rowsByGroup.map((item) => {
            const bars = createChartBars(['NPL', 'Non NPL'], [item.nplCount, item.nonNplCount]);
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

      {renderSummaryTable('Non NPL vs NPL per MO', moSummary)}
      {renderSummaryTable('Non NPL vs NPL per Produk Kredit', productSummary)}
      {renderSummaryTable('Non NPL vs NPL per Range Suku Bunga', interestSummary)}
      {renderSummaryTable('Non NPL vs NPL per Range Tenor', tenorSummary)}
      {renderSummaryTable('Non NPL vs NPL per Range Hari Tunggakan', arrearsSummary)}
      {renderSummaryTable('Non NPL vs NPL per Range Plafond', plafondSummary)}
      {renderSummaryTable('Non NPL vs NPL per Kategori Jaminan', collateralSummary)}
	  {renderSummaryTable('Non NPL vs NPL per Kategori Radius', radiusSummary)}
    </main>
  );
}


