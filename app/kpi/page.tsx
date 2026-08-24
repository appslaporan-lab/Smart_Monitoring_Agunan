import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function KpiPage() {
  const user = getCurrentUser();
  if (!user) redirect('/auth/login');

  // Cek apakah user adalah teller / cabang yang lebih relevan ke transaksi harian
  if (user.role === 'TELLER') {
    redirect('/kpi/teller/transaksi-harian');
  }
  
  if (user.role === 'MARKETING' || user.role === 'AO') {
    redirect('/kpi/mo-realisasi');
  }

  // Fallback untuk semua user yang punya akses KPI
  redirect('/kpi/performa-karyawan');
}