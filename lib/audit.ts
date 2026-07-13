import { promises as fs } from 'fs';
import path from 'path';

export type AuditEntry = {
  id: string;
  agunanId: number;
  agunanKodeRegister: string;
  action: string;
  actor: string;
  details: string;
  createdAt: string;
};

const auditLogPath = path.join(process.cwd(), 'data', 'audit-log.json');

const ensureLogFile = async () => {
  await fs.mkdir(path.dirname(auditLogPath), { recursive: true });

  try {
    await fs.access(auditLogPath);
  } catch {
    await fs.writeFile(auditLogPath, '[]', 'utf-8');
  }
};

export const readAuditLog = async (): Promise<AuditEntry[]> => {
  await ensureLogFile();
  const content = await fs.readFile(auditLogPath, 'utf-8');
  return JSON.parse(content) as AuditEntry[];
};

export const appendAuditLog = async (entry: Omit<AuditEntry, 'id' | 'createdAt'>) => {
  await ensureLogFile();
  const entries = await readAuditLog();
  const newEntry: AuditEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };

  const updatedEntries = [newEntry, ...entries].slice(0, 5000);
  await fs.writeFile(auditLogPath, JSON.stringify(updatedEntries, null, 2), 'utf-8');
  return newEntry;
};
