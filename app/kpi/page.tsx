import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { canAccessKantorData } from '@/lib/kantor';

export const dynamic = 'force-dynamic';

export default async function KpiPage({ searchParams }: { searchParams: { bulan?: string; tahun?: string } }) {
  const user = getCurrentUser();
  if (!user) redirect('/auth/login');

  const now = new Date();
  const bulan = searchParams.bulan ? parseInt(searchParams.bulan) : now.getMonth() + 1;
  const tahun = searchParams.tahun ? parseInt(searchParams.tahun) : now.getFullYear();

  const startDate = new Date(tahun, bulan - 1, 1);
  const endDate = new Date(tahun, bulan, 0, 23, 59, 59, 999);

  // 1. Fetch MO Realisasi
  const moRecordsAll = await prisma.realisasiHarianMO.findMany({
    where: { tanggal: { gte: startDate, lte: endDate } },
    include: { user: { select: { nama: true, subKantor: true } } }
  });

  // 2. Fetch Teller Performa
  const tellerRecordsAll = await prisma.performaKaryawan.findMany({
    where: { tanggal: { gte: startDate, lte: endDate } },
    include: { user: { select: { nama: true, subKantor: true } } }
  });

  const allTellers = await prisma.user.findMany({
    where: { role: 'TELLER' },
    select: { id: true, nama: true }
  });
  const tellerIds = allTellers.map(u => u.id);
  const tellerMap = new Map(allTellers.map(u => [u.id, u.nama]));

  const tellerDeskCallRecords = await prisma.kunjunganPenagihan.findMany({
    where: { 
      tanggalKunjungan: { gte: startDate, lte: endDate },
      jenisKontak: { in: ['TELEPON', 'WHATSAPP'] },
      petugasId: { in: tellerIds }
    }
  });

  // Filter based on roles
  const moRecords = (user.role === 'SUPERADMIN' || user.role === 'DIREKTUR' || user.role === 'DIREKSI') 
    ? moRecordsAll 
    : user.role.includes('MARKETING') || user.role === 'AO' 
      ? moRecordsAll.filter(r => r.userId === user.id)
      : moRecordsAll.filter(r => canAccessKantorData(user.role, user.kantor, user.subKantor, r.user.subKantor));

  const tellerRecords = (user.role === 'SUPERADMIN' || user.role === 'DIREKTUR' || user.role === 'DIREKSI')
    ? tellerRecordsAll
    : user.role === 'TELLER'
      ? tellerRecordsAll.filter(r => r.userId === user.id)
      : tellerRecordsAll.filter(r => canAccessKantorData(user.role, user.kantor, user.subKantor, r.user.subKantor));

  // --- Aggregate MO Data ---
  const moStats: Record<string, number> = {};
  for (const r of moRecords) {
    if (!moStats[r.user.nama]) moStats[r.user.nama] = 0;
    moStats[r.user.nama] += r.nominal;
  }
  const moChartData = Object.entries(moStats)
    .map(([nama, pencairan]) => ({ nama, pencairan }))
    .sort((a, b) => b.pencairan - a.pencairan)
    .slice(0, 10); // Top 10

  // --- Aggregate Teller Data (Line Chart) ---
  const tellerDaily: Record<string, Record<string, number>> = {};
  for (const r of tellerRecords) {
    if (r.kegiatan !== 'Transaksi Harian' && r.kegiatan !== 'Setoran' && r.kegiatan !== 'Penarikan') continue;
    const dateStr = r.tanggal.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    if (!tellerDaily[dateStr]) tellerDaily[dateStr] = {};
    if (!tellerDaily[dateStr][r.user.nama]) tellerDaily[dateStr][r.user.nama] = 0;
    tellerDaily[dateStr][r.user.nama] += r.jumlahKegiatan;
  }

  // Sort days
  const tellerLineData = Object.entries(tellerDaily).map(([tanggal, data]) => ({
    tanggal,
    ...data
  }));
  // Ideally sort by date, assuming the strings roughly follow chronological order if they are in the same month
  // But wait, "1 Sep", "2 Sep", "10 Sep" -> sorting alphabetically fails.
  // Better to use ISO string for sorting.
  
  const tellerDailyMap = new Map<string, any>();
  for (const r of tellerRecords) {
    if (r.kegiatan !== 'Transaksi Harian' && r.kegiatan !== 'Setoran' && r.kegiatan !== 'Penarikan') continue;
    const dateStr = r.tanggal.toISOString().split('T')[0];
    if (!tellerDailyMap.has(dateStr)) tellerDailyMap.set(dateStr, { _date: r.tanggal, tanggal: dateStr });
    const dayObj = tellerDailyMap.get(dateStr);
    dayObj[r.user.nama] = (dayObj[r.user.nama] || 0) + r.jumlahKegiatan;
  }
  
    // Add desk calls to teller daily map
    for (const dc of tellerDeskCallRecords) {
      const dateStr = dc.tanggalKunjungan.toISOString().split('T')[0];
      if (!tellerDailyMap.has(dateStr)) tellerDailyMap.set(dateStr, { _date: dc.tanggalKunjungan, tanggal: dateStr });
      const dayObj = tellerDailyMap.get(dateStr);
      const tellerName = tellerMap.get(dc.petugasId) || 'Unknown';
      dayObj[tellerName] = (dayObj[tellerName] || 0) + 1; // 1 desk call
    }

    const sortedTellerLineData = Array.from(tellerDailyMap.values())
    .sort((a, b) => a._date.getTime() - b._date.getTime())
    .map(d => {
      const { _date, ...rest } = d;
      rest.tanggal = _date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      return rest;
    });

  // --- Aggregate Teller Ranking (Bar Chart) ---
  const tellerActivityStats: Record<string, number> = {};
  for (const r of tellerRecords) {
    if (!tellerActivityStats[r.user.nama]) tellerActivityStats[r.user.nama] = 0;
    tellerActivityStats[r.user.nama] += r.jumlahKegiatan;
  }
  for (const dc of tellerDeskCallRecords) {
    const tellerName = tellerMap.get(dc.petugasId) || 'Unknown';
    if (!tellerActivityStats[tellerName]) tellerActivityStats[tellerName] = 0;
    tellerActivityStats[tellerName] += 1;
  }
  
  const tellerRankingData = Object.entries(tellerActivityStats)
    .map(([nama, total]) => ({ nama, total }))
    .sort((a, b) => b.total - a.total);

  // --- Aggregate Teller Error Ranking (Bar Chart) ---
  const tellerErrorStats: Record<string, number> = {};
  for (const r of tellerRecords) {
    if (r.kesalahan > 0) {
      if (!tellerErrorStats[r.user.nama]) tellerErrorStats[r.user.nama] = 0;
      tellerErrorStats[r.user.nama] += r.kesalahan;
    }
  }
  const tellerErrorRankingData = Object.entries(tellerErrorStats)
    .map(([nama, total]) => ({ nama, total }))
    .sort((a, b) => b.total - a.total);

  // --- Aggregate Teller Kesalahan (Pie Chart) ---
  const kesalahanStats: Record<string, number> = {};
  for (const r of tellerRecords) {
    if (r.kesalahan > 0) {
      if (!kesalahanStats[r.kegiatan]) kesalahanStats[r.kegiatan] = 0;
      kesalahanStats[r.kegiatan] += r.kesalahan;
    }
  }
  const tellerKesalahanData = Object.entries(kesalahanStats).map(([name, value]) => ({ name, value }));

  return (
    <DashboardClient 
        moChartData={moChartData} 
        tellerLineData={sortedTellerLineData} 
        tellerKesalahanData={tellerKesalahanData}
        tellerErrorRankingData={tellerErrorRankingData} 
        tellerRankingData={tellerRankingData}
        bulan={bulan} 
        tahun={tahun} 
      />
  );
}
