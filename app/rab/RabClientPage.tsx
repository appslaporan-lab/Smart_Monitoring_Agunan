'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  FileCheck2, Search, PlusCircle, CheckCircle2, XCircle, Clock, 
  Copy, Check, FileSpreadsheet, AlertCircle, Building2, User, 
  FileText, ShieldCheck, FileSignature, Wallet, ChevronRight, 
  ExternalLink, Eye, ArrowRight, RotateCw, Filter, RefreshCw, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import CurrencyInput from '@/components/CurrencyInput';
import EmptyState from '@/components/EmptyState';
import { SUB_KANTOR_NAMES, getKantorGroup } from '@/lib/kantor';

export type UserSession = {
  id: number;
  nama: string;
  username: string;
  role: string;
  kantor?: string | null;
  subKantor?: string | null;
};

export type PengajuanRabItem = {
  id: number;
  nomorPengajuan: string;
  pinjamanPeriodeId?: number | null;
  norek: string;
  namaNasabah: string;
  subKantor: string;
  kantorGroup?: string | null;
  nominal: number;
  keterangan?: string | null;
  fotoResiUrl?: string | null;
  status: string; // PENDING_VERIFIKASI | DISETUJUI_RAB | MENUNGGU_INPUT_TELLER | SUDAH_INPUT | DITOLAK
  catatanPenolakan?: string | null;

  pemohonId: number;
  pemohonNama: string;
  pemohonRole: string;
  waktuPengajuan: string;

  checkerId?: number | null;
  checkerNama?: string | null;
  checkerRole?: string | null;
  checkerCatatan?: string | null;
  waktuChecker?: string | null;

  signerId?: number | null;
  signerNama?: string | null;
  signerRole?: string | null;
  nomorRab?: string | null;
  waktuSigner?: string | null;

  tellerId?: number | null;
  tellerNama?: string | null;
  noValidasiCbs?: string | null;
  catatanTeller?: string | null;
  waktuTeller?: string | null;

  createdAt: string;
  updatedAt: string;
};

type Props = {
  user: UserSession;
  initialCounts: {
    pendingChecker: number;
    disetujuiSigner: number;
    menungguTeller: number;
    sudahInput: number;
    total: number;
  };
  initialItems: PengajuanRabItem[];
};

const KANTOR_KAS_LIST = [
  { code: '01', name: 'Kas Pusat', group: 'PUSAT_1' },
  { code: '02', name: 'Kas Campurdarat', group: 'CABANG' },
  { code: '03', name: 'Kas Ngunut', group: 'PUSAT_2' },
  { code: '04', name: 'Kas Bandung', group: 'CABANG' },
  { code: '05', name: 'Kas Kalidawir', group: 'PUSAT_2' },
  { code: '06', name: 'Kas Kauman', group: 'PUSAT_1' },
  { code: '07', name: 'Kas Ngantru', group: 'PUSAT_1' },
  { code: '08', name: 'Kas Boyolangu', group: 'CABANG' },
  { code: '09', name: 'Kas Rejotangan', group: 'PUSAT_2' },
  { code: '10', name: 'Kas Ngemplak', group: 'PUSAT_1' },
  { code: '12', name: 'Kas Pucanglaban', group: 'PUSAT_2' },
  { code: '13', name: 'Kas Pakel', group: 'CABANG' },
  { code: '14', name: 'Kas Karangrejo', group: 'PUSAT_1' },
  { code: '15', name: 'Kas Ngentrong', group: 'CABANG' },
];

export default function RabClientPage({ user, initialCounts, initialItems }: Props) {
  // Determine initial tab based on role
  const defaultTab = useMemo(() => {
    const r = (user.role || '').toUpperCase();
    if (r.includes('MO') || r.includes('MARKETING') || r.includes('AO')) return 'tab1_mo';
    if (r.includes('KASUBAG_KREDIT') || r === 'KEPALA_KAS') return 'tab2_checker';
    if (r.includes('AKUNTING') || r.includes('KASUBAG_PUSAT') || r.includes('KASUBAG_CABANG') || r.includes('KABAG_OPERASIONAL')) return 'tab3_signer';
    if (r === 'TELLER') return 'tab4_teller';
    return 'tab5_audit';
  }, [user.role]);

  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [counts, setCounts] = useState(initialCounts);
  const [items, setItems] = useState<PengajuanRabItem[]>(initialItems);
  const [loading, setLoading] = useState<boolean>(false);

  // Copied states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Image Zoom Modal
  const [zoomImage, setZoomImage] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  // Detail Modal
  const [detailItem, setDetailItem] = useState<PengajuanRabItem | null>(null);

  // Checker Modal State
  const [checkerModal, setCheckerModal] = useState<{
    item: PengajuanRabItem;
    action: 'SETUJU' | 'TOLAK';
    catatan: string;
  } | null>(null);

  // Signer Modal State
  const [signerModal, setSignerModal] = useState<{
    item: PengajuanRabItem;
    nomorRab: string;
  } | null>(null);

  // Teller Modal State
  const [tellerModal, setTellerModal] = useState<{
    item: PengajuanRabItem;
    tellerNama: string;
    noValidasiCbs: string;
    catatanTeller: string;
  } | null>(null);

  // ===================== TAB 1 FORM STATE =====================
  const [searchNasabahQuery, setSearchNasabahQuery] = useState('');
  const [nasabahResults, setNasabahResults] = useState<any[]>([]);
  const [searchingNasabah, setSearchingNasabah] = useState(false);
  const [selectedNasabah, setSelectedNasabah] = useState<any | null>(null);
  const [nominalRab, setNominalRab] = useState('');
  const [keteranganRab, setKeteranganRab] = useState('');
  const [fotoResiPreview, setFotoResiPreview] = useState<string | null>(null);
  const [submittingTab1, setSubmittingTab1] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters
  const [checkerKantorFilter, setCheckerKantorFilter] = useState('ALL');
  const [signerWilayahFilter, setSignerWilayahFilter] = useState('ALL');
  const [tellerKantorFilter, setTellerKantorFilter] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditKantorFilter, setAuditKantorFilter] = useState('ALL');
  const [auditStatusFilter, setAuditStatusFilter] = useState('ALL');

  // Reload data
  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rab?tab=${activeTab}`);
      if (!res.ok) throw new Error('Gagal memuat data');
      const data = await res.json();
      if (data.items) setItems(data.items);
      if (data.counts) setCounts(data.counts);
    } catch (err: any) {
      toast.error(err.message || 'Gagal merefresh data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  // Nasabah search with debounce
  useEffect(() => {
    if (!searchNasabahQuery || searchNasabahQuery.trim().length < 2) {
      setNasabahResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingNasabah(true);
      try {
        const res = await fetch(`/api/rab/nasabah-search?q=${encodeURIComponent(searchNasabahQuery.trim())}`);
        const data = await res.json();
        setNasabahResults(data.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setSearchingNasabah(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchNasabahQuery]);

  // Handle Photo Upload with Client-Side Canvas Compression
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa foto/gambar.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setFotoResiPreview(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Submit Tab 1 (MO)
  const handleSubmitTab1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNasabah) {
      toast.error('Pilih nasabah dari nominatif terlebih dahulu.');
      return;
    }
    if (!nominalRab || Number(nominalRab) <= 0) {
      toast.error('Masukkan nominal RAB yang valid.');
      return;
    }
    if (!fotoResiPreview) {
      toast.error('Foto bukti resi/setoran wajib dilampirkan.');
      return;
    }

    setSubmittingTab1(true);
    try {
      const res = await fetch('/api/rab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pinjamanPeriodeId: selectedNasabah.id,
          norek: selectedNasabah.norek,
          namaNasabah: selectedNasabah.namaNasabahExcel,
          subKantor: selectedNasabah.subKantor,
          nominal: Number(nominalRab),
          keterangan: keteranganRab,
          fotoResiUrl: fotoResiPreview,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal mengirim pengajuan.');

      toast.success(`Pengajuan ${json.data.nomorPengajuan} berhasil dikirim! Status: PENDING VERIFIKASI`);
      // Reset form
      setSelectedNasabah(null);
      setSearchNasabahQuery('');
      setNominalRab('');
      setKeteranganRab('');
      setFotoResiPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      refreshData();
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan.');
    } finally {
      setSubmittingTab1(false);
    }
  };

  // 1-Click Copy helper
  const handleCopy = (text: string, key: string, label: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(`${label} berhasil disalin!`);
      setTimeout(() => setCopiedKey(null), 2000);
    } else {
      toast.error('Fitur copy tidak didukung browser ini');
    }
  };

  // Submit Checker Action (Setuju / Tolak)
  const handleCheckerSubmit = async () => {
    if (!checkerModal) return;
    const { item, action, catatan } = checkerModal;

    if (action === 'TOLAK' && !catatan.trim()) {
      toast.error('Alasan penolakan wajib diisi.');
      return;
    }

    try {
      const res = await fetch(`/api/rab/${item.id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, catatan }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal memproses verifikasi');

      toast.success(
        action === 'SETUJU'
          ? 'Pengajuan disetujui! Status: DISETUJUI (SIAP PROSES RAB)'
          : 'Pengajuan telah ditolak.'
      );
      setCheckerModal(null);
      refreshData();
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan');
    }
  };

  // Open Signer Modal with Auto Prefix
  const openSignerModal = (item: PengajuanRabItem) => {
    const isPusat = item.kantorGroup === 'PUSAT_1' || item.kantorGroup === 'PUSAT_2';
    const prefix = isPusat ? 'RAB-PST-' : 'RAB-CPD-';
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const suggested = `${prefix}${todayStr}-${String(item.id).padStart(4, '0')}`;
    setSignerModal({ item, nomorRab: suggested });
  };

  // Submit Signer Action (Terbitkan Nomor RAB)
  const handleSignerSubmit = async () => {
    if (!signerModal) return;
    const { item, nomorRab } = signerModal;
    if (!nomorRab || !nomorRab.trim()) {
      toast.error('Nomor RAB wajib diisi.');
      return;
    }

    try {
      const res = await fetch(`/api/rab/${item.id}/sign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomorRab: nomorRab.trim().toUpperCase() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menerbitkan RAB');

      toast.success(`RAB ${json.data.nomorRab} berhasil diterbitkan! Status: MENUNGGU INPUT TELLER`);
      setSignerModal(null);
      refreshData();
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan');
    }
  };

  // Open Teller Modal
  const openTellerModal = (item: PengajuanRabItem) => {
    setTellerModal({
      item,
      tellerNama: user.nama || '',
      noValidasiCbs: '',
      catatanTeller: '',
    });
  };

  // Submit Teller Action (Sudah Input RAB)
  const handleTellerSubmit = async () => {
    if (!tellerModal) return;
    const { item, tellerNama, noValidasiCbs, catatanTeller } = tellerModal;

    if (!noValidasiCbs || !noValidasiCbs.trim()) {
      toast.error('Nomor Validasi Kas CBS wajib diisi.');
      return;
    }

    try {
      const res = await fetch(`/api/rab/${item.id}/execute`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tellerNama: tellerNama.trim(),
          noValidasiCbs: noValidasiCbs.trim(),
          catatanTeller: catatanTeller.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal mengeksekusi');

      toast.success('Pengajuan RAB selesai diinput ke CBS! Status: SUDAH INPUT ✅');
      setTellerModal(null);
      refreshData();
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan');
    }
  };

  // Export Excel Tab 5
  const handleExportExcel = () => {
    if (!filteredAuditItems || filteredAuditItems.length === 0) {
      toast.error('Tidak ada data untuk diekspor.');
      return;
    }

    const aoa: any[][] = [
      ['LAPORAN REKAPITULASI PENGAJUAN RAB (RENCANA ANGGARAN BIAYA)'],
      [`Waktu Unduh: ${new Date().toLocaleString('id-ID')}`],
      [],
      [
        'No',
        'No. Pengajuan',
        'No. RAB',
        'Tanggal Pengajuan',
        'Nama Nasabah',
        'No. Rekening',
        'Kantor Kas',
        'Wilayah',
        'Nominal (Rp)',
        'Status',
        'Pemohon (MO)',
        'Waktu Pengajuan',
        'Checker (Pemeriksa)',
        'Waktu Checker',
        'Catatan Checker',
        'Signer (Penerbit RAB)',
        'Waktu Signer',
        'Teller (Eksekutor)',
        'No. Validasi CBS',
        'Waktu Teller',
        'Catatan Teller / Alasan Penolakan',
      ],
    ];

    filteredAuditItems.forEach((it, idx) => {
      aoa.push([
        idx + 1,
        it.nomorPengajuan,
        it.nomorRab || '-',
        new Date(it.waktuPengajuan).toLocaleDateString('id-ID'),
        it.namaNasabah,
        it.norek,
        SUB_KANTOR_NAMES[it.subKantor] || it.subKantor,
        it.kantorGroup || '-',
        it.nominal,
        formatStatusLabel(it.status),
        `${it.pemohonNama} (${it.pemohonRole})`,
        new Date(it.waktuPengajuan).toLocaleString('id-ID'),
        it.checkerNama ? `${it.checkerNama} (${it.checkerRole})` : '-',
        it.waktuChecker ? new Date(it.waktuChecker).toLocaleString('id-ID') : '-',
        it.checkerCatatan || '-',
        it.signerNama ? `${it.signerNama} (${it.signerRole})` : '-',
        it.waktuSigner ? new Date(it.waktuSigner).toLocaleString('id-ID') : '-',
        it.tellerNama || '-',
        it.noValidasiCbs || '-',
        it.waktuTeller ? new Date(it.waktuTeller).toLocaleString('id-ID') : '-',
        it.catatanPenolakan || it.catatanTeller || '-',
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan RAB');
    XLSX.writeFile(wb, `Laporan_Pengajuan_RAB_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('File Excel berhasil diunduh!');
  };

  // Helper formatters
  function formatStatusLabel(st: string) {
    switch (st) {
      case 'PENDING_VERIFIKASI':
        return 'Pending Verifikasi';
      case 'DISETUJUI_RAB':
        return 'Disetujui (Siap RAB)';
      case 'MENUNGGU_INPUT_TELLER':
        return 'Menunggu Input Teller';
      case 'SUDAH_INPUT':
        return 'Sudah Input ✅';
      case 'DITOLAK':
        return 'Ditolak ❌';
      default:
        return st;
    }
  }

  function getStatusBadgeStyle(st: string) {
    switch (st) {
      case 'PENDING_VERIFIKASI':
        return { background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' };
      case 'DISETUJUI_RAB':
        return { background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe' };
      case 'MENUNGGU_INPUT_TELLER':
        return { background: '#fce7f3', color: '#9d174d', border: '1px solid #fbcfe8' };
      case 'SUDAH_INPUT':
        return { background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' };
      case 'DITOLAK':
        return { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' };
      default:
        return { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' };
    }
  }

  // Filtered lists for each tab
  const tab1MyItems = useMemo(() => {
    return items.filter((it) => user.role === 'SUPERADMIN' || it.pemohonId === user.id);
  }, [items, user.id, user.role]);

  const tab2CheckerItems = useMemo(() => {
    return items.filter((it) => {
      if (it.status !== 'PENDING_VERIFIKASI') return false;
      if (checkerKantorFilter !== 'ALL' && it.subKantor !== checkerKantorFilter) return false;
      return true;
    });
  }, [items, checkerKantorFilter]);

  const tab3SignerItems = useMemo(() => {
    return items.filter((it) => {
      if (it.status !== 'DISETUJUI_RAB') return false;
      if (signerWilayahFilter === 'PUSAT' && !(it.kantorGroup === 'PUSAT_1' || it.kantorGroup === 'PUSAT_2')) return false;
      if (signerWilayahFilter === 'CABANG' && it.kantorGroup !== 'CABANG') return false;
      return true;
    });
  }, [items, signerWilayahFilter]);

  const tab4TellerItems = useMemo(() => {
    return items.filter((it) => {
      if (it.status !== 'MENUNGGU_INPUT_TELLER') return false;
      if (tellerKantorFilter !== 'ALL' && it.subKantor !== tellerKantorFilter) return false;
      return true;
    });
  }, [items, tellerKantorFilter]);

  const filteredAuditItems = useMemo(() => {
    return items.filter((it) => {
      if (auditStatusFilter !== 'ALL' && it.status !== auditStatusFilter) return false;
      if (auditKantorFilter !== 'ALL' && it.subKantor !== auditKantorFilter) return false;
      if (auditSearch.trim()) {
        const q = auditSearch.toLowerCase();
        const matches =
          it.namaNasabah.toLowerCase().includes(q) ||
          it.norek.toLowerCase().includes(q) ||
          it.nomorPengajuan.toLowerCase().includes(q) ||
          (it.nomorRab && it.nomorRab.toLowerCase().includes(q)) ||
          it.pemohonNama.toLowerCase().includes(q) ||
          (it.tellerNama && it.tellerNama.toLowerCase().includes(q)) ||
          (it.noValidasiCbs && it.noValidasiCbs.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [items, auditStatusFilter, auditKantorFilter, auditSearch]);

  return (
    <div className="container" style={{ maxWidth: '1280px', paddingBottom: '60px' }}>
      {/* HEADER SECTION */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: '#2563eb', padding: '8px', borderRadius: '10px', color: 'white', display: 'flex' }}>
                <FileCheck2 size={24} />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>Alur Pengajuan RAB</h1>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Sistem kolaborasi terpadu 5 Tab: Input MO ➔ Checker Kasubag/Kepala Kas ➔ Signer RAB ➔ Executor Teller ➔ Audit Trail
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: '10px', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>Peran Anda: </span>
              <strong style={{ color: '#2563eb' }}>{user.role}</strong>
              <span style={{ margin: '0 6px', color: '#cbd5e1' }}>|</span>
              <span style={{ color: '#334155' }}>{user.nama}</span>
            </div>
            <button
              onClick={refreshData}
              disabled={loading}
              className="button secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: '0.85rem' }}
              title="Segarkan data antrean"
            >
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
              Segarkan
            </button>
          </div>
        </div>

        {/* WORKFLOW BREADCRUMB INDICATOR */}
        <div
          style={{
            marginTop: 18,
            padding: '12px 16px',
            background: 'linear-gradient(90deg, #eff6ff 0%, #f0fdf4 100%)',
            border: '1px solid #bfdbfe',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: '0.82rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1e40af', fontWeight: 600 }}>
            <span>Alur Transparan:</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
              1. Input (MO)
            </span>
            <ArrowRight size={14} color="#94a3b8" />
            <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
              2. Checker Kas/Kasubag
            </span>
            <ArrowRight size={14} color="#94a3b8" />
            <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
              3. Signer RAB (Pusat/Cabang)
            </span>
            <ArrowRight size={14} color="#94a3b8" />
            <span style={{ background: '#fce7f3', color: '#9d174d', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
              4. Teller (CBS Input)
            </span>
            <ArrowRight size={14} color="#94a3b8" />
            <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
              5. Audit Trail & Selesai ✅
            </span>
          </div>
        </div>
      </div>

      {/* 5 TABS NAVIGATION */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: 2,
          marginBottom: 24,
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => setActiveTab('tab1_mo')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            background: activeTab === 'tab1_mo' ? '#2563eb' : 'transparent',
            color: activeTab === 'tab1_mo' ? 'white' : '#64748b',
            border: 'none',
            borderRadius: '10px 10px 0 0',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <PlusCircle size={18} />
          Tab 1: Input (MO)
        </button>

        <button
          onClick={() => setActiveTab('tab2_checker')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            background: activeTab === 'tab2_checker' ? '#2563eb' : 'transparent',
            color: activeTab === 'tab2_checker' ? 'white' : '#64748b',
            border: 'none',
            borderRadius: '10px 10px 0 0',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <ShieldCheck size={18} />
          Tab 2: Checker
          {counts.pendingChecker > 0 && (
            <span
              style={{
                background: activeTab === 'tab2_checker' ? '#ef4444' : '#ef4444',
                color: 'white',
                padding: '2px 7px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {counts.pendingChecker}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tab3_signer')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            background: activeTab === 'tab3_signer' ? '#2563eb' : 'transparent',
            color: activeTab === 'tab3_signer' ? 'white' : '#64748b',
            border: 'none',
            borderRadius: '10px 10px 0 0',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <FileSignature size={18} />
          Tab 3: Signer RAB
          {counts.disetujuiSigner > 0 && (
            <span
              style={{
                background: '#4f46e5',
                color: 'white',
                padding: '2px 7px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {counts.disetujuiSigner}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tab4_teller')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            background: activeTab === 'tab4_teller' ? '#2563eb' : 'transparent',
            color: activeTab === 'tab4_teller' ? 'white' : '#64748b',
            border: 'none',
            borderRadius: '10px 10px 0 0',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Wallet size={18} />
          Tab 4: Executor Teller
          {counts.menungguTeller > 0 && (
            <span
              style={{
                background: '#ec4899',
                color: 'white',
                padding: '2px 7px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {counts.menungguTeller}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tab5_audit')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            background: activeTab === 'tab5_audit' ? '#2563eb' : 'transparent',
            color: activeTab === 'tab5_audit' ? 'white' : '#64748b',
            border: 'none',
            borderRadius: '10px 10px 0 0',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <FileSpreadsheet size={18} />
          Tab 5: Audit Trail & Monitoring
          <span
            style={{
              background: activeTab === 'tab5_audit' ? '#10b981' : '#e2e8f0',
              color: activeTab === 'tab5_audit' ? 'white' : '#475569',
              padding: '2px 7px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {counts.total}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INPUT (MO)                                                         */}
      {/* ========================================================================= */}
      {activeTab === 'tab1_mo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                Formulir Pengajuan RAB Baru (MO / Marketing)
              </h2>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                Cari dan pilih nasabah dari data nominatif CBS. Nomor rekening otomatis terkunci demi integritas data transaksi.
              </p>
            </div>

            <form onSubmit={handleSubmitTab1}>
              {/* Step 1: Debtor Lookup */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: '0.9rem', color: '#334155' }}>
                  1. Cari Nasabah dari Nominatif CBS <span style={{ color: '#ef4444' }}>*</span>
                </label>

                {!selectedNasabah ? (
                  <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                      <Search size={18} style={{ position: 'absolute', left: 14, color: '#94a3b8' }} />
                      <input
                        type="text"
                        className="inputField"
                        style={{ paddingLeft: 42 }}
                        placeholder="Ketik minimal 2 karakter (Nama nasabah atau Nomor Rekening)..."
                        value={searchNasabahQuery}
                        onChange={(e) => setSearchNasabahQuery(e.target.value)}
                      />
                      {searchingNasabah && (
                        <div style={{ position: 'absolute', right: 14, fontSize: '0.8rem', color: '#64748b' }}>
                          Mencari...
                        </div>
                      )}
                    </div>

                    {nasabahResults.length > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          zIndex: 50,
                          background: 'white',
                          border: '1px solid #cbd5e1',
                          borderRadius: 12,
                          marginTop: 4,
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                          maxHeight: 280,
                          overflowY: 'auto',
                        }}
                      >
                        {nasabahResults.map((nas) => (
                          <div
                            key={nas.id}
                            onClick={() => {
                              setSelectedNasabah(nas);
                              setSearchNasabahQuery('');
                              setNasabahResults([]);
                            }}
                            style={{
                              padding: '10px 16px',
                              borderBottom: '1px solid #f1f5f9',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                          >
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{nas.namaNasabahExcel}</div>
                              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                Norek: <strong style={{ color: '#2563eb' }}>{nas.norek}</strong> | AO: {nas.namaAO || '-'}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                              <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                                {SUB_KANTOR_NAMES[nas.subKantor] || nas.subKantor}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: 12,
                      padding: 16,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem' }}>{selectedNasabah.namaNasabahExcel}</h4>
                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600 }}>
                          Nasabah Terpilih
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: '0.85rem', color: '#475569', flexWrap: 'wrap' }}>
                        <span>
                          Kantor: <strong>{SUB_KANTOR_NAMES[selectedNasabah.subKantor] || selectedNasabah.subKantor}</strong>
                        </span>
                        <span>
                          Wilayah: <strong>{getKantorGroup(selectedNasabah.subKantor) || 'CABANG'}</strong>
                        </span>
                        <span>
                          AO: <strong>{selectedNasabah.namaAO || '-'}</strong>
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedNasabah(null)}
                      className="button secondary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                    >
                      Ganti Nasabah
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: Locked Norek Field */}
              <div className="form-grid" style={{ marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, marginBottom: 8, fontSize: '0.9rem', color: '#334155' }}>
                    <Lock size={15} color="#64748b" />
                    Nomor Rekening (Terkunci Otomatis) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={selectedNasabah ? selectedNasabah.norek : ''}
                    placeholder="Pilih nasabah di atas untuk mengunci rekening..."
                    className="inputField"
                    style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#1e293b', fontWeight: 600 }}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                    🔒 Rekening terkunci demi mencegah salah bayar / salah kredit di CBS.
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: '0.9rem', color: '#334155' }}>
                    Nominal Pengajuan RAB (Rp) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <CurrencyInput
                    value={nominalRab}
                    onChange={(val) => setNominalRab(val)}
                    placeholder="Contoh: Rp 1.500.000"
                    required
                  />
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                    Masukkan nominal pengajuan yang sesuai dengan bukti resi transfer/setoran.
                  </div>
                </div>
              </div>

              {/* Step 3: Keterangan & Upload Bukti Resi */}
              <div className="form-grid" style={{ marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: '0.9rem', color: '#334155' }}>
                    Keterangan / Keperluan RAB
                  </label>
                  <textarea
                    rows={4}
                    className="inputField"
                    placeholder="Tuliskan keterangan pengajuan RAB (misal: pelunasan titipan nasabah, angsuran kredit via transfer, dll)..."
                    value={keteranganRab}
                    onChange={(e) => setKeteranganRab(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: '0.9rem', color: '#334155' }}>
                    Foto Bukti Resi / Setoran / Transfer <span style={{ color: '#ef4444' }}>*</span>
                  </label>

                  <div
                    style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: 12,
                      padding: 16,
                      textAlign: 'center',
                      background: fotoResiPreview ? '#f8fafc' : '#ffffff',
                    }}
                  >
                    {!fotoResiPreview ? (
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          style={{ display: 'none' }}
                          id="fotoResiUpload"
                        />
                        <label
                          htmlFor="fotoResiUpload"
                          style={{
                            cursor: 'pointer',
                            display: 'inline-block',
                            padding: '10px 18px',
                            background: '#eff6ff',
                            color: '#2563eb',
                            borderRadius: 8,
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            marginBottom: 8,
                          }}
                        >
                          Pilih / Ambil Foto Bukti Resi
                        </label>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Format gambar JPG/PNG (otomatis dikompresi agar ringan)
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <img
                            src={fotoResiPreview}
                            alt="Bukti Resi"
                            style={{
                              maxHeight: '160px',
                              borderRadius: 8,
                              border: '1px solid #cbd5e1',
                              cursor: 'pointer',
                            }}
                            onClick={() =>
                              setZoomImage({
                                url: fotoResiPreview,
                                title: 'Foto Bukti Resi (Preview Pengajuan)',
                                subtitle: selectedNasabah ? `${selectedNasabah.namaNasabahExcel} - ${selectedNasabah.norek}` : undefined,
                              })
                            }
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10 }}>
                          <button
                            type="button"
                            className="button secondary"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            onClick={() =>
                              setZoomImage({
                                url: fotoResiPreview,
                                title: 'Foto Bukti Resi (Preview Pengajuan)',
                                subtitle: selectedNasabah ? `${selectedNasabah.namaNasabahExcel} - ${selectedNasabah.norek}` : undefined,
                              })
                            }
                          >
                            <Eye size={13} style={{ marginRight: 4 }} />
                            Perbesar
                          </button>
                          <button
                            type="button"
                            className="button danger"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            onClick={() => {
                              setFotoResiPreview(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                          >
                            Hapus Foto
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={submittingTab1}
                  className="button"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', fontSize: '0.95rem' }}
                >
                  {submittingTab1 ? (
                    'Mengirim Pengajuan...'
                  ) : (
                    <>
                      <FileCheck2 size={18} />
                      Kirim Pengajuan RAB
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Submissions Created by Current MO */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  Riwayat Pengajuan Saya (MO / Marketing)
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                  Daftar pengajuan RAB yang Anda kirim beserta status persetujuan berjenjang
                </p>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Total: <strong>{tab1MyItems.length}</strong> pengajuan
              </span>
            </div>

            {tab1MyItems.length === 0 ? (
              <EmptyState
                title="Belum Ada Pengajuan"
                description="Anda belum memiliki pengajuan RAB. Silakan isi formulir di atas untuk mengajukan RAB baru."
              />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                      <th style={{ padding: '12px 14px' }}>No. Pengajuan</th>
                      <th style={{ padding: '12px 14px' }}>Nasabah & Rekening</th>
                      <th style={{ padding: '12px 14px' }}>Kantor Kas</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Nominal (Rp)</th>
                      <th style={{ padding: '12px 14px' }}>Status Alur</th>
                      <th style={{ padding: '12px 14px' }}>Bukti Resi</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tab1MyItems.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>
                          {item.nomorPengajuan}
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {new Date(item.waktuPengajuan).toLocaleDateString('id-ID')}
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.namaNasabah}</div>
                          <div style={{ fontSize: '0.8rem', color: '#2563eb' }}>{item.norek}</div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div>{SUB_KANTOR_NAMES[item.subKantor] || item.subKantor}</div>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.kantorGroup}</span>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>
                          Rp {item.nominal.toLocaleString('id-ID')}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              ...getStatusBadgeStyle(item.status),
                              padding: '4px 10px',
                              borderRadius: 12,
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              display: 'inline-block',
                            }}
                          >
                            {formatStatusLabel(item.status)}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          {item.fotoResiUrl ? (
                            <button
                              type="button"
                              onClick={() =>
                                setZoomImage({
                                  url: item.fotoResiUrl!,
                                  title: `Bukti Resi - ${item.nomorPengajuan}`,
                                  subtitle: `${item.namaNasabah} (${item.norek})`,
                                })
                              }
                              className="button secondary"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <Eye size={13} />
                              Lihat Foto
                            </button>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setDetailItem(item)}
                            className="button secondary"
                            style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                          >
                            Audit Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CHECKER (Kasubag Kredit / Kepala Kas)                              */}
      {/* ========================================================================= */}
      {activeTab === 'tab2_checker' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Rules info box */}
          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <AlertCircle size={20} color="#b45309" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: '0.85rem', color: '#92400e' }}>
              <strong>Aturan Verifikasi Checker:</strong>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: 18 }}>
                <li>
                  Khusus <strong>Kas Pusat (01)</strong> & <strong>Kas Campurdarat (02)</strong> ditangani oleh <strong>Kasubag Kredit</strong>.
                </li>
                <li>
                  Kantor kas lainnya (12 kantor kas) ditangani langsung oleh <strong>Kepala Kas</strong> masing-masing.
                </li>
                <li>
                  Periksa dengan teliti kecocokan antara <strong>Foto Bukti Resi / Setoran</strong> dengan <strong>Nomor Rekening</strong> serta nominal pengajuan sebelum menyetujui.
                </li>
              </ul>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Filter size={18} color="#64748b" />
              <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>Filter Kantor Kas:</label>
              <select
                className="inputField"
                style={{ width: 'auto', minWidth: 220, padding: '8px 12px' }}
                value={checkerKantorFilter}
                onChange={(e) => setCheckerKantorFilter(e.target.value)}
              >
                <option value="ALL">Semua Kantor (14 Kas)</option>
                {KANTOR_KAS_LIST.map((k) => (
                  <option key={k.code} value={k.code}>
                    {k.code} - {k.name} ({k.group})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Antrean Menunggu Verifikasi: <strong style={{ color: '#b45309' }}>{tab2CheckerItems.length}</strong>
            </div>
          </div>

          {/* Antrean Checker */}
          {tab2CheckerItems.length === 0 ? (
            <EmptyState
              title="Tidak Ada Antrean Checker"
              description="Semua pengajuan RAB telah diverifikasi. Tidak ada pengajuan baru berstatus PENDING VERIFIKASI saat ini."
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
              {tab2CheckerItems.map((item) => {
                const sub = (item.subKantor || '').toUpperCase();
                const isPusatOrCpd = sub === '01' || sub === '02' || sub.includes('PUSAT') || sub.includes('CAMPURDARAT');
                const checkerRuleNotice = isPusatOrCpd ? 'Wajib disetujui Kasubag Kredit' : 'Wajib disetujui Kepala Kas';

                return (
                  <div
                    key={item.id}
                    className="card"
                    style={{
                      padding: 18,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderLeft: '4px solid #f59e0b',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{item.nomorPengajuan}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {new Date(item.waktuPengajuan).toLocaleString('id-ID')}
                          </div>
                        </div>
                        <span
                          style={{
                            background: '#fef3c7',
                            color: '#b45309',
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          Pending Verifikasi
                        </span>
                      </div>

                      <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{item.namaNasabah}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>No. Rekening:</span>
                          <strong style={{ fontSize: '0.9rem', color: '#2563eb' }}>{item.norek}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.82rem' }}>
                          <span style={{ color: '#475569' }}>
                            Kantor: <strong>{SUB_KANTOR_NAMES[item.subKantor] || item.subKantor}</strong>
                          </span>
                          <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.95rem' }}>
                            Rp {item.nominal.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: 12 }}>
                        <div>
                          Pemohon (MO): <strong>{item.pemohonNama}</strong> ({item.pemohonRole})
                        </div>
                        {item.keterangan && (
                          <div style={{ marginTop: 4, color: '#64748b', fontStyle: 'italic' }}>
                            &ldquo;{item.keterangan}&rdquo;
                          </div>
                        )}
                        <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>
                          ℹ️ {checkerRuleNotice}
                        </div>
                      </div>

                      {/* Bukti Resi Preview */}
                      {item.fotoResiUrl ? (
                        <div
                          style={{
                            marginBottom: 14,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: 8,
                            borderRadius: 8,
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                          }}
                          onClick={() =>
                            setZoomImage({
                              url: item.fotoResiUrl!,
                              title: `Cek Bukti Resi vs No. Rekening: ${item.norek}`,
                              subtitle: `Nasabah: ${item.namaNasabah} | Pengajuan: ${item.nomorPengajuan} | Rp ${item.nominal.toLocaleString('id-ID')}`,
                            })
                          }
                        >
                          <img
                            src={item.fotoResiUrl}
                            alt="Resi"
                            style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                          <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e40af' }}>
                              🔍 Klik untuk Cek Foto Resi vs No. Rekening
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Pastikan nomor rekening di resi cocok</div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginBottom: 14, fontSize: '0.78rem', color: '#ef4444' }}>
                          ⚠️ Tidak ada foto bukti resi terlampir.
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                      <button
                        type="button"
                        onClick={() => setCheckerModal({ item, action: 'SETUJU', catatan: '' })}
                        className="button"
                        style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}
                      >
                        <CheckCircle2 size={16} />
                        Setujui
                      </button>
                      <button
                        type="button"
                        onClick={() => setCheckerModal({ item, action: 'TOLAK', catatan: '' })}
                        className="button danger"
                        style={{ padding: '8px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <XCircle size={16} />
                        Tolak
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SIGNER RAB (Akunting Pusat & Kasubag Ops Cabang)                   */}
      {/* ========================================================================= */}
      {activeTab === 'tab3_signer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Rules info box */}
          <div
            style={{
              background: '#eef2ff',
              border: '1px solid #c7d2fe',
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <AlertCircle size={20} color="#4338ca" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: '0.85rem', color: '#3730a3' }}>
              <strong>Aturan Signer Penerbitan Nomor RAB:</strong>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: 18 }}>
                <li>
                  <strong>Wilayah Pusat 1 &amp; Pusat 2</strong>: Diproses oleh <strong>Akunting Pusat</strong>. Format nomor RAB otomatis diawali: <code>RAB-PST-...</code>
                </li>
                <li>
                  <strong>Wilayah Cabang Campurdarat</strong>: Diproses oleh <strong>Kasubag Operasional Cabang</strong>. Format nomor RAB otomatis diawali: <code>RAB-CPD-...</code>
                </li>
                <li>
                  Setelah nomor RAB diterbitkan, status langsung berganti ke <strong>MENUNGGU INPUT TELLER</strong> sehingga Teller di kantor kas tujuan dapat memproses di Core Banking System.
                </li>
              </ul>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Filter size={18} color="#64748b" />
              <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>Filter Wilayah:</label>
              <select
                className="inputField"
                style={{ width: 'auto', minWidth: 200, padding: '8px 12px' }}
                value={signerWilayahFilter}
                onChange={(e) => setSignerWilayahFilter(e.target.value)}
              >
                <option value="ALL">Semua Wilayah</option>
                <option value="PUSAT">Wilayah Pusat (Pusat 1 &amp; 2) ➔ Akunting Pusat</option>
                <option value="CABANG">Wilayah Cabang ➔ Kasubag Ops Cabang</option>
              </select>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Antrean Siap Terbit RAB: <strong style={{ color: '#4338ca' }}>{tab3SignerItems.length}</strong>
            </div>
          </div>

          {/* Antrean Signer */}
          {tab3SignerItems.length === 0 ? (
            <EmptyState
              title="Tidak Ada Antrean Signer RAB"
              description="Tidak ada pengajuan berstatus DISETUJUI (SIAP PROSES RAB) saat ini."
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
              {tab3SignerItems.map((item) => {
                const isPusat = item.kantorGroup === 'PUSAT_1' || item.kantorGroup === 'PUSAT_2';
                const prefixLabel = isPusat ? 'RAB-PST-...' : 'RAB-CPD-...';

                return (
                  <div
                    key={item.id}
                    className="card"
                    style={{
                      padding: 18,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderLeft: '4px solid #6366f1',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{item.nomorPengajuan}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            Checker: <strong>{item.checkerNama}</strong> ({item.checkerRole})
                          </div>
                        </div>
                        <span
                          style={{
                            background: '#e0e7ff',
                            color: '#3730a3',
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          Disetujui Checker
                        </span>
                      </div>

                      <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{item.namaNasabah}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>No. Rekening:</span>
                          <strong style={{ fontSize: '0.9rem', color: '#2563eb' }}>{item.norek}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.82rem' }}>
                          <span style={{ color: '#475569' }}>
                            Kantor: <strong>{SUB_KANTOR_NAMES[item.subKantor] || item.subKantor}</strong>
                          </span>
                          <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.95rem' }}>
                            Rp {item.nominal.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: 14 }}>
                        <div>
                          Wilayah: <strong style={{ color: isPusat ? '#2563eb' : '#059669' }}>{item.kantorGroup}</strong>
                        </div>
                        <div style={{ marginTop: 4 }}>
                          Format Awalan: <code style={{ background: '#e0e7ff', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>{prefixLabel}</code>
                        </div>
                        {item.checkerCatatan && (
                          <div style={{ marginTop: 6, color: '#475569', background: '#f1f5f9', padding: 6, borderRadius: 6, fontSize: '0.75rem' }}>
                            Catatan Checker: &ldquo;{item.checkerCatatan}&rdquo;
                          </div>
                        )}
                      </div>

                      {item.fotoResiUrl && (
                        <div
                          style={{
                            marginBottom: 14,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: 6,
                            borderRadius: 8,
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                          }}
                          onClick={() =>
                            setZoomImage({
                              url: item.fotoResiUrl!,
                              title: `Bukti Resi - ${item.nomorPengajuan}`,
                              subtitle: `${item.namaNasabah} (${item.norek}) - Rp ${item.nominal.toLocaleString('id-ID')}`,
                            })
                          }
                        >
                          <img
                            src={item.fotoResiUrl}
                            alt="Resi"
                            style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4 }}
                          />
                          <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600 }}>Lihat Bukti Resi</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                      <button
                        type="button"
                        onClick={() => openSignerModal(item)}
                        className="button"
                        style={{ flex: 1, padding: '9px 14px', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}
                      >
                        <FileSignature size={16} />
                        Terbitkan Nomor RAB
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: EXECUTOR TELLER (14 Kantor Kas)                                    */}
      {/* ========================================================================= */}
      {activeTab === 'tab4_teller' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Rules info box */}
          <div
            style={{
              background: '#fdf2f8',
              border: '1px solid #fbcfe8',
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <Wallet size={20} color="#be185d" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: '0.85rem', color: '#9d174d' }}>
              <strong>Panduan Eksekusi Teller (14 Kantor Kas):</strong>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: 18 }}>
                <li>
                  Pilih kantor kas Anda pada dropdown filter untuk melihat antrean kas masing-masing.
                </li>
                <li>
                  Gunakan tombol <strong>1-Click Copy</strong> pada <strong>No. Rekening</strong> dan <strong>No. RAB</strong> untuk kemudahan salin-tempel langsung ke Core Banking System (CBS).
                </li>
                <li>
                  Setelah transaksi berhasil diinput di CBS, klik <strong>&ldquo;Sudah Input RAB&rdquo;</strong> dan masukkan <strong>No. Validasi Kas CBS</strong> untuk menyelesaikan alur.
                </li>
              </ul>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Building2 size={18} color="#64748b" />
              <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>Pilih Kantor Kas Anda:</label>
              <select
                className="inputField"
                style={{ width: 'auto', minWidth: 240, padding: '8px 12px' }}
                value={tellerKantorFilter}
                onChange={(e) => setTellerKantorFilter(e.target.value)}
              >
                <option value="ALL">Semua Kantor (14 Kas)</option>
                {KANTOR_KAS_LIST.map((k) => (
                  <option key={k.code} value={k.code}>
                    {k.code} - {k.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Antrean Menunggu Input Teller: <strong style={{ color: '#db2777' }}>{tab4TellerItems.length}</strong>
            </div>
          </div>

          {/* Antrean Teller */}
          {tab4TellerItems.length === 0 ? (
            <EmptyState
              title="Tidak Ada Antrean Teller"
              description="Semua transaksi RAB di kantor ini telah diselesaikan ke Core Banking System (CBS)."
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
              {tab4TellerItems.map((item) => (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderLeft: '4px solid #ec4899',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Nomor RAB Resmi:</span>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#be185d' }}>{item.nomorRab}</div>
                      </div>
                      <span
                        style={{
                          background: '#fce7f3',
                          color: '#9d174d',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        Menunggu Input Teller
                      </span>
                    </div>

                    {/* 1-Click Copy Buttons Area */}
                    <div
                      style={{
                        background: '#fdf2f8',
                        border: '1px solid #fbcfe8',
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 14,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Nomor Rekening:</div>
                          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>{item.norek}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.norek, `norek-${item.id}`, 'Nomor Rekening')}
                          className="button"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            background: copiedKey === `norek-${item.id}` ? '#10b981' : '#2563eb',
                          }}
                        >
                          {copiedKey === `norek-${item.id}` ? <Check size={14} /> : <Copy size={14} />}
                          {copiedKey === `norek-${item.id}` ? 'Tersalin!' : 'Salin Rekening'}
                        </button>
                      </div>

                      <div style={{ height: 1, background: '#fbcfe8' }} />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Nomor RAB:</div>
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#be185d' }}>{item.nomorRab}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.nomorRab || '', `rab-${item.id}`, 'Nomor RAB')}
                          className="button"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            background: copiedKey === `rab-${item.id}` ? '#10b981' : '#be185d',
                          }}
                        >
                          {copiedKey === `rab-${item.id}` ? <Check size={14} /> : <Copy size={14} />}
                          {copiedKey === `rab-${item.id}` ? 'Tersalin!' : 'Salin No. RAB'}
                        </button>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.98rem' }}>{item.namaNasabah}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.85rem' }}>
                        <span style={{ color: '#475569' }}>
                          Kantor: <strong>{SUB_KANTOR_NAMES[item.subKantor] || item.subKantor}</strong>
                        </span>
                        <span style={{ color: '#059669', fontWeight: 800, fontSize: '1.05rem' }}>
                          Rp {item.nominal.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 12 }}>
                      <div>
                        Penerbit Signer: <strong>{item.signerNama}</strong> ({item.signerRole})
                      </div>
                      <div>
                        No. Pengajuan: <strong>{item.nomorPengajuan}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                    <button
                      type="button"
                      onClick={() => openTellerModal(item)}
                      className="button"
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        fontSize: '0.9rem',
                        background: '#10b981',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <CheckCircle2 size={16} />
                      Sudah Input RAB di CBS
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: AUDIT TRAIL & MONITORING                                           */}
      {/* ========================================================================= */}
      {activeTab === 'tab5_audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Filter Bar & Export */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                  Monitoring &amp; Audit Trail Seluruh Kantor
                </h3>
                <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                  Transparansi penuh lintas 14 kantor kas: lacak jam input MO, checker verifikator, signer penerbit, dan validasi teller CBS.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportExcel}
                className="button"
                style={{
                  background: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 18px',
                  fontSize: '0.88rem',
                }}
              >
                <FileSpreadsheet size={16} />
                Ekspor Excel (.xlsx)
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Pencarian Nasabah / Rek / No. RAB:
                </label>
                <input
                  type="text"
                  className="inputField"
                  placeholder="Ketik pencarian..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Filter Status:
                </label>
                <select
                  className="inputField"
                  value={auditStatusFilter}
                  onChange={(e) => setAuditStatusFilter(e.target.value)}
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PENDING_VERIFIKASI">Pending Verifikasi</option>
                  <option value="DISETUJUI_RAB">Disetujui (Siap RAB)</option>
                  <option value="MENUNGGU_INPUT_TELLER">Menunggu Input Teller</option>
                  <option value="SUDAH_INPUT">Sudah Input ✅</option>
                  <option value="DITOLAK">Ditolak ❌</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Filter Kantor Kas (14 Kas):
                </label>
                <select
                  className="inputField"
                  value={auditKantorFilter}
                  onChange={(e) => setAuditKantorFilter(e.target.value)}
                >
                  <option value="ALL">Semua Kantor (14 Kas)</option>
                  {KANTOR_KAS_LIST.map((k) => (
                    <option key={k.code} value={k.code}>
                      {k.code} - {k.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Audit Trail Table */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Menampilkan <strong>{filteredAuditItems.length}</strong> riwayat pengajuan
              </span>
            </div>

            {filteredAuditItems.length === 0 ? (
              <EmptyState
                title="Tidak Ada Data Riwayat"
                description="Tidak ada pengajuan RAB yang cocok dengan kriteria filter saat ini."
              />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                      <th style={{ padding: '12px 10px' }}>No. Pengajuan &amp; RAB</th>
                      <th style={{ padding: '12px 10px' }}>Nasabah &amp; Rekening</th>
                      <th style={{ padding: '12px 10px' }}>Kantor Kas</th>
                      <th style={{ padding: '12px 10px', textAlign: 'right' }}>Nominal</th>
                      <th style={{ padding: '12px 10px' }}>Status</th>
                      <th style={{ padding: '12px 10px' }}>1. Pemohon (MO)</th>
                      <th style={{ padding: '12px 10px' }}>2. Checker</th>
                      <th style={{ padding: '12px 10px' }}>3. Signer</th>
                      <th style={{ padding: '12px 10px' }}>4. Teller CBS</th>
                      <th style={{ padding: '12px 10px', textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuditItems.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 10px', fontWeight: 600 }}>
                          <div style={{ color: '#0f172a' }}>{item.nomorPengajuan}</div>
                          {item.nomorRab ? (
                            <div style={{ color: '#be185d', fontWeight: 700 }}>{item.nomorRab}</div>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Belum terbit</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 10px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.namaNasabah}</div>
                          <div style={{ color: '#2563eb' }}>{item.norek}</div>
                        </td>
                        <td style={{ padding: '10px 10px' }}>
                          <div>{SUB_KANTOR_NAMES[item.subKantor] || item.subKantor}</div>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.kantorGroup}</span>
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                          Rp {item.nominal.toLocaleString('id-ID')}
                        </td>
                        <td style={{ padding: '10px 10px' }}>
                          <span
                            style={{
                              ...getStatusBadgeStyle(item.status),
                              padding: '3px 8px',
                              borderRadius: 10,
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              display: 'inline-block',
                            }}
                          >
                            {formatStatusLabel(item.status)}
                          </span>
                        </td>
                        <td style={{ padding: '10px 10px', color: '#334155' }}>
                          <div style={{ fontWeight: 600 }}>{item.pemohonNama}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {new Date(item.waktuPengajuan).toLocaleString('id-ID')}
                          </div>
                        </td>
                        <td style={{ padding: '10px 10px', color: '#334155' }}>
                          {item.checkerNama ? (
                            <>
                              <div style={{ fontWeight: 600 }}>{item.checkerNama}</div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                {item.waktuChecker ? new Date(item.waktuChecker).toLocaleString('id-ID') : '-'}
                              </div>
                            </>
                          ) : (
                            <span style={{ color: '#cbd5e1' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 10px', color: '#334155' }}>
                          {item.signerNama ? (
                            <>
                              <div style={{ fontWeight: 600 }}>{item.signerNama}</div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                {item.waktuSigner ? new Date(item.waktuSigner).toLocaleString('id-ID') : '-'}
                              </div>
                            </>
                          ) : (
                            <span style={{ color: '#cbd5e1' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 10px', color: '#334155' }}>
                          {item.tellerNama ? (
                            <>
                              <div style={{ fontWeight: 600, color: '#059669' }}>{item.tellerNama}</div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                Validasi: <strong>{item.noValidasiCbs}</strong>
                              </div>
                            </>
                          ) : (
                            <span style={{ color: '#cbd5e1' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setDetailItem(item)}
                            className="button secondary"
                            style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CHECKER ACTION (Setujui / Tolak)                                    */}
      {/* ========================================================================= */}
      {checkerModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 16,
          }}
        >
          <div className="card" style={{ maxWidth: 540, width: '100%', padding: 24 }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: checkerModal.action === 'SETUJU' ? '#059669' : '#dc2626' }}>
              {checkerModal.action === 'SETUJU' ? 'Konfirmasi Persetujuan Pengajuan RAB' : 'Tolak Pengajuan RAB'}
            </h3>
            <p style={{ margin: '6px 0 16px 0', fontSize: '0.85rem', color: '#64748b' }}>
              No. Pengajuan: <strong>{checkerModal.item.nomorPengajuan}</strong> | Nasabah: <strong>{checkerModal.item.namaNasabah}</strong> ({checkerModal.item.norek})
            </p>

            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#64748b' }}>Nominal:</span>
                <strong style={{ color: '#059669' }}>Rp {checkerModal.item.nominal.toLocaleString('id-ID')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Kantor Kas:</span>
                <strong>{SUB_KANTOR_NAMES[checkerModal.item.subKantor] || checkerModal.item.subKantor}</strong>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                {checkerModal.action === 'SETUJU' ? 'Catatan Pemeriksaan (Opsional):' : 'Alasan Penolakan (Wajib):'}
              </label>
              <textarea
                rows={3}
                className="inputField"
                placeholder={checkerModal.action === 'SETUJU' ? 'Catatan verifikasi...' : 'Jelaskan alasan penolakan...'}
                value={checkerModal.catatan}
                onChange={(e) => setCheckerModal({ ...checkerModal, catatan: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setCheckerModal(null)}
                className="button secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCheckerSubmit}
                className={`button ${checkerModal.action === 'TOLAK' ? 'danger' : ''}`}
                style={{ padding: '8px 20px', fontSize: '0.85rem' }}
              >
                {checkerModal.action === 'SETUJU' ? 'Setujui Pengajuan' : 'Konfirmasi Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SIGNER RAB (Terbitkan Nomor RAB)                                   */}
      {/* ========================================================================= */}
      {signerModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 16,
          }}
        >
          <div className="card" style={{ maxWidth: 540, width: '100%', padding: 24 }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e40af' }}>
              Terbitkan Nomor RAB Resmi
            </h3>
            <p style={{ margin: '6px 0 16px 0', fontSize: '0.85rem', color: '#64748b' }}>
              Pengajuan: <strong>{signerModal.item.nomorPengajuan}</strong> | Wilayah: <strong>{signerModal.item.kantorGroup}</strong>
            </p>

            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>
              <div>Nasabah: <strong>{signerModal.item.namaNasabah}</strong> ({signerModal.item.norek})</div>
              <div style={{ marginTop: 4 }}>Nominal: <strong style={{ color: '#059669' }}>Rp {signerModal.item.nominal.toLocaleString('id-ID')}</strong></div>
              <div style={{ marginTop: 4 }}>Kantor Kas: <strong>{SUB_KANTOR_NAMES[signerModal.item.subKantor] || signerModal.item.subKantor}</strong></div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Nomor RAB (Awalan Otomatis: {signerModal.item.kantorGroup === 'CABANG' ? 'RAB-CPD-' : 'RAB-PST-'}) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="inputField"
                style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e40af' }}
                value={signerModal.nomorRab}
                onChange={(e) => setSignerModal({ ...signerModal, nomorRab: e.target.value })}
                placeholder="RAB-PST-YYYYMMDD-XXXX atau RAB-CPD-YYYYMMDD-XXXX"
              />
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                Sistem otomatis memberi awalan sesuai ketentuan wilayah. Anda dapat menyesuaikan nomor urut jika diperlukan.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setSignerModal(null)}
                className="button secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSignerSubmit}
                className="button"
                style={{ padding: '8px 22px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <FileSignature size={16} />
                Terbitkan RAB
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TELLER EXECUTION                                                   */}
      {/* ========================================================================= */}
      {tellerModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 16,
          }}
        >
          <div className="card" style={{ maxWidth: 540, width: '100%', padding: 24 }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#059669' }}>
              Konfirmasi Selesai Input CBS (Teller)
            </h3>
            <p style={{ margin: '6px 0 16px 0', fontSize: '0.85rem', color: '#64748b' }}>
              RAB: <strong style={{ color: '#be185d' }}>{tellerModal.item.nomorRab}</strong> | Nasabah: <strong>{tellerModal.item.namaNasabah}</strong>
            </p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Nama Teller:
              </label>
              <input
                type="text"
                className="inputField"
                value={tellerModal.tellerNama}
                onChange={(e) => setTellerModal({ ...tellerModal, tellerNama: e.target.value })}
                placeholder="Nama Teller..."
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Nomor Validasi Kas CBS <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="inputField"
                style={{ fontWeight: 700 }}
                placeholder="Contoh: VL-2026-00123 / No. Slip Kas"
                value={tellerModal.noValidasiCbs}
                onChange={(e) => setTellerModal({ ...tellerModal, noValidasiCbs: e.target.value })}
                required
              />
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 4 }}>
                Masukkan nomor validasi cetak kas / nomor referensi jurnal dari Core Banking System.
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Catatan Teller (Opsional):
              </label>
              <input
                type="text"
                className="inputField"
                placeholder="Catatan tambahan (opsional)..."
                value={tellerModal.catatanTeller}
                onChange={(e) => setTellerModal({ ...tellerModal, catatanTeller: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setTellerModal(null)}
                className="button secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleTellerSubmit}
                className="button"
                style={{ background: '#10b981', padding: '8px 22px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <CheckCircle2 size={16} />
                Sudah Input RAB ✅
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DETAIL AUDIT TIMELINE                                              */}
      {/* ========================================================================= */}
      {detailItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 16,
          }}
        >
          <div className="card" style={{ maxWidth: 650, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                  Jejak Audit &amp; Detail RAB
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>
                  No. Pengajuan: <strong>{detailItem.nomorPengajuan}</strong>
                  {detailItem.nomorRab && (
                    <> | No. RAB: <strong style={{ color: '#be185d' }}>{detailItem.nomorRab}</strong></>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="button secondary"
                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
              >
                Tutup
              </button>
            </div>

            {/* Debtor Details Card */}
            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{detailItem.namaNasabah}</div>
              <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: '0.85rem', color: '#475569', flexWrap: 'wrap' }}>
                <span>Rekening: <strong style={{ color: '#2563eb' }}>{detailItem.norek}</strong></span>
                <span>Kantor: <strong>{SUB_KANTOR_NAMES[detailItem.subKantor] || detailItem.subKantor}</strong></span>
                <span>Nominal: <strong style={{ color: '#059669' }}>Rp {detailItem.nominal.toLocaleString('id-ID')}</strong></span>
              </div>
              {detailItem.keterangan && (
                <div style={{ marginTop: 8, fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic' }}>
                  Keperluan: &ldquo;{detailItem.keterangan}&rdquo;
                </div>
              )}
            </div>

            {/* Chronological Stepper Timeline */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#334155' }}>Kronologi Alur:</h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderLeft: '2px solid #e2e8f0', paddingLeft: 16, marginLeft: 8 }}>
                {/* Step 1: Input MO */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -23, top: 2, width: 12, height: 12, borderRadius: '50%', background: '#2563eb' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e40af' }}>1. Input Pengajuan (MO)</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    Oleh: <strong>{detailItem.pemohonNama}</strong> ({detailItem.pemohonRole})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(detailItem.waktuPengajuan).toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Step 2: Checker */}
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: -23,
                      top: 2,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: detailItem.checkerNama ? '#f59e0b' : '#cbd5e1',
                    }}
                  />
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: detailItem.checkerNama ? '#b45309' : '#94a3b8' }}>
                    2. Verifikasi Checker (Kasubag / Kepala Kas)
                  </div>
                  {detailItem.checkerNama ? (
                    <>
                      <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                        Pemeriksa: <strong>{detailItem.checkerNama}</strong> ({detailItem.checkerRole})
                      </div>
                      {detailItem.checkerCatatan && (
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Catatan: {detailItem.checkerCatatan}</div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {detailItem.waktuChecker ? new Date(detailItem.waktuChecker).toLocaleString('id-ID') : '-'}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Menunggu pemeriksaan checker</div>
                  )}
                </div>

                {/* Step 3: Signer */}
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: -23,
                      top: 2,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: detailItem.signerNama ? '#6366f1' : '#cbd5e1',
                    }}
                  />
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: detailItem.signerNama ? '#4338ca' : '#94a3b8' }}>
                    3. Penerbitan Nomor RAB (Signer)
                  </div>
                  {detailItem.signerNama ? (
                    <>
                      <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                        Penerbit: <strong>{detailItem.signerNama}</strong> ({detailItem.signerRole})
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#be185d', fontWeight: 700 }}>
                        No. RAB: {detailItem.nomorRab}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {detailItem.waktuSigner ? new Date(detailItem.waktuSigner).toLocaleString('id-ID') : '-'}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Menunggu penerbitan nomor RAB</div>
                  )}
                </div>

                {/* Step 4: Teller */}
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: -23,
                      top: 2,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: detailItem.tellerNama ? '#10b981' : '#cbd5e1',
                    }}
                  />
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: detailItem.tellerNama ? '#15803d' : '#94a3b8' }}>
                    4. Eksekusi Core Banking System (Teller)
                  </div>
                  {detailItem.tellerNama ? (
                    <>
                      <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                        Teller: <strong>{detailItem.tellerNama}</strong>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#15803d', fontWeight: 700 }}>
                        No. Validasi Kas CBS: {detailItem.noValidasiCbs}
                      </div>
                      {detailItem.catatanTeller && (
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Catatan: {detailItem.catatanTeller}</div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {detailItem.waktuTeller ? new Date(detailItem.waktuTeller).toLocaleString('id-ID') : '-'}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Menunggu input ke CBS</div>
                  )}
                </div>
              </div>
            </div>

            {/* Foto Resi Preview */}
            {detailItem.fotoResiUrl && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#334155' }}>Foto Bukti Resi:</h4>
                <img
                  src={detailItem.fotoResiUrl}
                  alt="Bukti Resi"
                  style={{
                    maxHeight: 240,
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    setZoomImage({
                      url: detailItem.fotoResiUrl!,
                      title: `Bukti Resi: ${detailItem.nomorPengajuan}`,
                      subtitle: `${detailItem.namaNasabah} (${detailItem.norek})`,
                    })
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: IMAGE ZOOM                                                         */}
      {/* ========================================================================= */}
      {zoomImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: 20,
          }}
          onClick={() => setZoomImage(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ color: 'white', marginBottom: 12, textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{zoomImage.title}</div>
              {zoomImage.subtitle && <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{zoomImage.subtitle}</div>}
            </div>

            <img
              src={zoomImage.url}
              alt="Zoomed Resi"
              style={{
                maxWidth: '85vw',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: 8,
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              }}
            />

            <button
              type="button"
              onClick={() => setZoomImage(null)}
              className="button secondary"
              style={{ marginTop: 14, padding: '8px 24px' }}
            >
              Tutup Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
