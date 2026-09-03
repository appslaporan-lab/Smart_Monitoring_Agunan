'use client';

import React, { useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';
import { Wifi, WifiOff, RefreshCw, UploadCloud, ChevronDown, ChevronUp, Save, Search, CheckCircle2, CloudLightning } from 'lucide-react';

export default function ModeLapanganPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [debtors, setDebtors] = useState<any[]>([]);
  const [outbox, setOutbox] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  
  // Form States
  const [tanggalKunjungan, setTanggalKunjungan] = useState(new Date().toISOString().split('T')[0]);
  const [jenisKontak, setJenisKontak] = useState('KUNJUNGAN');
  const [hasil, setHasil] = useState('');
  const [nominalDibayar, setNominalDibayar] = useState('');
  const [tanggalJanjiBayar, setTanggalJanjiBayar] = useState('');
  const [catatan, setCatatan] = useState('');
  const [fotoDataUrl, setFotoDataUrl] = useState<string | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    loadFromIdb();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Try auto-sync when back online
  useEffect(() => {
    if (isOnline && outbox.length > 0) {
      syncOutbox();
    }
  }, [isOnline, outbox.length]);

  const loadFromIdb = async () => {
    try {
      const cachedDebtors = await get('lapangan_debtors') || [];
      const cachedOutbox = await get('lapangan_outbox') || [];
      setDebtors(cachedDebtors);
      setOutbox(cachedOutbox);
    } catch (e) {
      console.error('Failed to load IDB', e);
    }
  };

  const downloadData = async () => {
    if (!isOnline) {
      alert();
      return;
    }
    
    try {
      console.log();
      const res = await fetch('/api/collecting/lapangan');
      if (!res.ok) throw new Error('Gagal fetch');
      const data = await res.json();
      
      await set('lapangan_debtors', data);
      setDebtors(data);
      alert();
    } catch (e) {
      alert();
    }
  };

  const syncOutbox = async () => {
    if (!isOnline || outbox.length === 0 || isSyncing) return;
    
    setIsSyncing(true);
    try {
      const res = await fetch('/api/collecting/lapangan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outbox)
      });
      
      if (!res.ok) throw new Error('Sinkronisasi gagal');
      
      // Clear outbox
      await set('lapangan_outbox', []);
      setOutbox([]);
      alert();
      
      // Refresh list to clear submitted ones
      downloadData();
    } catch (e) {
      alert();
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitKunjungan = async (pinjamanPeriodeId: number) => {
    if (!hasil) {
      alert();
      return;
    }
    if ((hasil === 'JANJI_BAYAR' && !tanggalJanjiBayar) || (hasil === 'BAYAR_SEBAGIAN' && !nominalDibayar)) {
      alert();
      return;
    }

    const payload = {
      pinjamanPeriodeId,
      tanggalKunjungan,
      jenisKontak,
      hasil,
      nominalDibayar,
      tanggalJanjiBayar,
      catatan,
      penerimaSurat: '',
      fotoDataUrl,
      _timestamp: Date.now() // for local tracking
    };

    const newOutbox = [...outbox, payload];
    await set('lapangan_outbox', newOutbox);
    setOutbox(newOutbox);
    
    // Hide from current view
    const newDebtors = debtors.filter(d => d.id !== pinjamanPeriodeId);
    await set('lapangan_debtors', newDebtors);
    setDebtors(newDebtors);
    
    alert();
    
    // Reset form
    setExpandedId(null);
    setHasil('');
    setNominalDibayar('');
    setCatatan('');
    setFotoDataUrl(null);
  };

  const filteredDebtors = debtors.filter(d => {
    const q = query.toLowerCase();
    return d.namaNasabahExcel.toLowerCase().includes(q) || d.norek.includes(q);
  });

  return (
    <main className="container" style={{ padding: '20px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            Mode Lapangan
            {isOnline ? <span style={{ color: '#16a34a', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4, background: '#dcfce7', padding: '2px 8px', borderRadius: 12 }}><Wifi size={14} /> Online</span> 
                      : <span style={{ color: '#dc2626', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4, background: '#fee2e2', padding: '2px 8px', borderRadius: 12 }}><WifiOff size={14} /> Offline</span>}
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Mode khusus kunjungan tanpa sinyal</p>
        </div>
      </div>

      {outbox.length > 0 && (
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: 12, borderRadius: 8, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CloudLightning size={24} color="#d97706" />
            <div style={{ flex: 1 }}>
              <strong style={{ color: '#92400e' }}>Ada {outbox.length} data kunjungan tertunda</strong>
              <div style={{ fontSize: '0.85rem', color: '#b45309' }}>Data akan otomatis dikirim saat koneksi internet tersedia.</div>
            </div>
            {isOnline && (
              <button className="button primary" onClick={syncOutbox} disabled={isSyncing}>
                {isSyncing ? 'Mengirim...' : 'Sinkronkan'}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            <strong>Cara Penggunaan:</strong> Tekan "Unduh Data" saat Anda masih berada di kantor (terhubung internet). Setelah itu, Anda bebas menagih ke pelosok tanpa sinyal. Buka halaman ini dan input hasilnya!
          </p>
          <button className="button" onClick={downloadData} disabled={!isOnline} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <UploadCloud size={18} /> Unduh Data Lapangan (Update)
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 16, position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
        <input 
          type="search" 
          placeholder="Cari nama atau norek..." 
          className="inputField" 
          style={{ paddingLeft: 38, width: '100%' }}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredDebtors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
            {query ? 'Pencarian tidak ditemukan' : 'Tidak ada data. Silakan tekan Unduh Data.'}
          </div>
        ) : (
          filteredDebtors.map(d => (
            <div key={d.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div 
                style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: expandedId === d.id ? '#f8fafc' : 'white' }}
                onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#1e293b' }}>{d.namaNasabahExcel}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>Norek: {d.norek} | Tgk: {d.hariTunggakan} hari</div>
                  {d.alamatExcel && <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80vw' }}>{d.alamatExcel}</div>}
                </div>
                {expandedId === d.id ? <ChevronUp /> : <ChevronDown />}
              </div>
              
              {expandedId === d.id && (
                <div style={{ padding: 16, borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <div className="formGroup">
                    <label>Hasil Kunjungan</label>
                    <select className="inputField" value={hasil} onChange={e => setHasil(e.target.value)}>
                      <option value="">-- Pilih Hasil --</option>
                      <option value="JANJI_BAYAR">Janji Bayar</option>
                      <option value="BAYAR_SEBAGIAN">Bayar Sebagian / Titip</option>
                      <option value="LUNAS">Lunas</option>
                      <option value="TIDAK_KETEMU">Tidak Bertemu / Rumah Kosong</option>
                      <option value="MENOLAK">Menolak Bayar / Pindah</option>
                    </select>
                  </div>

                  {hasil === 'JANJI_BAYAR' && (
                    <div className="formGroup">
                      <label>Tanggal Janji Bayar</label>
                      <input type="date" className="inputField" value={tanggalJanjiBayar} onChange={e => setTanggalJanjiBayar(e.target.value)} />
                    </div>
                  )}

                  {['BAYAR_SEBAGIAN', 'JANJI_BAYAR'].includes(hasil) && (
                    <div className="formGroup">
                      <label>Nominal (Rp)</label>
                      <input type="number" className="inputField" placeholder="1500000" value={nominalDibayar} onChange={e => setNominalDibayar(e.target.value)} />
                    </div>
                  )}

                  <div className="formGroup">
                    <label>Bukti Foto (Kamera / Galeri)</label>
                    <input type="file" accept="image/*" capture="environment" className="inputField" onChange={handlePhotoCapture} />
                    {fotoDataUrl && (
                      <div style={{ marginTop: 8 }}>
                        <img src={fotoDataUrl} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8, border: '1px solid #cbd5e1' }} />
                      </div>
                    )}
                  </div>

                  <div className="formGroup">
                    <label>Catatan Opsional</label>
                    <textarea className="inputField" rows={2} placeholder="Kondisi di lapangan..." value={catatan} onChange={e => setCatatan(e.target.value)} />
                  </div>

                  <button className="button primary" style={{ width: '100%', marginTop: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }} onClick={() => submitKunjungan(d.id)}>
                    <Save size={18} /> Simpan Offline
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
