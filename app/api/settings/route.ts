import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function GET() {
  try {
    const settings = await prisma.appSetting.findMany();
    const result: Record<string, any> = {};
    for (const s of settings) {
      try {
        result[s.key] = JSON.parse(s.value);
      } catch (e) {
        result[s.key] = s.value;
      }
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Save each key in the data object
    for (const [key, val] of Object.entries(data)) {
      await prisma.appSetting.upsert({
        where: { key },
        update: { value: JSON.stringify(val) },
        create: { key, value: JSON.stringify(val) }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
