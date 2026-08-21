import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { getKantorGroup } from '@/lib/kantor';
import { estimateJarakKantor } from '@/lib/mappingUtils';
import { COLLECTING_REPORT_CONFIG, classifyByRange } from '@/lib/collecting-report-config';

export const dynamic = 'force-dynamic';

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'decimal', maximumFractionDigits: 0 }).format(value);
}

function formatPercent(value: number) {
  return value.toFixed(2).replace('.', ',') + '%';
}

type SummaryRow = {
  label: string;
  nonNplNominal: number;
  nplNominal: number;
  totalNominal: number;
};

function renderPDFSummaryTable(title: string, rows: SummaryRow[]) {
  const grandTotal = rows.reduce(
    (acc, row) => {
      acc.nonNplNominal += row.nonNplNominal;
      acc.nplNominal += row.nplNominal;
      acc.totalNominal += row.totalNominal;
      return acc;
    },
    { nonNplNominal: 0, nplNominal: 0, totalNominal: 0 }
  );

  const grandTotalPercentage = grandTotal.totalNominal
    ? ((grandTotal.nplNominal / grandTotal.totalNominal) * 100)
    : 0;

  return (
    <section className="card" style={{ padding: 24, marginBottom: 24, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th rowSpan={3} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#e2e8f0' }}>KANTOR</th>
              <th colSpan={10} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#e2e8f0' }}>KOLEKTIBILITAS</th>
              <th colSpan={2} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#86efac' }}>NON NPL</th>
              <th colSpan={2} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#fca5a5' }}>NPL</th>
              <th rowSpan={3} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#e2e8f0' }}>Total NOA</th>
              <th rowSpan={3} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#e2e8f0' }}>Total OS</th>
              <th rowSpan={3} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#fef08a' }}>% NPL</th>
            </tr>
            <tr style={{ backgroundColor: '#e2e8f0' }}>
              <th colSpan={2} style={{ border: '1px solid #000' }}>1</th>
              <th colSpan={2} style={{ border: '1px solid #000' }}>2</th>
              <th colSpan={2} style={{ border: '1px solid #000' }}>3</th>
              <th colSpan={2} style={{ border: '1px solid #000' }}>4</th>
              <th colSpan={2} style={{ border: '1px solid #000' }}>5</th>
              <th colSpan={2} style={{ border: '1px solid #000', backgroundColor: '#86efac' }}></th>
              <th colSpan={2} style={{ border: '1px solid #000', backgroundColor: '#fca5a5' }}></th>
            </tr>
            <tr style={{ backgroundColor: '#e2e8f0' }}>
              <th style={{ border: '1px solid #000', padding: '4px' }}>NOA</th><th style={{ border: '1px solid #000', padding: '4px' }}>OS</th>
              <th style={{ border: '1px solid #000', padding: '4px' }}>NOA</th><th style={{ border: '1px solid #000', padding: '4px' }}>OS</th>
              <th style={{ border: '1px solid #000', padding: '4px' }}>NOA</th><th style={{ border: '1px solid #000', padding: '4px' }}>OS</th>
              <th style={{ border: '1px solid #000', padding: '4px' }}>NOA</th><th style={{ border: '1px solid #000', padding: '4px' }}>OS</th>
              <th style={{ border: '1px solid #000', padding: '4px' }}>NOA</th><th style={{ border: '1px solid #000', padding: '4px' }}>OS</th>
              <th style={{ border: '1px solid #000', padding: '4px', backgroundColor: '#86efac' }}>NOA</th><th style={{ border: '1px solid #000', padding: '4px', backgroundColor: '#86efac' }}>OS</th>
              <th style={{ border: '1px solid #000', padding: '4px', backgroundColor: '#fca5a5' }}>NOA</th><th style={{ border: '1px solid #000', padding: '4px', backgroundColor: '#fca5a5' }}>OS</th>
            </tr>
          </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.label}>
              <td style={{ padding: '4px 8px', border: '1px solid #000' }}>{item.label}</td>
              <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'right' }}>{item.nonNplNominal === 0 ? '-' : formatRupiah(item.nonNplNominal)}</td>
              <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'right' }}>{item.nplNominal === 0 ? '-' : formatRupiah(item.nplNominal)}</td>
              <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'right' }}>{item.totalNominal === 0 ? '-' : formatRupiah(item.totalNominal)}</td>
              <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'right' }}>
                {item.totalNominal ? formatPercent((item.nplNominal / item.totalNominal) * 100) : '0,00%'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: '#38bdf8', color: '#000', fontWeight: 'bold' }}>
            <td style={{ padding: '4px 8px', border: '1px solid #000' }}>Grand Total</td>
            <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'right' }}>{formatRupiah(grandTotal.nonNplNominal)}</td>
            <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'right' }}>{formatRupiah(grandTotal.nplNominal)}</td>
            <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'right' }}>{formatRupiah(grandTotal.totalNominal)}</td>
            <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'right' }}>{formatPercent(grandTotalPercentage)}</td>
          </tr>
        </tfoot>
      </table>
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
    { label: '> 181', min: 181 },
  ];

  const tenorPdfRanges = [
    { label: '1 - 12 Bulan', min: 1, max: 12 },
    { label: '13 - 24 Bulan', min: 13, max: 24 },
    { label: '25 - 36 Bulan', min: 25, max: 36 },
    { label: '37 - 48 Bulan', min: 37, max: 48 },
    { label: '49 - 60 Bulan', min: 49, max: 60 },
    { label: '61 - 90 Bulan', min: 61, max: 90 },
    { label: '> 91 Bulan', min: 91 },
  ];

  const plafondPdfRanges = [
    { label: '≤ 25 Juta', min: 0, max: 25000000 },
    { label: '26 - 40 Juta', min: 25000001, max: 40000000 },
    { label: '41 - 100 Juta', min: 40000001, max: 100000000 },
    { label: '101 - 150 Juta', min: 100000001, max: 150000000 },
    { label: '> 150 Juta', min: 150000001 },
  ];

  const bungaPdfRanges = [
    { label: '0,00 - 5,99', min: 0, max: 5.99 },
    { label: '6,00 - 6,99', min: 6, max: 6.99 },
    { label: '10,00 - 10,99', min: 10, max: 10.99 },
    { label: '11,00 - 12,50', min: 11, max: 12.5 },
    { label: '12,51 - 13,50', min: 12.51, max: 13.5 },
    { label: '13,51 - 15,50', min: 13.51, max: 15.5 },
    { label: '15,51 - 27,00', min: 15.51, max: 27 },
  ];

  
  const SUBKANTOR_NAME_MAP: Record<string, string> = {
    '01': 'PUSAT',
    '06': 'KAUMAN',
    '07': 'NGANTRU',
    '10': 'NGEMPLAK',
    '14': 'KARANGREJO',
    '03': 'NGUNUT',
    '05': 'KALIDAWIR',
    '09': 'REJOTANGAN',
    '12': 'PUCANGLABAN',
    '02': 'CAMPURDARAT',
    '04': 'BANDUNG',
    '08': 'BOYOLANGU',
    '13': 'PAKEL',
    '15': 'NGENTRONG'
  };

  const reportRows = rows.map((row) => {
    let subKantorCode = row.subKantor || '';
    if (subKantorCode.includes('-')) {
      subKantorCode = subKantorCode.split('-').pop()?.trim() || subKantorCode;
    } else {
      subKantorCode = subKantorCode.trim();
    }
    
    // Fallback if not numeric code, try to match by string, otherwise use the code
    let subKantorClean = SUBKANTOR_NAME_MAP[subKantorCode] || subKantorCode.toUpperCase();
    
    let kGroup = getKantorGroup(row.subKantor) || '';
    // Fix PUSAT_1 to PUSAT 1
    if (kGroup === 'PUSAT_1') kGroup = 'PUSAT 1';
    if (kGroup === 'PUSAT_2') kGroup = 'PUSAT 2';

    const kolStr = String(row.kdKolektibilitas || '').trim();
    return {
      subKantor: subKantorClean,
      kantorGroup: kGroup,

      kol: kolStr,
      isNpl: COLLECTING_REPORT_CONFIG.nplCodes.includes(kolStr.toUpperCase()),
      outstanding: row.outstanding ?? 0,
      moName: row.namaAO || '(blank)',
      productBucket: row.produkKredit || '(blank)',
      interestRateBucket: classifyByRange(row.sukuBunga, bungaPdfRanges),
      tenorBucket: classifyByRange(row.jangkaBulan, tenorPdfRanges),
      plafondBucket: classifyByRange(row.plafon, plafondPdfRanges),
      collateralBucket: row.jenisJaminan || '(blank)',
    };
  });

  // Calculate Matrix Tunggakan vs Radius
  const matrixData = matrixTunggakanRanges.map(tRow => {
    const rowEntries = rows.filter(r => classifyByRange(r.hariTunggakan, matrixTunggakanRanges) === tRow.label);
    const rowRadiusData = matrixRadiusRanges.map(rCol => {
      const cellEntries = rowEntries.filter(r => {
        // Hitung ulang secara dinamis untuk memastikan akurasi data lama
        const jarakReal = estimateJarakKantor(r.subKantor, JSON.parse(r.rawDataJson || '{}')['K'] || '');
        return classifyByRange(jarakReal, matrixRadiusRanges) === rCol.label;
      });
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

  // Generate generic summary tables
  function buildSummary(groupKey: keyof typeof reportRows[0], sortAlphabetical = true) {
    const keys = Array.from(new Set(reportRows.map(r => String(r[groupKey]))));
    if (sortAlphabetical) keys.sort();
    
    return keys.map(key => {
      const entries = reportRows.filter(r => String(r[groupKey]) === key);
      const nonNplNominal = entries.filter(r => !r.isNpl).reduce((sum, r) => sum + r.outstanding, 0);
      const nplNominal = entries.filter(r => r.isNpl).reduce((sum, r) => sum + r.outstanding, 0);
      return {
        label: key,
        nonNplNominal,
        nplNominal,
        totalNominal: nonNplNominal + nplNominal
      };
    });
  }

  const tenorSummary = tenorPdfRanges.map(range => {
    const entries = reportRows.filter(r => r.tenorBucket === range.label);
    const nonNplNominal = entries.filter(r => !r.isNpl).reduce((sum, r) => sum + r.outstanding, 0);
    const nplNominal = entries.filter(r => r.isNpl).reduce((sum, r) => sum + r.outstanding, 0);
    return { label: range.label, nonNplNominal, nplNominal, totalNominal: nonNplNominal + nplNominal };
  });

  const productSummary = buildSummary('productBucket');
  const plafondSummary = plafondPdfRanges.map(range => {
    const entries = reportRows.filter(r => r.plafondBucket === range.label);
    const nonNplNominal = entries.filter(r => !r.isNpl).reduce((sum, r) => sum + r.outstanding, 0);
    const nplNominal = entries.filter(r => r.isNpl).reduce((sum, r) => sum + r.outstanding, 0);
    return { label: range.label, nonNplNominal, nplNominal, totalNominal: nonNplNominal + nplNominal };
  });
  
  const bungaSummary = bungaPdfRanges.map(range => {
    const entries = reportRows.filter(r => r.interestRateBucket === range.label);
    const nonNplNominal = entries.filter(r => !r.isNpl).reduce((sum, r) => sum + r.outstanding, 0);
    const nplNominal = entries.filter(r => r.isNpl).reduce((sum, r) => sum + r.outstanding, 0);
    return { label: range.label, nonNplNominal, nplNominal, totalNominal: nonNplNominal + nplNominal };
  });

  const agunanSummary = buildSummary('collateralBucket');
  const aoSummary = buildSummary('moName');

  // Main Kolektibilitas Table Logic
  const kantorOrder = [
    { group: 'PUSAT 1', subKantors: ['PUSAT', 'KAUMAN', 'NGANTRU', 'NGEMPLAK', 'KARANGREJO'] },
    { group: 'PUSAT 2', subKantors: ['NGUNUT', 'KALIDAWIR', 'REJOTANGAN', 'PUCANGLABAN'] },
    { group: 'CABANG', subKantors: ['CAMPURDARAT', 'BANDUNG', 'BOYOLANGU', 'PAKEL', 'NGENTRONG'] }
  ];

  type KolStats = { noa: number; os: number };
  type MainTableRow = {
    kantor: string;
    k1: KolStats; k2: KolStats; k3: KolStats; k4: KolStats; k5: KolStats;
    nonNpl: KolStats; npl: KolStats; total: KolStats;
    isGroupTotal?: boolean;
    isGrandTotal?: boolean;
  };

  const mainTableRows: MainTableRow[] = [];
  const grandTotalStats = {
    k1: {noa:0, os:0}, k2: {noa:0, os:0}, k3: {noa:0, os:0}, k4: {noa:0, os:0}, k5: {noa:0, os:0},
    nonNpl: {noa:0, os:0}, npl: {noa:0, os:0}, total: {noa:0, os:0}
  };

  for (const group of kantorOrder) {
    const groupTotalStats = {
      k1: {noa:0, os:0}, k2: {noa:0, os:0}, k3: {noa:0, os:0}, k4: {noa:0, os:0}, k5: {noa:0, os:0},
      nonNpl: {noa:0, os:0}, npl: {noa:0, os:0}, total: {noa:0, os:0}
    };

    for (const sub of group.subKantors) {
      const entries = reportRows.filter(r => r.kantorGroup === group.group && (r.subKantor === sub || r.subKantor?.includes(sub)));
      
      const stats = {
        k1: {noa:0, os:0}, k2: {noa:0, os:0}, k3: {noa:0, os:0}, k4: {noa:0, os:0}, k5: {noa:0, os:0},
        nonNpl: {noa:0, os:0}, npl: {noa:0, os:0}, total: {noa:0, os:0}
      };

      for (const e of entries) {
        stats.total.noa++; stats.total.os += e.outstanding;
        if (e.isNpl) { stats.npl.noa++; stats.npl.os += e.outstanding; }
        else { stats.nonNpl.noa++; stats.nonNpl.os += e.outstanding; }

        if (e.kol === '1') { stats.k1.noa++; stats.k1.os += e.outstanding; }
        else if (e.kol === '2') { stats.k2.noa++; stats.k2.os += e.outstanding; }
        else if (e.kol === '3') { stats.k3.noa++; stats.k3.os += e.outstanding; }
        else if (e.kol === '4') { stats.k4.noa++; stats.k4.os += e.outstanding; }
        else if (e.kol === '5' || e.kol === '6') { stats.k5.noa++; stats.k5.os += e.outstanding; }
      }

      mainTableRows.push({ kantor: sub, ...stats });

      // Add to group total
      for (const k of ['k1','k2','k3','k4','k5','nonNpl','npl','total'] as const) {
        groupTotalStats[k].noa += stats[k].noa;
        groupTotalStats[k].os += stats[k].os;
        grandTotalStats[k].noa += stats[k].noa;
        grandTotalStats[k].os += stats[k].os;
      }
    }
    mainTableRows.push({ kantor: group.group, ...groupTotalStats, isGroupTotal: true });
  }
  mainTableRows.push({ kantor: 'Grand Total', ...grandTotalStats, isGrandTotal: true });

  const Cell = ({ v }: { v: KolStats }) => (
    <>
      <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'right' }}>{v.noa === 0 ? '-' : formatRupiah(v.noa)}</td>
      <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'right' }}>{v.os === 0 ? '-' : formatRupiah(v.os)}</td>
    </>
  );

  return (
    <main className="container">
      <section style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>LAPORAN PERFORM KOLEKTIBILITY</h1>
          <p style={{ fontWeight: 'bold' }}>JULI 2026</p>
        </div>
        <Link href="/performa" className="button secondary">Kembali ke Performa</Link>
      </section>

      {/* Main Table */}
      <section className="card" style={{ padding: 24, marginBottom: 24, overflowX: 'auto', fontSize: '13px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th rowSpan={2} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#e2e8f0' }}>KANTOR</th>
              <th colSpan={10} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#e2e8f0' }}>KOLEKTIBILITAS</th>
              <th colSpan={2} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#86efac' }}>NON NPL</th>
              <th colSpan={2} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#fca5a5' }}>NPL</th>
              <th colSpan={2} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#e2e8f0' }}>Total NOA / OS</th>
              <th rowSpan={2} style={{ padding: '4px 8px', border: '1px solid #000', backgroundColor: '#fef08a' }}>% NPL</th>
            </tr>
            <tr style={{ backgroundColor: '#e2e8f0' }}>
              <th colSpan={2} style={{ border: '1px solid #000' }}>1</th>
              <th colSpan={2} style={{ border: '1px solid #000' }}>2</th>
              <th colSpan={2} style={{ border: '1px solid #000' }}>3</th>
              <th colSpan={2} style={{ border: '1px solid #000' }}>4</th>
              <th colSpan={2} style={{ border: '1px solid #000' }}>5</th>
              <th style={{ border: '1px solid #000' }}>NOA</th><th style={{ border: '1px solid #000' }}>OS</th>
              <th style={{ border: '1px solid #000' }}>NOA</th><th style={{ border: '1px solid #000' }}>OS</th>
              <th style={{ border: '1px solid #000' }}>NOA</th><th style={{ border: '1px solid #000' }}>OS</th>
            </tr>
            <tr style={{ backgroundColor: '#e2e8f0' }}>
              <th style={{ border: '1px solid #000' }}></th>
              <th style={{ border: '1px solid #000' }}>NOA</th><th style={{ border: '1px solid #000' }}>OS</th>
              <th style={{ border: '1px solid #000' }}>NOA</th><th style={{ border: '1px solid #000' }}>OS</th>
              <th style={{ border: '1px solid #000' }}>NOA</th><th style={{ border: '1px solid #000' }}>OS</th>
              <th style={{ border: '1px solid #000' }}>NOA</th><th style={{ border: '1px solid #000' }}>OS</th>
              <th style={{ border: '1px solid #000' }}>NOA</th><th style={{ border: '1px solid #000' }}>OS</th>
              <th style={{ border: '1px solid #000' }}></th><th style={{ border: '1px solid #000' }}></th>
              <th style={{ border: '1px solid #000' }}></th><th style={{ border: '1px solid #000' }}></th>
              <th style={{ border: '1px solid #000' }}></th><th style={{ border: '1px solid #000' }}></th>
              <th style={{ border: '1px solid #000' }}></th>
            </tr>
          </thead>
          <tbody>
            {mainTableRows.map((r, i) => {
              const bg = r.isGrandTotal ? '#38bdf8' : r.isGroupTotal ? '#a7f3d0' : '#fff';
              const fw = r.isGroupTotal || r.isGrandTotal ? 'bold' : 'normal';
              return (
                <tr key={i} style={{ backgroundColor: bg, fontWeight: fw }}>
                  <td style={{ padding: '4px 8px', border: '1px solid #000' }}>{r.kantor}</td>
                  <Cell v={r.k1} /> <Cell v={r.k2} /> <Cell v={r.k3} /> <Cell v={r.k4} /> <Cell v={r.k5} />
                  <Cell v={r.nonNpl} /> <Cell v={r.npl} /> <Cell v={r.total} />
                  <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'right' }}>
                    {r.total.os ? formatPercent((r.npl.os / r.total.os) * 100) : '0,00%'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Matrix Table */}
      <section className="card" style={{ padding: 24, marginBottom: 24, overflowX: 'auto', fontSize: '13px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ backgroundColor: '#db2777', color: 'white' }}>
              <th rowSpan={2} style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'left', minWidth: '150px' }}>RANGE_TENOR</th>
              <th colSpan={matrixRadiusRanges.length} style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'center' }}>RANGE RADIUS</th>
              <th rowSpan={2} style={{ padding: '4px 8px', border: '1px solid #000', minWidth: '150px' }}>Grand Total</th>
              <th rowSpan={2} style={{ padding: '4px 8px', border: '1px solid #000' }}>%</th>
            </tr>
            <tr style={{ backgroundColor: '#f472b6', color: 'white' }}>
              {matrixRadiusRanges.map(col => (
                <th key={col.label} style={{ padding: '4px 8px', border: '1px solid #000' }}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrixData.map(row => (
              <tr key={row.label}>
                <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'left' }}>{row.label}</td>
                {row.columns.map((val, idx) => (
                  <td key={idx} style={{ padding: '4px 8px', border: '1px solid #000' }}>{val === 0 ? '-' : formatRupiah(val)}</td>
                ))}
                <td style={{ padding: '4px 8px', border: '1px solid #000' }}>{formatRupiah(row.total)}</td>
                <td style={{ padding: '4px 8px', border: '1px solid #000' }}>{overallMatrixTotal > 0 ? formatPercent((row.total / overallMatrixTotal) * 100) : '0,00%'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#0ea5e9', color: 'white', fontWeight: 'bold' }}>
              <td style={{ padding: '4px 8px', border: '1px solid #000', textAlign: 'left' }}>Grand Total</td>
              {matrixColTotals.map((val, idx) => (
                <td key={idx} style={{ padding: '4px 8px', border: '1px solid #000' }}>{formatRupiah(val)}</td>
              ))}
              <td style={{ padding: '4px 8px', border: '1px solid #000' }}>{formatRupiah(overallMatrixTotal)}</td>
              <td style={{ padding: '4px 8px', border: '1px solid #000' }}>100,00%</td>
            </tr>
          </tfoot>
        </table>
      </section>

      {renderPDFSummaryTable('TENOR', tenorSummary)}
      {renderPDFSummaryTable('TYPE KREDIT', productSummary)}
      {renderPDFSummaryTable('PLAFOND', plafondSummary)}
      {renderPDFSummaryTable('RANGE_BUNGA', bungaSummary)}
      {renderPDFSummaryTable('AGUNAN', agunanSummary)}
      {renderPDFSummaryTable('AO', aoSummary)}

    </main>
  );
}
