import { NextResponse } from 'next/server';
import { hashPassword, createUser, findUserByUsername } from '@/lib/auth';

export async function POST(request: Request) {
  const form = await request.formData();
  const nama = form.get('nama');
  const username = form.get('username');
  const password = form.get('password');
  const role = form.get('role');

  if (!nama || !username || !password || !role) {
    return NextResponse.redirect(new URL('/auth/register?error=Data+tidak+lengkap', request.url));
  }

  const passwordStr = password.toString();
  const isPasswordValid = passwordStr.length >= 8 && /[A-Za-z]/.test(passwordStr) && /\d/.test(passwordStr);
  if (!isPasswordValid) {
    return NextResponse.redirect(new URL('/auth/register?error=Password+minimal+8+karakter+dan+harus+ada+huruf+%26+angka', request.url));
  }

  const existingUser = await findUserByUsername(username.toString());
  if (existingUser) {
    return NextResponse.redirect(new URL('/auth/register?error=Username+telah+digunakan', request.url));
  }

  const passwordHash = await hashPassword(passwordStr);
  await createUser({ nama: nama.toString(), username: username.toString(), passwordHash, role: role.toString() as any });

  return NextResponse.redirect(new URL('/auth/login?success=Registrasi+berhasil.+Akun+Anda+menunggu+persetujuan+Superadmin+sebelum+bisa+login.', request.url));
}