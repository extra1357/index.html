import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buscarImovelPorId } from '@/lib/imoveis';
import ImovelDetalhes from './ImovelDetalhes';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

// ✅ META TAGS DINÂMICAS OTIMIZADAS
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const imovel = await buscarImovelPorId(params.id);
  
  if (!imovel) {
    return { 
      title: 'Imóvel não encontrado',
      robots: { index: false, follow: false }
    };
  }

  const titulo = `${imovel.type} ${imovel.quartos > 0 ? imovel.quartos + ' Quartos' : ''} em ${imovel.addr.split(',')[1]?.trim() || imovel.addr}`;
  const preco = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(imovel.price));
  const descricao = imovel.description 
    ? imovel.description.substring(0, 155) + '...'
    : `${imovel.type} com ${imovel.quartos} quartos, ${imovel.banheiros} banheiros, ${imovel.garagem} vagas. ${preco}. ${imovel.addr}`;

  // ✅ URL AMIGÁVEL com slug (se existir) - usa 'slug' se disponível no tipo
  const urlCanonical = (imovel as any).slug 
    ? `https://www.imobiliariaperto.com.br/imoveis/${(imovel as any).slug}`
    : `https://www.imobiliariaperto.com.br/imoveis/${params.id}`;

  return {
    title: `${titulo} - ${preco} | Imobiliária Perto`,
    description: descricao,
    keywords: [
      imovel.type.toLowerCase(),
      `${imovel.type.toLowerCase()} ${imovel.addr.split(',')[1]?.trim() || ''}`,
      `${imovel.type.toLowerCase()} ${imovel.finalidade}`,
      imovel.quartos > 0 ? `${imovel.quartos} quartos` : '',
      'imóvel venda',
      'imóvel aluguel'
    ].filter(Boolean),
    openGraph: {
      title: titulo,
      description: descricao,
      type: 'website',
      url: urlCanonical,
      images: imovel.imagens && imovel.imagens.length > 0 ? [
        {
          url: imovel.imagens[0],
          width: 1200,
          height: 630,
          alt: titulo
        }
      ] : []
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descricao,
      images: imovel.imagens?.[0] ? [imovel.imagens[0]] : []
    },
    alternates: {
      canonical: urlCanonical
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

export default async function ImovelPage({ params }: Props) {
  const imovel = await buscarImovelPorId(params.id);
  
  if (!imovel) {
    notFound();
  }

  // ✅ URL para Schema (usa slug se existir)
  const urlImovel = (imovel as any).slug 
    ? `https://www.imobiliariaperto.com.br/imoveis/${(imovel as any).slug}`
    : `https://www.imobiliariaperto.com.br/imoveis/${params.id}`;

  // ✅ SCHEMA.ORG - RealEstateListing
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": `${imovel.type} em ${imovel.addr}`,
    "description": imovel.description || `${imovel.type} com ${imovel.quartos} quartos`,
    "url": urlImovel,
    "image": imovel.imagens && imovel.imagens.length > 0 ? imovel.imagens : undefined,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": imovel.addr
    },
    "offers": {
      "@type": "Offer",
      "price": Number(imovel.price),
      "priceCurrency": "BRL",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    },
    "numberOfRooms": imovel.quartos || undefined,
    "numberOfBathroomsTotal": imovel.banheiros || undefined,
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": Number(imovel.metragem),
      "unitCode": "MTK"
    }
  };

  // ✅ BREADCRUMB SCHEMA
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.imobiliariaperto.com.br"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Imóveis",
        "item": "https://www.imobiliariaperto.com.br/imoveis-publicos"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": imovel.type,
        "item": urlImovel
      }
    ]
  };

  return (
    <>
      {/* ✅ Schemas JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <ImovelDetalhes imovel={imovel} />
    </>
  );
}
