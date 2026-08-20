'use server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateAoMapping(id: number, mappedName: string, subKantor: string | null) {
  await prisma.masterAO.update({
    where: { id },
    data: { mappedName, subKantor }
  });
  revalidatePath('/admin/ao');
}
