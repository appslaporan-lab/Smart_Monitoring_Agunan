import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { parseTellerExcel } from '@/lib/kpiTellerParser';

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Process the excel file
    const result = parseTellerExcel(buffer);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Teller parser error:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan saat memproses file.' }, { status: 500 });
  }
}
