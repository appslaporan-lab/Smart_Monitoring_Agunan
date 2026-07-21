import { prisma } from '@/lib/prisma';

export type AuditEntry = {
  id: string;
  agunanId: number | null;
  agunanKodeRegister: string | null;
  action: string;
  actor: string;
  details: string;
  createdAt: string;
};

export const readAuditLog = async (): Promise<AuditEntry[]> => {
  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1000,
  });
  return rows.map((row) => ({
    id: String(row.id),
    agunanId: row.agunanId,
    agunanKodeRegister: row.agunanKodeRegister,
    action: row.action,
    actor: row.actor,
    details: row.details ?? '',
    createdAt: row.createdAt.toISOString(),
  }));
};

export const appendAuditLog = async (entry: {
  agunanId?: number;
  agunanKodeRegister?: string;
  action: string;
  actor: string;
  details?: string;
}) => {
  const created = await prisma.auditLog.create({
    data: {
      agunanId: entry.agunanId,
      agunanKodeRegister: entry.agunanKodeRegister,
      action: entry.action,
      actor: entry.actor,
      details: entry.details ?? '',
    },
  });
  return {
    id: String(created.id),
    agunanId: created.agunanId,
    agunanKodeRegister: created.agunanKodeRegister,
    action: created.action,
    actor: created.actor,
    details: created.details ?? '',
    createdAt: created.createdAt.toISOString(),
  };
};