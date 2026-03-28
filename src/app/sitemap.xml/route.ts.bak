import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * 🗺️ SITEMAP XML DINÂMICO - STR GENETICS
 * Atualiza automaticamente quando novos imóveis são cadastrados
 * Compatível com Next.js App Router
 * Geração server-side com cache controlado
 */

export async function GET() {
  try {
    /**
     * 🌐 URL base do projeto
     * Deve estar definida no .env como:
     * NEXT_PUBLIC_BASE_URL=https://seudominio.com.br
     */
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || 'https://seudominio.com.br'

    /**
     * 🏠 Buscar todos os imóveis ativos no banco
     * Ajuste os filtros conforme o seu schema Prisma
     */
    const imoveis = await prisma.imovel.findMany({
      where: {
        // Se existir campo de status, descomente e ajuste:
        // status: 'ativo',
      },
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    /**
     * 🧱 Construção manual do XML
     * Sitemap compatível com Google, Bing e outros motores
     */
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>

  <!-- Página Principal -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Página de Listagem de Imóveis -->
  <url>
    <loc>${baseUrl}/imoveis-publicos</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Páginas Individuais de Imóveis -->
  ${imoveis
    .map(
      (imovel) => `
  <url>
    <loc>${baseUrl}/imoveis/${imovel.id}</loc>
    <lastmod>${imovel.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('')}

</urlset>`

    /**
     * 📤 Retorno da resposta HTTP
     * application/xml é obrigatório para SEO
     * Cache configurado para CDN / Edge
     */
    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control':
          'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error: any) {
    /**
     * ❌ Log de erro para debug
     * Não expõe detalhes sensíveis ao client
     */
    console.error('[Sitemap] Erro ao gerar:', error)

    return new NextResponse('Error generating sitemap', {
      status: 500,
    })
  }
}

