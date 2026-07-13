import { NextResponse } from 'next/server';
import { readAuditLog } from '@/lib/audit';

export async function GET() {
  try {
    const logs = await readAuditLog();
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal membaca audit log.' }, { status: 500 });
  }
}
