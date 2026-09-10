'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import ExportExcelButton from '@/components/ExportExcelButton';

type EwsItem = {
  id: number;
  norek: string;
  namaNasabahExcel: string;
  subKantor: string | null;
  namaAO: string | null;
  hariTunggakan: number;
  kantorLabel: string;
  kunjunganCount: number;
  ews: { status: string; label: string; colorClass: string; wajibKunjungan: boolean };
  kolBulanIni: string | null;
  kolBulanLalu: string | null;
  sudahBayar: boolean;
  isLunas: boolean;
  nominalBayarHariIni: number | null;
  tglBayar: Date | null;
  norekTabungan: string | null;
  saldoTabungan: number | null;
  tunggakanPokok: number | null;
  tunggakanBunga: number | null;
  lastKunjungan?: {
    tanggalKunjungan: Date | string;
    hasil: string;
    tanggalJanjiBayar: Date | string | null;
    catatan: string | null;
    petugasNama: string;
  } | null;
};

const FILTER_OPTIONS: { key: string; label: string; match: (item: EwsItem) => boolean }[] = [
  { key: 'AMAN', label: 'Aman (Lancar)', match: (i) => i.ews.status === 'AMAN' && !i.isLunas && !i.sudahBayar && i.kunjunganCount === 0 },
  { key: 'JANJI_BAYAR_OVERDUE', label: 'Janji Bayar Terlewat', match: (i) => i.ews.status === 'JANJI_BAYAR_OVERDUE' && !i.isLunas && !i.sudahBayar },
    { key: 'JANJI_BAYAR_DEKAT', label: 'Mendekati Janji Bayar', match: (i) => i.ews.status === 'JANJI_BAYAR_DEKAT' && !i.isLunas && !i.sudahBayar },
  { key: 'ALL', label: 'Semua', match: () => true },
  { key: 'H7_DESK_CALL', label: 'H-7 Desk Call', match: (i) => i.ews.status === 'H7_DESK_CALL' && !i.isLunas && !i.sudahBayar && i.kunjunganCount === 0 },
  { key: 'KUNJUNGAN_MO', label: 'Kunjungan MO', match: (i) => i.ews.status === 'KUNJUNGAN_MO' && !i.isLunas && !i.sudahBayar && i.kunjunganCount === 0 },
  { key: 'SURAT_TAGIHAN', label: 'Surat Tagihan', match: (i) => i.ews.status.startsWith('SURAT_TAGIHAN') && !i.isLunas && !i.sudahBayar && i.kunjunganCount === 0 },
  { key: 'SP', label: 'Surat Peringatan', match: (i) => i.ews.status.startsWith('SP_') && !i.isLunas && !i.sudahBayar && i.kunjunganCount === 0 },
  { key: 'SUDAH_DIKUNJUNGI', label: 'Sudah Dikunjungi', match: (i) => i.kunjunganCount > 0 && !i.sudahBayar && !i.isLunas && i.ews.status !== 'JANJI_BAYAR_DEKAT' && i.ews.status !== 'JANJI_BAYAR_OVERDUE' },
  { key: 'LUNAS', label: 'Lunas', match: (i) => i.isLunas },
  { key: 'SUDAH_BAYAR', label: 'Sudah Bayar', match: (i) => i.sudahBayar && !i.isLunas },
  { key: 'BELUM_DIKUNJUNGI', label: 'Belum Dikunjungi', match: (i) => i.ews.wajibKunjungan && i.kunjunganCount === 0 && !i.sudahBayar && !i.isLunas },
];

export default function CollectingDebiturList({ items, userRole }: { items: EwsItem[], userRole?: string }) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [activeSubKantor, setActiveSubKantor] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  
  const showSubKantorFilter = userRole && (
    userRole.includes('KASUBAG') || 
    userRole.includes('KABAG') || 
    userRole === 'PIMPINAN_CABANG' || 
    userRole === 'SPI' || 
    userRole === 'DIREKTUR' || 
    userRole === 'DIREKSI' || 
    userRole === 'SUPERADMIN'
  );

  const subKantorList = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => i.subKantor && set.add(i.subKantor));
    return Array.from(set).sort();
  }, [items]);

  const summaryCounts = useMemo(() => {
    return FILTER_OPTIONS.reduce((acc, f) => {
      acc[f.key] = items.filter(i => f.match(i) && (activeSubKantor === 'ALL' || i.subKantor === activeSubKantor)).length;
      return acc;
    }, {} as Record<string, number>);
  }, [items, activeSubKantor]);

  const filtered = useMemo(() => {
    const filterFn = FILTER_OPTIONS.find((f) => f.key === activeFilter)?.match || (() => true);
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (!filterFn(item)) return false;
      if (activeSubKantor !== 'ALL' && item.subKantor !== activeSubKantor) return false;
      if (!q) return true;
      return item.namaNasabahExcel.toLowerCase().includes(q) || item.norek.toLowerCase().includes(q);
    });
  }, [items, activeFilter, query, activeSubKantor]);

  const cardColors: Record<string, string> = {
    AMAN: '#10b981',
    JANJI_BAYAR_OVERDUE: '#dc2626',
      JANJI_BAYAR_DEKAT: '#84cc16',
    H7_DESK_CALL: '#fbbf24',
    KUNJUNGAN_MO: '#fb923c',
    SURAT_TAGIHAN: '#f87171',
    SP: '#dc2626',
    SUDAH_DIKUNJUNGI: '#8b5cf6',
    BELUM_DIKUNJUNGI: '#94a3b8',
    SUDAH_BAYAR: '#22c55e',
    LUNAS: '#3b82f6',
  };

  const excelData = filtered.map(item => ({
    'No. Rekening': item.norek,
    'Nama Debitur': item.namaNasabahExcel,
    'Kantor': item.kantorLabel,
    'AO': item.namaAO || '-',
    'Status EWS': item.ews.label,
    'Hari Tunggakan': item.hariTunggakan,
    'Kolektibilitas': item.kolBulanIni || '-',
    'Status Pembayaran': item.isLunas ? `Lunas (Rp ${item.nominalBayarHariIni})` : item.sudahBayar ? `Sudah Bayar (Rp ${item.nominalBayarHariIni})` : 'Belum Bayar',
    'Tanggal Bayar': item.tglBayar ? new Date(item.tglBayar).toLocaleDateString('id-ID') : '-',
    'Jml Kunjungan': item.kunjunganCount
  }));
  
  const cardLabels: Record<string, string> = {
    AMAN: 'Aman (Lancar)',
    JANJI_BAYAR_OVERDUE: 'Janji Bayar Terlewat',
      JANJI_BAYAR_DEKAT: 'Mendekati Janji Bayar',
    H7_DESK_CALL: 'H-7 Desk Call',
    KUNJUNGAN_MO: 'Kunjungan MO',
    SURAT_TAGIHAN: 'Surat Tagihan',
    SP: 'Surat Peringatan',
    SUDAH_DIKUNJUNGI: 'Sudah Dikunjungi',
    BELUM_DIKUNJUNGI: 'Belum Dikunjungi',
    SUDAH_BAYAR: 'Sudah Bayar',
    LUNAS: 'Lunas',
  };

  return (
    <>
      {showSubKantorFilter && subKantorList.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ marginRight: 8, fontWeight: 500, fontSize: '0.9rem' }}>Filter Sub Kantor:</label>
          <select 
            className="inputField" 
            style={{ width: 'auto', padding: '6px 12px' }}
            value={activeSubKantor}
            onChange={(e) => setActiveSubKantor(e.target.value)}
          >
            <option value="ALL">Semua Sub Kantor</option>
            {subKantorList.map(sk => (
              <option key={sk} value={sk}>{sk}</option>
            ))}
          </select>
        </div>
      )}
      <section className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: 24 }}>
        {Object.keys(cardLabels).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveFilter(activeFilter === key ? 'ALL' : key)}
            className="metric-card"
            style={{
              border: activeFilter === key ? `2px solid ${cardColors[key]}` : '1px solid #e2e8f0',
              cursor: 'pointer',
              textAlign: 'left',
              background: activeFilter === key ? '#f8fafc' : 'white',
            }}
          >
            <div className="metric-accent" style={{ background: cardColors[key] }} />
            <div>
              <div className="metric-value">{summaryCounts[key] || 0}</div>
              <div className="metric-label">{cardLabels[key]}</div>
            </div>
          </button>
        ))}
      </section>

      <section className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>
            Daftar Debitur {activeFilter !== 'ALL' && `— ${cardLabels[activeFilter] || activeFilter}`}
          </h2>
          <ExportExcelButton data={excelData} fileName="Collecting_Debitur" sheetName="Collecting" />
          <input
            className="inputField"
            type="search"
            placeholder="Cari nama nasabah atau nomor rekening..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
            style={{ maxWidth: 320 }}
          />
        </div>

        {activeFilter !== 'ALL' && (
          <button type="button" className="button secondary" style={{ marginBottom: 16 }} onClick={() => setActiveFilter('ALL')}>
            Tampilkan Semua
          </button>
        )}

        <p style={{ color: '#64748b', marginBottom: 12 }}>{filtered.length} debitur ditemukan</p>

        <div style={{ display: 'grid', gap: 14 }}>
          {filtered.length === 0 ? (
            <p>Tidak ada data yang cocok.</p>
          ) : (
            filtered.slice((currentPage - 1) * 50, currentPage * 50).map((item) => (
              <article key={item.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <strong>{item.namaNasabahExcel}</strong> — {item.norek}
                    <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#64748b' }}>
                      Kantor: {item.kantorLabel} | Tunggakan: {item.hariTunggakan} hari | AO: {item.namaAO || '-'}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#334155' }}>
                      Rek. Tabungan: <strong>{item.norekTabungan || '-'}</strong> (Saldo: {item.saldoTabungan != null ? 'Rp ' + item.saldoTabungan.toLocaleString('id-ID') : '-'})
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#b91c1c' }}>
                      Nominal Tunggakan: <strong>Rp {((item.tunggakanPokok || 0) + (item.tunggakanBunga || 0)).toLocaleString('id-ID')}</strong>
                    </p>
                      {item.sudahBayar && (
                        <p style={{ margin: '4px 0', fontSize: '0.85rem', color: item.isLunas ? '#2563eb' : '#15803d', fontWeight: 600 }}>
                          ✅ {item.isLunas ? 'Lunas' : 'Sudah Bayar'}: Rp {(item.nominalBayarHariIni || 0).toLocaleString('id-ID')} {item.tglBayar && `(Tgl: ${new Date(item.tglBayar).toLocaleDateString('id-ID')})`}
                        </p>
                      )}
                    {item.ews.wajibKunjungan && item.kunjunganCount === 0 && (
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>Belum ada kunjungan tercatat bulan ini</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <span className={`status-pill ${item.ews.colorClass}`}>{item.ews.label}</span>
                    
                    {item.kolBulanIni && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: 4 }}>
                        <span>Kol: <strong>{item.kolBulanIni}</strong></span>
                        {item.kolBulanLalu && item.kolBulanLalu !== item.kolBulanIni && (
                          <span style={{ 
                            color: Number(item.kolBulanIni) > Number(item.kolBulanLalu) ? '#dc2626' : '#10b981',
                            fontWeight: 600 
                          }}>
                            ({Number(item.kolBulanIni) > Number(item.kolBulanLalu) ? 'Memburuk dari ' : 'Membaik dari '} {item.kolBulanLalu})
                          </span>
                        )}
                      </div>
                    )}

                    {item.lastKunjungan && (
                      <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#475569', marginTop: 4, background: '#f8fafc', padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', minWidth: '220px' }}>
                        <div style={{ fontWeight: 600, color: '#334155', marginBottom: 2 }}>Info Kunjungan Terakhir:</div>
                        <div style={{ marginBottom: 2 }}>Oleh: <strong>{item.lastKunjungan.petugasNama}</strong></div>
                        <div>Status: <strong>{item.lastKunjungan.hasil.replace(/_/g, ' ')}</strong></div>
                        {item.lastKunjungan.tanggalJanjiBayar && (
                          <div style={{ color: '#047857', fontWeight: 600 }}>
                            Janji Bayar: {new Date(item.lastKunjungan.tanggalJanjiBayar).toLocaleDateString('id-ID')}
                          </div>
                        )}
                        {item.lastKunjungan.catatan && (
                          <div style={{ fontStyle: 'italic', marginTop: 2, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            "{item.lastKunjungan.catatan}"
                          </div>
                        )}
                      </div>
                    )}

                    <Link href={`/collecting/pinjaman/${item.id}`} className="button secondary" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                      Detail / Catat Kunjungan
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
          {filtered.length > 50 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <button 
                type="button" 
                className="button secondary" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Sebelumnya
              </button>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Halaman {currentPage} dari {Math.ceil(filtered.length / 50)}
              </span>
              <button 
                type="button" 
                className="button secondary"
                disabled={currentPage === Math.ceil(filtered.length / 50)}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Selanjutnya
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}