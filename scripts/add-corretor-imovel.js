require('dotenv').config({path:'.env.local'});
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe('ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS "corretorId" TEXT REFERENCES corretores(id)');
  console.log('Coluna adicionada!');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "imoveis_corretorId_idx" ON imoveis("corretorId")');
  console.log('Index criado!');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
