import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['warn', 'error'] : ['warn', 'error'],
});

// Small helpers for SQLite's lack of native JSON arrays.
export const toJson = (v: unknown) => (v == null ? null : JSON.stringify(v));
export const fromJson = <T = unknown>(v: string | null | undefined): T | null => {
  if (v == null) return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
};
