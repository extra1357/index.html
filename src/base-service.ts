export const dynamic = 'force-dynamic';

import { PrismaClient } from '@prisma/client'

// Previne a criação de múltiplas instâncias do Prisma em Desenvolvimento
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['error', 'warn'], 
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export class BaseService {
  protected db: PrismaClient

  constructor() {
    // Agora todos os serviços usam a MESMA conexão
    this.db = prisma
  }
}
