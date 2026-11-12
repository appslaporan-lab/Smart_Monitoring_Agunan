import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import RabClientPage from './RabClientPage';

export const dynamic = 'force-dynamic';

export default async function RabPage() {
  const user = getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  // Pre-fetch counts for badge indicators
  const [countPendingChecker, countDisetujuiSigner, countMenungguTeller, countSudahInput, countTotal] = await Promise.all([
    prisma.pengajuanRab.count({ where: { status: 'PENDING_VERIFIKASI' } }),
    prisma.pengajuanRab.count({ where: { status: 'DISETUJUI_RAB' } }),
    prisma.pengajuanRab.count({ where: { status: 'MENUNGGU_INPUT_TELLER' } }),
    prisma.pengajuanRab.count({ where: { status: 'SUDAH_INPUT' } }),
    prisma.pengajuanRab.count(),
  ]);

  // Pre-fetch initial items
  const initialItems = await prisma.pengajuanRab.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <RabClientPage
      user={user}
      initialCounts={{
        pendingChecker: countPendingChecker,
        disetujuiSigner: countDisetujuiSigner,
        menungguTeller: countMenungguTeller,
        sudahInput: countSudahInput,
        total: countTotal,
      }}
      initialItems={JSON.parse(JSON.stringify(initialItems))}
    />
  );
}
