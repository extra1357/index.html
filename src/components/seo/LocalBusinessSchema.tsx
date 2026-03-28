// src/components/seo/LocalBusinessSchema.tsx
// Componente para Schema de LocalBusiness - Imobiliária

interface LocalBusinessSchemaProps {
  cidade: 'Salto' | 'Itu' | 'Indaiatuba' | 'Sorocaba' | 'Porto Feliz' | 'Campinas';
  telefone?: string;
  email?: string;
  endereco?: string;
}

const cidadeData = {
  Salto: {
    lat: '-23.2008',
    lng: '-47.2865',
    cep: '13320-000',
    descricao: 'Imobiliária especializada em Salto SP. Apartamentos e casas para alugar no Centro, Portal das Águas, Jardim Itália.',
  },
  Itu: {
    lat: '-23.2641',
    lng: '-47.2997',
    cep: '13300-000',
    descricao: 'Imobiliária especializada em Itu SP. Imóveis no Centro, Cidade Nova, Parque Residencial Potiguara.',
  },
  Indaiatuba: {
    lat: '-23.0903',
    lng: '-47.2181',
    cep: '13330-000',
    descricao: 'Imobiliária especializada em Indaiatuba SP. Imóveis em Cidade Nova, Morada do Sol, Jardim Pau Preto.',
  },
  Sorocaba: {
    lat: '-23.5015',
    lng: '-47.4526',
    cep: '18010-000',
    descricao: 'Imobiliária especializada em Sorocaba SP. Apartamentos e casas no Campolim, Jardim Emília, Wanel Ville e Centro.',
  },
  'Porto Feliz': {
    lat: '-23.2139',
    lng: '-47.5247',
    cep: '18540-000',
    descricao: 'Imobiliária especializada em Porto Feliz SP. Imóveis no Centro, Jardim São Paulo, Vila Aparecida e Jardim Estância Brasil.',
  },
  Campinas: {
    lat: '-22.9099',
    lng: '-47.0626',
    cep: '13010-000',
    descricao: 'Imobiliária especializada em Campinas SP. Apartamentos e casas no Cambuí, Taquaral, Nova Campinas e Jardim Chapadão.',
  },
};

export default function LocalBusinessSchema({
  cidade,
  telefone = '+55-11-97666-1297',
  email = 'imobiliariaperto@gmail.com.br',
  endereco = 'Rua Estado Do Maranhão, 289',
}: LocalBusinessSchemaProps) {
  const data = cidadeData[cidade];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: `Imobiliária Perto - ${cidade} SP`,
    description: data.descricao,
    url: `https://www.imobiliariaperto.com.br/imoveis-${cidade.toLowerCase().replace(' ', '-')}`,
    telephone: telefone,
    email: email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: endereco,
      addressLocality: cidade,
      addressRegion: 'SP',
      postalCode: data.cep,
      addressCountry: 'BR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: data.lat,
      longitude: data.lng,
    },
    areaServed: [
      {
        '@type': 'City',
        name: cidade,
      },
    ],
    priceRange: '$$',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '18:00',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
