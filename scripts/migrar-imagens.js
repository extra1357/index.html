const { PrismaClient } = require('@prisma/client');
const { put } = require('@vercel/blob');

const prisma = new PrismaClient();

async function migrarImagens() {
  console.log('Buscando imoveis com imagens base64...');

  const imoveis = await prisma.imovel.findMany({
    select: { id: true, imagens: true, slug: true }
  });

  let total = 0;
  let migrados = 0;

  for (const imovel of imoveis) {
    const imagens = imovel.imagens;
    if (!imagens || imagens.length === 0) continue;

    const temBase64 = imagens.some((img) => img.startsWith('data:'));
    if (!temBase64) continue;

    total++;
    console.log(`Migrando: ${imovel.slug} (${imagens.length} foto(s))`);

    const novasUrls = [];

    for (let i = 0; i < imagens.length; i++) {
      const img = imagens[i];

      if (!img.startsWith('data:')) {
        novasUrls.push(img);
        continue;
      }

      try {
        const matches = img.match(/^data:(.+);base64,(.+)$/);
        if (!matches) continue;

        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const ext = mimeType.split('/')[1] || 'jpg';
        const filename = `imoveis/${imovel.id}-${i}.${ext}`;

        const blob = await put(filename, buffer, {
          access: 'public',
          contentType: mimeType,
        });

        novasUrls.push(blob.url);
        console.log(`  Foto ${i + 1} migrada: ${blob.url}`);
      } catch (err) {
        console.error(`  Erro na foto ${i + 1}:`, err);
        novasUrls.push(img);
      }
    }

    await prisma.imovel.update({
      where: { id: imovel.id },
      data: { imagens: novasUrls }
    });

    migrados++;
    console.log(`  Imovel atualizado! (${migrados}/${total})`);
  }

  console.log(`\nMigracao concluida! ${migrados} imoveis migrados.`);
  await prisma.$disconnect();
}

migrarImagens().catch(console.error);
