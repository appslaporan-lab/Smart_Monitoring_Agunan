'use client';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

type Kunjungan = {
  tanggalKunjungan: string | Date;
  jenisKontak: string;
  hasil: string;
  nominalDibayar: number | null;
  tanggalJanjiBayar: string | Date | null;
  catatan: string | null;
};

type Props = {
  namaNasabah: string;
  norek: string;
  riwayat: Kunjungan[];
};

const formatTgl = (d: string | Date | null) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID');
};

export default function ExportHistoriButtons({ namaNasabah, norek, riwayat }: Props) {
  const exportExcel = () => {
    const rows = riwayat.map((k, idx) => ({
      No: idx + 1,
      'Tanggal Kunjungan': formatTgl(k.tanggalKunjungan),
      'Jenis Kontak': k.jenisKontak,
      Hasil: k.hasil.replace(/_/g, ' '),
      'Nominal Dibayar': k.nominalDibayar || 0,
      'Tanggal Janji Bayar': formatTgl(k.tanggalJanjiBayar),
      Catatan: k.catatan || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 5 }, { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 18 }, { wch: 30 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat Penagihan');
    XLSX.writeFile(workbook, `Histori-Penagihan-${norek}.xlsx`);
  };

  const exportPDF = () => {
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    let y = 18;

    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Histori Penagihan Kredit', 15, y);
    y += 7;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Nama Nasabah: ${namaNasabah}`, 15, y);
    y += 5;
    pdf.text(`Nomor Rekening: ${norek}`, 15, y);
    y += 8;

    pdf.setDrawColor(200);
    pdf.line(15, y, 195, y);
    y += 6;

    if (riwayat.length === 0) {
      pdf.text('Belum ada riwayat kunjungan.', 15, y);
    }

    riwayat.forEach((k, idx) => {
      if (y > 270) {
        pdf.addPage();
        y = 18;
      }
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${idx + 1}. ${formatTgl(k.tanggalKunjungan)} — ${k.jenisKontak}`, 15, y);
      y += 5;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Hasil: ${k.hasil.replace(/_/g, ' ')}`, 18, y);
      y += 5;
      if (k.nominalDibayar) {
        pdf.text(`Nominal Dibayar: Rp ${k.nominalDibayar.toLocaleString('id-ID')}`, 18, y);
        y += 5;
      }
      if (k.tanggalJanjiBayar) {
        pdf.text(`Janji Bayar: ${formatTgl(k.tanggalJanjiBayar)}`, 18, y);
        y += 5;
      }
      if (k.catatan) {
        const catatanLines = pdf.splitTextToSize(`Catatan: ${k.catatan}`, 170);
        pdf.text(catatanLines, 18, y);
        y += catatanLines.length * 5;
      }
      y += 4;
    });

    pdf.save(`Histori-Penagihan-${norek}.pdf`);
  };

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
      <button type="button" className="button secondary" onClick={exportExcel}>Export Excel</button>
      <button type="button" className="button secondary" onClick={exportPDF}>Export PDF</button>
    </div>
  );
}