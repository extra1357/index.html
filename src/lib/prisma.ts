import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const isDev = process.env.NODE_ENV === 'development';

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isDev
      ? ['query', 'info', 'warn', 'error']
      : ['warn', 'error'],
    errorFormat: 'pretty',
  });

if (isDev) globalForPrisma.prisma = prisma;

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
