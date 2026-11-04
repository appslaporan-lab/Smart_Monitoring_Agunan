'use client';

import React from 'react';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

type KolStats = { noa: number; os: number };
type MainTableRow = {
  kantor: string;
  k1: KolStats; k2: KolStats; k3: KolStats; k4: KolStats; k5: KolStats;
  nonNpl: KolStats; npl: KolStats; total: KolStats;
  isGroupTotal?: boolean;
  isGrandTotal?: boolean;
};

type Props = {
  rows: MainTableRow[];
  periode: string;
  buttonLabel?: string;
};

export default function ExportKolektibilitasExcelButton({
  rows,
  periode,
  buttonLabel = 'Ekspor Excel'
}: Props) {
  const handleExport = () => {
    if (!rows || rows.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    try {
      // Build 2D array (AOA)
      const aoa: any[][] = [
        ['LAPORAN PERFORM KOLEKTIBILITAS PER KANTOR'],
        [`PERIODE: ${periode}`],
        [], // empty row
        // Row index 3 (4th row in Excel)
        ['KANTOR', 'KOLEKTIBILITAS', '', '', '', '', '', '', '', '', '', 'NON NPL', '', 'NPL', '', 'Total NOA / OS', '', '% NPL'],
        // Row index 4
        ['', '1', '', '2', '', '3', '', '4', '', '5', '', '', '', '', '', '', '', ''],
        // Row index 5
        ['', 'NOA', 'OS', 'NOA', 'OS', 'NOA', 'OS', 'NOA', 'OS', 'NOA', 'OS', 'NOA', 'OS', 'NOA', 'OS', 'NOA', 'OS', '']
      ];

      for (const r of rows) {
        const nplPct = r.total.os ? (r.npl.os / r.total.os) * 100 : 0;
        aoa.push([
          r.kantor,
          r.k1.noa, r.k1.os,
          r.k2.noa, r.k2.os,
          r.k3.noa, r.k3.os,
          r.k4.noa, r.k4.os,
          r.k5.noa, r.k5.os,
          r.nonNpl.noa, r.nonNpl.os,
          r.npl.noa, r.npl.os,
          r.total.noa, r.total.os,
          Number((nplPct / 100).toFixed(4))
        ]);
      }

      const ws = XLSX.utils.aoa_to_sheet(aoa);

      // Define merges
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 17 } }, // Title
        { s: { r: 1, c: 0 }, e: { r: 1, c: 17 } }, // Periode
        { s: { r: 3, c: 0 }, e: { r: 5, c: 0 } },  // KANTOR
        { s: { r: 3, c: 1 }, e: { r: 3, c: 10 } }, // KOLEKTIBILITAS
        { s: { r: 4, c: 1 }, e: { r: 4, c: 2 } },  // 1
        { s: { r: 4, c: 3 }, e: { r: 4, c: 4 } },  // 2
        { s: { r: 4, c: 5 }, e: { r: 4, c: 6 } },  // 3
        { s: { r: 4, c: 7 }, e: { r: 4, c: 8 } },  // 4
        { s: { r: 4, c: 9 }, e: { r: 4, c: 10 } }, // 5
        { s: { r: 3, c: 11 }, e: { r: 4, c: 12 } }, // NON NPL
        { s: { r: 3, c: 13 }, e: { r: 4, c: 14 } }, // NPL
        { s: { r: 3, c: 15 }, e: { r: 4, c: 16 } }, // Total NOA / OS
        { s: { r: 3, c: 17 }, e: { r: 5, c: 17 } }, // % NPL
      ];

      // Format cells with number formatting
      // Data starts at row index 6 (7th row)
      for (let R = 6; R < aoa.length; R++) {
        for (let C = 1; C <= 16; C++) {
          const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
          if (ws[cellRef] && typeof ws[cellRef].v === 'number') {
            ws[cellRef].z = '#,##0';
          }
        }
        // % NPL column (C = 17)
        const pctRef = XLSX.utils.encode_cell({ r: R, c: 17 });
        if (ws[pctRef] && typeof ws[pctRef].v === 'number') {
          ws[pctRef].z = '0.00%';
        }
      }

      // Column widths
      ws['!cols'] = [
        { wch: 18 }, // KANTOR
        { wch: 8 },  // 1 NOA
        { wch: 18 }, // 1 OS
        { wch: 8 },  // 2 NOA
        { wch: 18 }, // 2 OS
        { wch: 8 },  // 3 NOA
        { wch: 18 }, // 3 OS
        { wch: 8 },  // 4 NOA
        { wch: 18 }, // 4 OS
        { wch: 8 },  // 5 NOA
        { wch: 18 }, // 5 OS
        { wch: 9 },  // NON NPL NOA
        { wch: 18 }, // NON NPL OS
        { wch: 9 },  // NPL NOA
        { wch: 18 }, // NPL OS
        { wch: 9 },  // Total NOA
        { wch: 18 }, // Total OS
        { wch: 10 }, // % NPL
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Kolektibilitas');

      const cleanPeriode = periode.replace(/[\/\\]/g, '-');
      XLSX.writeFile(wb, `Laporan_Kolektibilitas_Kantor_${cleanPeriode}.xlsx`);
      toast.success('Berhasil mengekspor ke Excel');
    } catch (error) {
      console.error(error);
      toast.error('Terjadi kesalahan saat mengekspor data');
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="button no-print"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: '#16a34a',
        color: 'white',
        borderColor: '#16a34a',
        padding: '6px 14px',
        fontSize: '13px',
        fontWeight: 500,
        borderRadius: '6px',
        cursor: 'pointer'
      }}
    >
      <Download size={16} />
      {buttonLabel}
    </button>
  );
}
