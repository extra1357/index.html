import { PrismaClient } from '@prisma/client';
import { generateSlug, generateCodigo } from '../src/lib/generateSlug';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Gerando slugs para imóveis existentes...\n');
  
  const imoveis = await prisma.imovel.findMany({
    where: {
      slug: null
    }
  });

  console.log(`📊 Total de imóveis sem slug: ${imoveis.length}\n`);

  let count = 0;
  for (const imovel of imoveis) {
    try {
      // Gerar código se não tiver
      const codigo = imovel.codigo || generateCodigo(imovel.tipo);
      
      // Gerar slug
      const slug = generateSlug({
        tipo: imovel.tipo,
        cidade: imovel.cidade,
        bairro: imovel.bairro,
        quartos: imovel.quartos,
        codigo
      });

      // Atualizar
      await prisma.imovel.update({
        where: { id: imovel.id },
        data: { 
          slug,
          codigo
        }
      });

      count++;
      console.log(`✅ [${count}/${imoveis.length}] ${imovel.tipo} - ${imovel.cidade}`);
      console.log(`   URL: /imoveis/${slug}\n`);
    } catch (error) {
      console.error(`❌ Erro no imóvel ${imovel.id}:`, error);
    }
  }

  console.log(`\n🎉 Concluído! ${count} slugs gerados.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
