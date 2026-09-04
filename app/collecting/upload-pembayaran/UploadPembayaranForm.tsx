'use client';

import React, { useState } from 'react';
import { UploadCloud, Loader2, Info } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function UploadPembayaranForm() {
  const [file, setFile] = useState<File | null>(null);
  const [jenisUpload, setJenisUpload] = useState<'NON_TUNAI' | 'TUNAI'>('NON_TUNAI');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    if (!file) {
      alert('Pilih file Excel terlebih dahulu');
      return;
    }

    setIsUploading(true);
    setMessage('Membaca file Excel...');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

      setMessage(`Menganalisa ${jsonData.length} baris data...`);

      // Flexible Parser
      const extractedData: { norek: string; totalBayar: number; isLunas: boolean }[] = [];

      let currentSection = '';

      for (const row of jsonData) {
        if (!Array.isArray(row) || row.length === 0) continue;

        const rowStr = row.join(' ').toLowerCase();

        if (rowStr.includes('pencairan') && !rowStr.includes('total')) {
          currentSection = 'PENCAIRAN';
          continue;
        } else if (rowStr.includes('pelunasan') && !rowStr.includes('total')) {
          currentSection = 'PELUNASAN';
          continue;
        } else if (rowStr.includes('pembayaran angsuran') && !rowStr.includes('total')) {
          currentSection = 'PEMBAYARAN';
          continue;
        }

        if (jenisUpload === 'TUNAI' && currentSection === 'PENCAIRAN') continue;
        if (!Array.isArray(row) || row.length === 0) continue;

        let norek = '';
        let totalBayar = 0;
        let isLunasIndicator = false;

        // Mencari Norek (kolom yang isinya string/angka panjang min 10 digit dan dimulai dari 0)
        for (let i = 0; i < row.length; i++) {
          const cell = String(row[i] || '').trim();
          if (cell.match(/^\d{10,}$/)) {
            norek = cell;
            break;
          }
        }

        if (!norek) continue; // Skip jika tidak ada norek

        // Mencari Total Pembayaran (biasanya ada di sebelah kanan norek, ambil angka terbesar atau kolom terakhir yang berisi angka)
        const numbersInRow = row
          .map((v) => {
            if (typeof v === 'number') return v;
            const parsed = parseFloat(String(v).replace(/,/g, ''));
            return isNaN(parsed) ? 0 : parsed;
          })
          .filter((v) => v > 0);

        if (numbersInRow.length > 0) {
          // Filter norek dari array angka agar tidak ikut terjumlah/terhitung
          const amounts = numbersInRow.filter(n => String(n) !== norek && n > 1000);
          if (amounts.length > 0) {
            if (jenisUpload === 'TUNAI') {
              totalBayar = amounts.reduce((a, b) => a + b, 0);
            } else {
              totalBayar = Math.max(...amounts);
            }
          }
        }

        if (jenisUpload === 'TUNAI') {
          if (currentSection === 'PELUNASAN' || rowStr.includes('lunas') || rowStr.includes('pelunasan')) {
            isLunasIndicator = true;
          }
        }

        if (totalBayar > 0) {
          extractedData.push({ norek, totalBayar, isLunas: isLunasIndicator });
        }
      }

      if (extractedData.length === 0) {
        throw new Error('Tidak menemukan data Nomor Rekening dan Nominal Pembayaran yang valid dalam file Excel.');
      }

      setMessage(`Ditemukan ${extractedData.length} data pembayaran. Menyimpan ke database...`);

      const res = await fetch('/api/collecting/upload-pembayaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jenisUpload, data: extractedData }),
      });

      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || 'Terjadi kesalahan saat upload');

      setMessage(`Sukses! ${responseData.updated} data berhasil diperbarui.`);
      setFile(null);
    } catch (e: any) {
      console.error(e);
      setMessage(`Gagal: ${e.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 600 }}>
      <div className="formGroup">
        <label>Jenis Laporan Pembayaran</label>
        <select 
          className="inputField" 
          value={jenisUpload} 
          onChange={e => setJenisUpload(e.target.value as any)}
          disabled={isUploading}
        >
          <option value="NON_TUNAI">Pembayaran Angsuran Non-Tunai</option>
          <option value="TUNAI">Pembayaran Angsuran Tunai (Fitur Pelunasan)</option>
        </select>
        {jenisUpload === 'NON_TUNAI' && (
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>
            <Info size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }}/>
            Semua nasabah yang terdeteksi di laporan ini akan masuk ke bucket <strong>Sudah Bayar</strong>.
          </p>
        )}
        {jenisUpload === 'TUNAI' && (
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>
            <Info size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }}/>
            Sistem akan otomatis mendeteksi kata "Lunas" atau "Pelunasan" di kolom Excel untuk memasukkan nasabah ke bucket <strong>Lunas</strong>.
          </p>
        )}
      </div>

      <div className="formGroup">
        <label>File Excel (.xlsx / .xls)</label>
        <input 
          type="file" 
          accept=".xlsx, .xls, .csv" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="inputField"
          disabled={isUploading}
        />
      </div>

      {message && (
        <div style={{ padding: 12, borderRadius: 8, background: message.includes('Gagal') ? '#fee2e2' : message.includes('Sukses') ? '#dcfce7' : '#e0f2fe', color: message.includes('Gagal') ? '#991b1b' : message.includes('Sukses') ? '#166534' : '#075985', marginBottom: 16, fontSize: '0.9rem' }}>
          {message}
        </div>
      )}

      <button 
        className="button primary" 
        onClick={handleUpload} 
        disabled={isUploading || !file}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' }}
      >
        {isUploading ? <Loader2 className="spin" size={18} /> : <UploadCloud size={18} />}
        {isUploading ? 'Memproses...' : 'Upload & Proses Data'}
      </button>
    </div>
  );
}
