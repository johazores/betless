type PrismaClientLike = any;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientLike };

function createPrismaClient() {
  // Keep this require lazy so type/build checks can run even when Prisma engines
  // cannot be downloaded in restricted sandbox environments.
  // In a normal environment, `prisma generate` creates this client before runtime.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require('@prisma/client') as {
    PrismaClient: new (options?: { log?: string[] }) => PrismaClientLike;
  };

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

export const prisma: any = new Proxy({} as PrismaClientLike, {
  get(_target, property) {
    const client = getPrismaClient();
    const value = client[property];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
