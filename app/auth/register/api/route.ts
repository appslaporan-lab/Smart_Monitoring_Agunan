import { NextResponse } from 'next/server';
import { hashPassword, createUser, findUserByEmail } from '@/lib/auth';

export async function POST(request: Request) {
  const form = await request.formData();
  const nama = form.get('nama');
  const email = form.get('email');
  const password = form.get('password');
  const role = form.get('role');

  if (!nama || !email || !password || !role) {
    return NextResponse.redirect(new URL('/auth/register?error=Data+tidak+lengkap', request.url));
  }

  const existingUser = await findUserByEmail(email.toString());
  if (existingUser) {
    return NextResponse.redirect(new URL('/auth/register?error=Email+telah+digunakan', request.url));
  }

  const passwordHash = await hashPassword(password.toString());
  await createUser({ nama: nama.toString(), email: email.toString(), passwordHash, role: role.toString() as any });
  return NextResponse.redirect(new URL('/auth/login?success=registrasi+berhasil', request.url));
}
