import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { appendAuditLog } from '@/lib/audit';
import type { AgunanStatus } from '@prisma/client';

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  let agunanId: string | null = null;
  let action: string | null = null;
  let actor: string | null = null;
  let note: string | null = null;

  if (contentType.includes('application/json')) {
    const body = await request.json();
    agunanId = body.agunanId;
    action = body.action;
    actor = body.actor;
    note = body.note;
  } else {
    const formData = await request.formData();
    agunanId = formData.get('agunanId')?.toString() ?? null;
    action = formData.get('action')?.toString() ?? null;
    actor = formData.get('actor')?.toString() ?? null;
    note = formData.get('note')?.toString() ?? null;
  }

  if (!agunanId || !action || !actor) {
    return NextResponse.json({ error: 'Data approval tidak lengkap.' }, { status: 400 });
  }

  try {
    const agunan = await prisma.agunan.findUnique({ where: { id: Number(agunanId) } });
    if (!agunan) {
      return NextResponse.json({ error: 'Agunan tidak ditemukan.' }, { status: 404 });
    }

    const nextStatusMap: Record<string, AgunanStatus> = {
      approve_operasional: 'DISETUJUI_OPERASIONAL',
      approve_pimpinan: 'DISETUJUI_PIMPINAN',
      approve_final: 'DISETUJUI',
      reject: 'PENDING',
      release: 'DIKELUARKAN',
      handover: 'DISERAHKAN',
    };

    const nextStatus = nextStatusMap[action] ?? agunan.status;
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
      actor,
      details: note ?? 'Tidak ada catatan',
    });

    return NextResponse.redirect(new URL(`/agunan/${agunan.id}`, request.url));
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal memproses approval.' }, { status: 500 });
  }
}
