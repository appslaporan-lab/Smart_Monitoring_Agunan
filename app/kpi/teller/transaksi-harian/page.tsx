'use client';

import React, { useState } from 'react';
import { UploadCloud, FileType, CheckCircle, AlertCircle, ArrowLeft, Loader2, ArrowDownCircle, ArrowUpCircle, Banknote, CreditCard } from 'lucide-react';
import Link from 'next/link';
import type { TellerKPIResult } from '@/lib/kpiTellerParser';

export default function TellerTransaksiHarianPage() {
  const [file, setFile] = useState<File | null>(null);
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TellerKPIResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null); // reset
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Silakan pilih file Excel terlebih dahulu.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tanggal', tanggal);

      const res = await fetch('/api/kpi/teller-parse', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Terjadi kesalahan sistem');
      }

      setResult(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="container">
      <div style={{ marginBottom: 24 }}>
        <Link href="/kpi" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#64748b', textDecoration: 'none', marginBottom: 16 }}>
          <ArrowLeft size={16} />
          Kembali ke Dashboard KPI
        </Link>
        <h1>Kalkulator Performa Teller</h1>
        <p>Unggah Laporan Akhir Hari (format Excel/CSV) untuk menghitung transaksi harian teller (Setoran, Penarikan, Angsuran, dan Pencairan).</p>
      </div>

      {!result ? (
        <section className="card" style={{ maxWidth: 600, padding: 32 }}>
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleUpload}>
            
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="label">Tanggal Laporan</label>
              <input 
                type="date" 
                className="inputField" 
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="label">File Laporan Excel (.xls, .xlsx, .csv)</label>
              
              <div 
                style={{ 
                  border: '2px dashed #cbd5e1', 
                  borderRadius: 12, 
                  padding: 40, 
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <input 
                  type="file" 
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleFileChange}
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
                
                {file ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <FileType size={48} color="#2563eb" />
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{file.name}</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>{(file.size / 1024).toFixed(1)} KB</div>
                    <p style={{ margin: 0, fontSize: 14, color: '#2563eb', fontWeight: 500 }}>Klik untuk mengganti file</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <UploadCloud size={48} color="#94a3b8" />
                    <div style={{ fontWeight: 600, color: '#475569' }}>Tarik & Lepas file Excel di sini</div>
                    <div style={{ fontSize: 14, color: '#64748b' }}>atau klik untuk mencari file</div>
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              className="button" 
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 12 }}
              disabled={!file || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  Memproses Laporan...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Kalkulasi Transaksi
                </>
              )}
            </button>
          </form>
          
          <div style={{ marginTop: 24, padding: 16, background: '#fffbeb', borderRadius: 8, fontSize: 14, color: '#b45309' }}>
            <strong>💡 Rekomendasi:</strong> Pastikan Anda melakukan <strong>Export to Excel</strong> dari sistem Core Banking, jangan menggunakan format PDF. Format Excel menjamin akurasi nominal uang tanpa risiko terpotong.
          </div>
        </section>
      ) : (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ margin: 0 }}>Ringkasan Akhir Hari</h2>
            <button className="button secondary" onClick={() => { setResult(null); setFile(null); }}>
              Hitung Laporan Lain
            </button>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            
            {/* Setoran */}
            <div className="metric-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <div className="metric-accent" style={{ background: '#22c55e' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ background: '#dcfce7', padding: 12, borderRadius: '50%', color: '#16a34a' }}>
                  <ArrowDownCircle size={32} />
                </div>
                <div>
                  <div style={{ fontSize: 14, color: '#16a34a', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Setoran Tabungan</div>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a' }}>{formatCurrency(result.setoran.total)}</div>
                  <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{result.setoran.count} Transaksi</div>
                </div>
              </div>
            </div>

            {/* Penarikan */}
            <div className="metric-card" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
              <div className="metric-accent" style={{ background: '#ef4444' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ background: '#fee2e2', padding: 12, borderRadius: '50%', color: '#dc2626' }}>
                  <ArrowUpCircle size={32} />
                </div>
                <div>
                  <div style={{ fontSize: 14, color: '#dc2626', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Tarikan Tabungan</div>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a' }}>{formatCurrency(result.penarikan.total)}</div>
                  <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{result.penarikan.count} Transaksi</div>
                </div>
              </div>
            </div>

            {/* Angsuran / Pinjaman */}
            <div className="metric-card" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
              <div className="metric-accent" style={{ background: '#3b82f6' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ background: '#dbeafe', padding: 12, borderRadius: '50%', color: '#2563eb' }}>
                  <Banknote size={32} />
                </div>
                <div>
                  <div style={{ fontSize: 14, color: '#2563eb', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Angsuran / Pelunasan</div>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a' }}>{formatCurrency(result.angsuran.total)}</div>
                  <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{result.angsuran.count} Transaksi</div>
                </div>
              </div>
            </div>

            
            {/* Kesalahan */}
            <div className="metric-card" style={{ background: '#fff1f2', borderColor: '#fecdd3' }}>
              <div className="metric-accent" style={{ background: '#e11d48' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ background: '#ffe4e6', padding: 12, borderRadius: '50%', color: '#e11d48' }}>
                  <AlertCircle size={32} />
                </div>
                <div>
                  <div style={{ fontSize: 14, color: '#e11d48', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Kesalahan (Minus)</div>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a' }}>{result.errorCount}</div>
                  <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Terdeteksi otomatis</div>
                </div>
              </div>
            </div>

            {/* Pencairan */}
            <div className="metric-card" style={{ background: '#fdf4ff', borderColor: '#f5d0fe' }}>
              <div className="metric-accent" style={{ background: '#d946ef' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ background: '#fae8ff', padding: 12, borderRadius: '50%', color: '#c026d3' }}>
                  <CreditCard size={32} />
                </div>
                <div>
                  <div style={{ fontSize: 14, color: '#c026d3', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Pencairan Pinjaman</div>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a' }}>{formatCurrency(result.pencairanPinjaman.total)}</div>
                  <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{result.pencairanPinjaman.count} Transaksi</div>
                </div>
              </div>
            </div>

          </div>
        </section>
      )}
    </main>
  );
}
