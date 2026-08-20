'use client';

import { useState } from 'react';
import { updateAoMapping } from './actions';

type MasterAO = {
  id: number;
  rawName: string;
  mappedName: string;
  subKantor: string | null;
};

export default function AOMappingForm({ initialData }: { initialData: MasterAO[] }) {
  const [data, setData] = useState(initialData);
  const [savingId, setSavingId] = useState<number | null>(null);

  const handleUpdate = async (id: number) => {
    setSavingId(id);
    const item = data.find(d => d.id === id);
    if (item) {
      await updateAoMapping(id, item.mappedName, item.subKantor);
      alert('Tersimpan!');
    }
    setSavingId(null);
  };

  const handleChange = (id: number, field: keyof MasterAO, value: string) => {
    setData(data.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  return (
    <div className="card" style={{ padding: 24 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
            <th style={{ padding: 12 }}>Raw Nama (Dari Excel)</th>
            <th style={{ padding: 12 }}>Nama Penyesuaian (Tampil di Dashboard)</th>
            <th style={{ padding: 12 }}>Sub Kantor (Opsional)</th>
            <th style={{ padding: 12 }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={4} style={{ padding: 12, textAlign: 'center' }}>Belum ada data AO. Silakan upload Excel Nominatif pertama Anda.</td></tr>
          ) : (
            data.map((ao) => (
              <tr key={ao.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: 12, fontWeight: 600 }}>{ao.rawName}</td>
                <td style={{ padding: 12 }}>
                  <input 
                    className="inputField" 
                    value={ao.mappedName} 
                    onChange={e => handleChange(ao.id, 'mappedName', e.target.value)} 
                    style={{ width: '100%' }}
                  />
                </td>
                <td style={{ padding: 12 }}>
                  <input 
                    className="inputField" 
                    value={ao.subKantor || ''} 
                    placeholder="Contoh: KAS NGUNUT"
                    onChange={e => handleChange(ao.id, 'subKantor', e.target.value)} 
                    style={{ width: '100%' }}
                  />
                </td>
                <td style={{ padding: 12 }}>
                  <button 
                    className="button primary" 
                    onClick={() => handleUpdate(ao.id)}
                    disabled={savingId === ao.id}
                  >
                    {savingId === ao.id ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
