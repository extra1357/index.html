import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imobiliariaperto.com.br'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/admin/*',
          '/api/',
          '/api/*',
          '/_next/static/css/*', // Arquivos internos do Next.js
          '/_next/static/chunks/*',
          '/proprietarios/dashboard', // Área privada de proprietários
          '/proprietarios/dashboard/*',
          '/sacola/', // Se tiver carrinho/sacola
          '/checkout/', // Se tiver processo de checkout
          '/*?*utm_*', // Evita indexar URLs com parâmetros UTM
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/admin/*',
          '/api/',
          '/api/*',
          '/proprietarios/dashboard',
          '/proprietarios/dashboard/*',
        ],
        crawlDelay: 0, // Google pode rastrear sem delay
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: [
          '/admin/',
          '/proprietarios/dashboard',
        ],
      },
      // Bingbot (importante para mercado brasileiro)
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/proprietarios/dashboard',
        ],
        crawlDelay: 1,
      },
      // Bloquear bots maliciosos comuns
      {
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'DotBot',
          'MJ12bot',
        ],
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
