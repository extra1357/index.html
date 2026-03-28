import { Metadata } from 'next';
import { gerarMetaDescription, gerarKeywords } from '@/lib/seo-utils';

/**
 * 🎯 METADATA DINÂMICA - STR GENETICS
 * Otimiza cada página para SEO
 */

interface ImovelMetadata {
  id: string;
  titulo: string;
  tipo: string;
  endereco: string;
  preco: number;
  descricao: string;
  imagens: string[];
  quartos?: number;
  banheiros?: number;
  garagem?: number;
}

/**
 * Gera metadata completa para página de imóvel
 */
export function gerarMetadataImovel(imovel: ImovelMetadata, slug: string): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://seudominio.com.br';
  const url = `${baseUrl}/imoveis/${slug}`;
  const imagemPrincipal = imovel.imagens[0] || `${baseUrl}/default-property.jpg`;

  const title = `${imovel.titulo} - ${imovel.tipo} em ${imovel.endereco.split(',')[0]} | Imobiliária Perto STR`;
  const description = gerarMetaDescription(imovel);
  const keywords = gerarKeywords(imovel);

  return {
    title,
    description,
    keywords,
    
    // Open Graph (Facebook, WhatsApp, LinkedIn)
    openGraph: {
      title,
      description,
      url,
      siteName: 'Imobiliária Perto STR',
      images: [
        {
          url: imagemPrincipal,
          width: 1200,
          height: 630,
          alt: imovel.titulo,
        },
      ],
      locale: 'pt_BR',
      type: 'website',
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imagemPrincipal],
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Links alternativos
    alternates: {
      canonical: url,
    },

    // Outras metas
    other: {
      'price:amount': imovel.preco.toString(),
      'price:currency': 'BRL',
      'property:type': imovel.tipo,
    },
  };
}

/**
 * Gera metadata para página inicial
 */
export function gerarMetadataHome(): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://seudominio.com.br';

  return {
    title: 'Imobiliária Perto STR - Imóveis de Alto Padrão em São Paulo',
    description: 'Encontre casas, apartamentos e terrenos de luxo. Imobiliária especializada em imóveis de alto padrão. Confira nossas ofertas exclusivas!',
    keywords: 'imobiliária, imóveis, casas, apartamentos, venda, aluguel, são paulo, alto padrão, luxo',
    
    openGraph: {
      title: 'Imobiliária Perto STR - Imóveis de Alto Padrão',
      description: 'Encontre seu imóvel dos sonhos. Casas, apartamentos e terrenos de luxo.',
      url: baseUrl,
      siteName: 'Imobiliária Perto STR',
      locale: 'pt_BR',
      type: 'website',
    },

    robots: {
      index: true,
      follow: true,
    },

    alternates: {
      canonical: baseUrl,
    },
  };
}
