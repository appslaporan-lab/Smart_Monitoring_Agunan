'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

type Kunjungan = {
  tanggalKunjungan: string | Date;
  jenisKontak: string;
  hasil: string;
  nominalDibayar: number | null;
  tanggalJanjiBayar: string | Date | null;
  catatan: string | null;
  petugasNama?: string | null;
  penerimaSurat?: string | null;
  fotoDataUrl?: string | null;
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

const prepareImage = (dataUrl: string): Promise<{ dataUrl: string; width: number; height: number } | null> => {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let w = img.naturalWidth || img.width || 600;
          let h = img.naturalHeight || img.height || 450;
          const maxDim = 1000;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ dataUrl, width: w, height: h });
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          const jpegData = canvas.toDataURL('image/jpeg', 0.85);
          resolve({ dataUrl: jpegData, width: w, height: h });
        } catch {
          resolve({ dataUrl, width: img.width || 600, height: img.height || 450 });
        }
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = dataUrl;
    } catch {
      resolve(null);
    }
  });
};

export default function ExportHistoriButtons({ namaNasabah, norek, riwayat }: Props) {
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const exportExcel = () => {
    const rows = riwayat.map((k, idx) => ({
      No: idx + 1,
      'Tanggal Kunjungan': formatTgl(k.tanggalKunjungan),
      'Petugas Kunjungan': k.petugasNama || '-',
      'Jenis Kontak': k.jenisKontak.replace(/_/g, ' '),
      Hasil: k.hasil.replace(/_/g, ' '),
      'Nominal Dibayar': k.nominalDibayar || 0,
      'Tanggal Janji Bayar': formatTgl(k.tanggalJanjiBayar),
      'Diterima Oleh': k.penerimaSurat || '-',
      Catatan: k.catatan || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 18 },
      { wch: 22 },
      { wch: 16 },
      { wch: 18 },
      { wch: 16 },
      { wch: 18 },
      { wch: 20 },
      { wch: 35 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat Penagihan');
    XLSX.writeFile(workbook, `Histori-Penagihan-${norek}.xlsx`);
  };

  const exportPDF = async () => {
    setIsExportingPdf(true);
    try {
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      let y = 18;

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Histori Penagihan Kredit', 15, y);
      y += 7;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Nama Nasabah: ${namaNasabah}`, 15, y);
      y += 5;
      pdf.text(`Nomor Rekening: ${norek}`, 15, y);
      y += 5;
      pdf.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 15, y);
      y += 7;

      pdf.setDrawColor(200);
      pdf.setLineWidth(0.5);
      pdf.line(15, y, 195, y);
      y += 7;

      if (riwayat.length === 0) {
        pdf.text('Belum ada riwayat kunjungan/kontak.', 15, y);
      }

      for (let idx = 0; idx < riwayat.length; idx++) {
        const k = riwayat[idx];

        if (y > 235) {
          pdf.addPage();
          y = 18;
        }

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text(`${idx + 1}. ${formatTgl(k.tanggalKunjungan)} — ${k.jenisKontak.replace(/_/g, ' ')}`, 15, y);
        y += 5.5;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text(`Petugas Kunjungan: ${k.petugasNama || '-'}`, 18, y);
        y += 5;
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
        if (k.penerimaSurat) {
          pdf.text(`Diterima Oleh: ${k.penerimaSurat}`, 18, y);
          y += 5;
        }
        if (k.catatan) {
          const catatanLines = pdf.splitTextToSize(`Catatan: ${k.catatan}`, 170);
          pdf.text(catatanLines, 18, y);
          y += catatanLines.length * 5;
        }

        if (k.fotoDataUrl) {
          const imgObj = await prepareImage(k.fotoDataUrl);
          if (imgObj) {
            const maxW = 75;
            const maxH = 60;
            const ratio = Math.min(maxW / imgObj.width, maxH / imgObj.height);
            const renderW = Math.max(25, imgObj.width * ratio);
            const renderH = Math.max(20, imgObj.height * ratio);

            if (y + renderH + 10 > 280) {
              pdf.addPage();
              y = 18;
            }

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(9);
            const labelFoto = k.jenisKontak === 'WHATSAPP' 
              ? 'Bukti Foto / Screenshot WhatsApp:' 
              : 'Foto Dokumentasi Kunjungan:';
            pdf.text(labelFoto, 18, y);
            y += 4;

            try {
              pdf.addImage(imgObj.dataUrl, 'JPEG', 18, y, renderW, renderH);
              y += renderH + 4;
            } catch (err) {
              console.error('Failed to add image to PDF:', err);
            }
          }
        }

        y += 3;
        pdf.setDrawColor(220);
        pdf.setLineWidth(0.3);
        pdf.line(15, y, 195, y);
        y += 6;
      }

      pdf.save(`Histori-Penagihan-${norek}.pdf`);
    } catch (e) {
      console.error('Gagal export PDF:', e);
      alert('Terjadi kesalahan saat membuat file PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
      <button type="button" className="button secondary" onClick={exportExcel}>
        Export Excel
      </button>
      <button type="button" className="button secondary" onClick={exportPDF} disabled={isExportingPdf}>
        {isExportingPdf ? 'Membuat PDF...' : 'Export PDF'}
      </button>
    </div>
  );
}