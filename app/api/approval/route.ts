import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { appendAuditLog } from '@/lib/audit';
import { getCurrentUser } from '@/lib/session';
import type { AgunanStatus } from '@prisma/client';

const ACTION_ROLE_MAP: Record<string, string[]> = {
  tandai_proses_keluar: ['ADM_KREDIT_PUSAT', 'ADM_KREDIT_CABANG', 'KEPALA_KAS'],
  tandai_diserahkan: ['ADM_KREDIT_PUSAT', 'ADM_KREDIT_CABANG', 'KABAG_OPERASIONAL', 'PIMPINAN_CABANG', 'DIREKTUR'],
  tandai_kembali_brankas: ['ADM_KREDIT_PUSAT', 'ADM_KREDIT_CABANG', 'KABAG_OPERASIONAL', 'PIMPINAN_CABANG', 'DIREKTUR'],
};

const STATUS_MAP: Record<string, AgunanStatus> = {
  tandai_proses_keluar: 'PROSES_KELUAR',
  tandai_diserahkan: 'DISERAHKAN',
  tandai_kembali_brankas: 'DI_BRANKAS',
};

export async function POST(request: Request) {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Anda harus login untuk melakukan aksi ini.' }, { status: 401 });
  }

  const contentType = request.headers.get('content-type') || '';
  let agunanId: string | null = null;
  let action: string | null = null;
  let note: string | null = null;

  if (contentType.includes('application/json')) {
    const body = await request.json();
    agunanId = body.agunanId;
    action = body.action;
    note = body.note;
  } else {
    const formData = await request.formData();
    agunanId = formData.get('agunanId')?.toString() ?? null;
    action = formData.get('action')?.toString() ?? null;
    note = formData.get('note')?.toString() ?? null;
  }

  if (!agunanId || !action) {
    return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
  }

  const allowedRoles = ACTION_ROLE_MAP[action];
  if (!allowedRoles) {
    return NextResponse.json({ error: 'Aksi tidak dikenali.' }, { status: 400 });
  }
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Anda tidak memiliki wewenang untuk melakukan aksi ini.' }, { status: 403 });
  }

  try {
    const agunan = await prisma.agunan.findUnique({ where: { id: Number(agunanId) } });
    if (!agunan) {
      return NextResponse.json({ error: 'Agunan tidak ditemukan.' }, { status: 404 });
    }

    const nextStatus = STATUS_MAP[action] ?? agunan.status;
    const updated = await prisma.agunan.update({
      where: { id: Number(agunanId) },
      data: {
        status: nextStatus,
        warningPesan: note ? `${agunan.warningPesan ?? ''}\n${note}`.trim() : agunan.warningPesan,
      },
    });

    await appendAuditLog({
      agunanId: updated.id,
      agunanKodeRegister: agunan.kodeRegister,
      action,
      actor: `${user.nama} (${user.role})`,
      details: note ?? 'Tidak ada catatan',
    });

    return NextResponse.redirect(new URL(`/agunan/${agunan.id}`, request.url));
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal memproses approval.' }, { status: 500 });
  }
}