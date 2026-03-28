export const dynamic = 'force-dynamic';

import { prisma } from './prisma'

// Buscar todos os imóveis disponíveis
export async function buscarImoveis() {
  const imoveis = await prisma.imovel.findMany({
    where: {
      disponivel: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return imoveis.map((i: any) => ({
    id: i.id,
    type: i.tipo,
    title: `${i.tipo} em ${i.cidade}`,
    addr: `${i.endereco} - ${i.bairro ?? ''}, ${i.cidade}/${i.estado}`,
    price: Number(i.preco),
    imagens: i.imagens || [],
    description: i.descricao,
    quartos: i.quartos,
    banheiros: i.banheiros,
    garagem: i.vagas,
    metragem: Number(i.metragem),
    finalidade: i.finalidade,
    destaque: i.destaque,
  }))
}

// Buscar imóvel por ID
export async function buscarImovelPorId(id: string) {
  const imovel = await prisma.imovel.findUnique({
    where: { id },
  })

  if (!imovel) {
    return null
  }

  return {
    id: imovel.id,
    type: imovel.tipo,
    title: `${imovel.tipo} em ${imovel.cidade}`,
    addr: `${imovel.endereco} - ${imovel.bairro ?? ''}, ${imovel.cidade}/${imovel.estado}`,
    price: Number(imovel.preco),
    imagens: imovel.imagens || [],
    description: imovel.descricao,
    quartos: imovel.quartos,
    banheiros: imovel.banheiros,
    garagem: imovel.vagas,
    metragem: Number(imovel.metragem),
    finalidade: imovel.finalidade,
    destaque: imovel.destaque,
  }
}
