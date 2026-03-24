import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// We use a Proxy to lazily instantiate the Prisma Client.
// Next.js statically evaluates all files during `npm run build`.
// If `new PrismaClient()` is called at the top level without a DB URL, it crashes Prisma V7.
// The Proxy ensures it is only instantiated when a database query is actually executed.
export const prisma = globalForPrisma.prisma || new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient();
    }
    return (globalForPrisma.prisma as any)[prop];
  }
});
