import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const verifyPassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export const findUserByUsername = async (username: string) => {
  return prisma.user.findUnique({ where: { username } });
};

export const createUser = async (data: { nama: string; username: string; passwordHash: string; role: UserRole; }) => {
  return prisma.user.create({ data });
};