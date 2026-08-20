'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteNominatifButton({ id, namaFile }: { id: number, namaFile: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data nominatif "${namaFile}"? Semua data pinjaman terkait akan ikut terhapus.`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/nominatif/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        alert('Data berhasil dihapus');
        router.refresh();
      } else {
        const data = await res.json();
        alert(`Gagal: ${data.error}`);
      }
    } catch (e) {
      alert('Terjadi kesalahan koneksi');
    }
    setIsDeleting(false);
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isDeleting}
      className="button danger"
      style={{ padding: '6px 12px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
    >
      {isDeleting ? 'Menghapus...' : 'Hapus'}
    </button>
  );
}
