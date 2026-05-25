import { PrismaClient } from '@prisma/client';
import { env } from './env';

/**
 * Singleton Prisma client instance.
 *
 * In development, we store the client on `globalThis` to prevent
 * hot-reload from creating multiple connections (a known issue with
 * tsx/nodemon watch mode). In production, a single instance suffices.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
