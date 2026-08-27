'use client';

import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UploadTellerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ updatedCount: number; errors: string[] } | null>(null);

  const handleUpload = async () => {
    if (!file) {
      toast.error('Pilih file Excel terlebih dahulu');
      return;
    }
    
    setIsUploading(true);
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/collecting/upload-teller', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Gagal upload file');
      }

      setResult({ updatedCount: data.updatedCount, errors: data.errors });
      toast.success(`Berhasil memproses ${data.updatedCount} pembayaran`);
      setFile(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <FileSpreadsheet size={28} color="#0f172a" />
        <div>
          <h1 style={{ margin: 0 }}>Upload Transaksi Harian Teller</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>
            Sistem otomatis mendeteksi baris dengan keterangan "bayar angsuran pinjaman norek..."
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 24, maxWidth: 600 }}>
        <div 
          style={{ 
            border: '2px dashed #cbd5e1', 
            borderRadius: 8, 
            padding: 40, 
            textAlign: 'center',
            background: file ? '#f8fafc' : 'white',
            cursor: 'pointer'
          }}
          onClick={() => document.getElementById('fileUpload')?.click()}
        >
          <Upload size={32} color={file ? '#3b82f6' : '#94a3b8'} style={{ marginBottom: 12 }} />
          {file ? (
            <h4 style={{ margin: 0, color: '#3b82f6' }}>{file.name}</h4>
          ) : (
            <p style={{ margin: 0, color: '#64748b' }}>Klik untuk memilih file Excel (.xlsx)</p>
          )}
          <input 
            type="file" 
            id="fileUpload" 
            accept=".xlsx, .xls"
            style={{ display: 'none' }}
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <button 
          className="btn" 
          onClick={handleUpload}
          disabled={!file || isUploading}
          style={{ width: '100%', marginTop: 24, justifyContent: 'center' }}
        >
          {isUploading ? 'Memproses...' : 'Upload & Sinkronisasi Pembayaran'}
        </button>

        {result && (
          <div style={{ marginTop: 24, padding: 16, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#166534', fontWeight: 'bold' }}>
              <CheckCircle2 size={20} />
              Berhasil Memperbarui {result.updatedCount} Debitur
            </div>
            {result.errors.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#991b1b', fontSize: '0.9rem', marginBottom: 4 }}>
                  <AlertCircle size={16} /> Data tidak ditemukan di Nominatif:
                </div>
                <ul style={{ margin: 0, paddingLeft: 24, color: '#991b1b', fontSize: '0.85rem' }}>
                  {result.errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
