import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imobiliariaperto.com.br'

  try {
    const imoveis = await prisma.imovel.findMany({
      where: { status: 'ATIVO' },
      select: {
        id: true,
        slug: true,
        updatedAt: true,
        tipo: true,
        bairro: true,
        cidade: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

    const staticRoutes: MetadataRoute.Sitemap = [
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
      { url: `${baseUrl}/imoveis`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
      { url: `${baseUrl}/sobre`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
      { url: `${baseUrl}/contato`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
      { url: `${baseUrl}/proprietarios`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    ]

    const categorias = ['apartamento', 'casa', 'terreno', 'comercial']
    const categoriasRoutes: MetadataRoute.Sitemap = categorias.map(categoria => ({
      url: `${baseUrl}/imoveis?tipo=${categoria}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.85,
    }))

    const bairrosUnicos = [...new Set(imoveis.map(i => i.bairro).filter(Boolean))]
    const bairrosRoutes: MetadataRoute.Sitemap = bairrosUnicos.slice(0, 20).map(bairro => ({
      url: `${baseUrl}/imoveis?bairro=${encodeURIComponent(bairro!)}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))

    const imovelRoutes: MetadataRoute.Sitemap = imoveis.map((imovel) => ({
      url: `${baseUrl}/imoveis/${imovel.slug || imovel.id}`,
      lastModified: imovel.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }))

    return [...staticRoutes, ...categoriasRoutes, ...bairrosRoutes, ...imovelRoutes]

  } catch (error) {
    console.error('Erro ao gerar sitemap:', error)
    return [
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
      { url: `${baseUrl}/imoveis`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    ]
  } finally {
    await prisma.$disconnect()
  }
}
