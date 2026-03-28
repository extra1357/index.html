/**
 * 📊 STRUCTURED DATA (JSON-LD) - STR GENETICS
 * Schema.org para Rich Results do Google
 */

interface ImovelSchema {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  preco: number;
  endereco: string;
  imagens: string[];
  quartos?: number;
  banheiros?: number;
  garagem?: number;
  area?: number;
}

/**
 * Gera JSON-LD para imóvel (aparece nos resultados do Google)
 */
export function gerarSchemaImovel(imovel: ImovelSchema, url: string) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': url,
    name: imovel.titulo,
    description: imovel.descricao || `${imovel.tipo} em ${imovel.endereco}`,
    image: imovel.imagens.slice(0, 5), // Google usa até 5 imagens
    url: url,
    offers: {
      '@type': 'Offer',
      price: imovel.preco,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      url: url,
    },
    brand: {
      '@type': 'Organization',
      name: 'Imobiliária Perto STR',
    },
    category: imovel.tipo,
    additionalProperty: [
      ...(imovel.quartos ? [{
        '@type': 'PropertyValue',
        name: 'Quartos',
        value: imovel.quartos,
      }] : []),
      ...(imovel.banheiros ? [{
        '@type': 'PropertyValue',
        name: 'Banheiros',
        value: imovel.banheiros,
      }] : []),
      ...(imovel.garagem ? [{
        '@type': 'PropertyValue',
        name: 'Vagas de Garagem',
        value: imovel.garagem,
      }] : []),
      ...(imovel.area ? [{
        '@type': 'PropertyValue',
        name: 'Área (m²)',
        value: imovel.area,
      }] : []),
    ],
  };

  return schema;
}

/**
 * Gera JSON-LD para página de listagem
 */
export function gerarSchemaListagem(imoveis: ImovelSchema[], baseUrl: string) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: imoveis.slice(0, 20).map((imovel: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: imovel.titulo,
        image: imovel.imagens[0],
        url: `${baseUrl}/imoveis/${imovel.id}`,
        offers: {
          '@type': 'Offer',
          price: imovel.preco,
          priceCurrency: 'BRL',
        },
      },
    })),
  };

  return schema;
}

/**
 * Gera JSON-LD para a empresa (aparece no Knowledge Graph)
 */
export function gerarSchemaEmpresa() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Imobiliária Perto STR',
    description: 'Imobiliária especializada em imóveis de alto padrão',
    url: 'https://seudominio.com.br',
    logo: 'https://seudominio.com.br/logo.png',
    telephone: '+55-11-99999-9999',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Sua Rua',
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      postalCode: '00000-000',
      addressCountry: 'BR',
    },
    sameAs: [
      // Adicione suas redes sociais aqui
      // 'https://facebook.com/suapagina',
      // 'https://instagram.com/suapagina',
    ],
    areaServed: {
      '@type': 'City',
      name: 'São Paulo',
    },
  };

  return schema;
}

/**
 * Componente para inserir JSON-LD na página
 */
export function StructuredData({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
