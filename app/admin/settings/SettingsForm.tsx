'use client';

import { useState, useEffect } from 'react';

type BucketItem = { label: string; min?: number; max?: number };

export default function SettingsForm() {
  const [settings, setSettings] = useState<Record<string, BucketItem[]>>({
    BUCKET_RADIUS: [],
    BUCKET_SUKU_BUNGA: [],
    BUCKET_PRODUK: [],
    BUCKET_MO: [],
    BUCKET_TENOR: [],
    BUCKET_HARI_TUNGGAKAN: [],
    BUCKET_PLAFOND: [],
    BUCKET_AGUNAN: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setSettings(prev => ({ ...prev, ...data }));
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setMessage('Pengaturan berhasil disimpan!');
      } else {
        setMessage('Gagal menyimpan pengaturan.');
      }
    } catch (e) {
      setMessage('Terjadi kesalahan.');
    }
    setSaving(false);
  };

  const updateBucket = (key: string, idx: number, field: string, val: any) => {
    const copy = { ...settings };
    if (!copy[key]) copy[key] = [];
    copy[key][idx] = { ...copy[key][idx], [field]: val };
    setSettings(copy);
  };

  const addBucket = (key: string) => {
    const copy = { ...settings };
    if (!copy[key]) copy[key] = [];
    copy[key].push({ label: 'Baru', min: 0, max: 0 });
    setSettings(copy);
  };

  const removeBucket = (key: string, idx: number) => {
    const copy = { ...settings };
    copy[key].splice(idx, 1);
    setSettings(copy);
  };

  if (loading) return <div>Memuat pengaturan...</div>;

  const renderBucketEditor = (key: string, title: string, hasRange: boolean) => (
    <div className="card" style={{ padding: 24, marginBottom: 24 }}>
      <h3>{title}</h3>
      <div style={{ marginTop: 16 }}>
        {(settings[key] || []).map((item, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
            <input 
              className="inputField" 
              placeholder="Label (Contoh: 0 - 5 km)" 
              value={item.label} 
              onChange={e => updateBucket(key, idx, 'label', e.target.value)}
              style={{ flex: 2 }}
            />
            {hasRange && (
              <>
                <input 
                  className="inputField" 
                  type="number" 
                  placeholder="Min" 
                  value={item.min ?? 0} 
                  onChange={e => updateBucket(key, idx, 'min', parseFloat(e.target.value))}
                  style={{ flex: 1 }}
                />
                <input 
                  className="inputField" 
                  type="number" 
                  placeholder="Max" 
                  value={item.max ?? 0} 
                  onChange={e => updateBucket(key, idx, 'max', parseFloat(e.target.value))}
                  style={{ flex: 1 }}
                />
              </>
            )}
            <button className="button danger" onClick={() => removeBucket(key, idx)}>Hapus</button>
          </div>
        ))}
        <button className="button secondary" onClick={() => addBucket(key)}>+ Tambah Bucket</button>
      </div>
    </div>
  );

  return (
    <div>
      {message && <div style={{ padding: 12, backgroundColor: '#d1fae5', color: '#065f46', marginBottom: 24, borderRadius: 8 }}>{message}</div>}
      
      {renderBucketEditor('BUCKET_RADIUS', 'Radius Jarak Nasabah (km)', true)}
      {renderBucketEditor('BUCKET_SUKU_BUNGA', 'Suku Bunga (%)', true)}
      {renderBucketEditor('BUCKET_TENOR', 'Tenor Pinjaman (Bulan)', true)}
      {renderBucketEditor('BUCKET_HARI_TUNGGAKAN', 'Hari Tunggakan (Hari)', true)}
      {renderBucketEditor('BUCKET_PLAFOND', 'Plafond Pinjaman (Rp)', true)}
      
      {renderBucketEditor('BUCKET_PRODUK', 'Produk Pinjaman', false)}
      {renderBucketEditor('BUCKET_MO', 'Marketing Officer (MO)', false)}
      {renderBucketEditor('BUCKET_AGUNAN', 'Jenis Agunan', false)}

      <div style={{ position: 'sticky', bottom: 0, padding: '16px 0', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="button primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>
    </div>
  );
}
