// src/components/seo/RealEstateSchema.tsx
// Componente para Schema de Imóvel (Residence)

import { Decimal } from '@prisma/client/runtime/library';

interface RealEstateSchemaProps {
  imovel: {
    id: string;
    tipo: string;
    endereco: string;
    cidade: string;
    estado: string;
    bairro?: string | null;
    cep?: string | null;
    preco: Decimal;
    precoAluguel?: Decimal | null;
    metragem: Decimal;
    quartos: number;
    banheiros: number;
    vagas: number;
    descricao?: string | null;
    finalidade: string;
    imagens?: string[];
  };
}

export default function RealEstateSchema({ imovel }: RealEstateSchemaProps) {
  const precoFinal = imovel.finalidade === 'aluguel' && imovel.precoAluguel 
    ? Number(imovel.precoAluguel) 
    : Number(imovel.preco);

  const tipoImovel = imovel.tipo === 'Apartamento' ? 'Apartment' : 'House';

  const schema = {
    '@context': 'https://schema.org',
    '@type': tipoImovel,
    name: `${imovel.tipo} ${imovel.quartos} ${imovel.quartos === 1 ? 'quarto' : 'quartos'} - ${imovel.bairro || imovel.cidade}`,
    description: imovel.descricao || `${imovel.tipo} com ${imovel.quartos} quartos, ${imovel.banheiros} banheiros e ${imovel.vagas} vagas de garagem`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: imovel.endereco,
      addressLocality: imovel.cidade,
      addressRegion: imovel.estado,
      postalCode: imovel.cep || undefined,
      addressCountry: 'BR',
    },
    floorSize: {
      '@type': 'QuantitativeValue',
      value: Number(imovel.metragem),
      unitCode: 'MTK', // Metro quadrado
    },
    numberOfRooms: imovel.quartos,
    numberOfBathroomsTotal: imovel.banheiros,
    ...(imovel.imagens && imovel.imagens.length > 0 && {
      image: imovel.imagens,
    }),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: precoFinal,
      availability: 'https://schema.org/InStock',
      ...(imovel.finalidade === 'aluguel' && {
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: precoFinal,
          priceCurrency: 'BRL',
          unitText: 'Mensal',
        },
      }),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
