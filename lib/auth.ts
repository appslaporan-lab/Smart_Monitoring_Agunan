import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const PASSWORD_EXPIRY_DAYS = 90;

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const verifyPassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export const findUserByUsername = async (username: string) => {
  return prisma.user.findUnique({ where: { username } });
};

export const createUser = async (data: { nama: string; username: string; passwordHash: string; passwordChangedAt?: Date; role: UserRole; }) => {
  return prisma.user.create({ data });
};

export const updateUserPassword = async (userId: number, passwordHash: string, passwordChangedAt: Date = new Date()) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      passwordChangedAt,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });
};

export const isPasswordExpired = (passwordChangedAt: Date | null | undefined) => {
  if (!passwordChangedAt) return true;
  const expiryTime = passwordChangedAt.getTime() + PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() > expiryTime;
};