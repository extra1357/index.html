// src/lib/local-seo.ts
// Utilitários para SEO Local - Salto, Itu, Indaiatuba

export const CIDADES_ATENDIDAS = {
  Salto: {
    nome: 'Salto',
    estado: 'SP',
    lat: -23.2008,
    lng: -47.2865,
    cep: '13320-000',
    slug: 'salto',
    bairros: [
      'Centro',
      'Portal das Águas',
      'Jardim Itália',
      'Vila Nova',
      'Jardim Santa Maria',
      'Jardim América',
    ],
  },
  Itu: {
    nome: 'Itu',
    estado: 'SP',
    lat: -23.2641,
    lng: -47.2997,
    cep: '13300-000',
    slug: 'itu',
    bairros: [
      'Centro',
      'Cidade Nova',
      'Parque Residencial Potiguara',
      'Jardim Aeroporto',
      'Vila Gatti',
      'Parque das Rosas',
    ],
  },
  Indaiatuba: {
    nome: 'Indaiatuba',
    estado: 'SP',
    lat: -23.0903,
    lng: -47.2181,
    cep: '13330-000',
    slug: 'indaiatuba',
    bairros: [
      'Centro',
      'Cidade Nova',
      'Morada do Sol',
      'Jardim Pau Preto',
      'Parque Residencial Indaiá',
      'Jardim Europa',
    ],
  },
} as const;

export type CidadeNome = keyof typeof CIDADES_ATENDIDAS;

/**
 * Gera título SEO otimizado para página de imóveis
 */
export function gerarTituloSEO(
  cidade: CidadeNome,
  tipo?: 'apartamento' | 'casa',
  bairro?: string
): string {
  let titulo = `Imobiliária em ${cidade} SP`;
  
  if (tipo && bairro) {
    titulo = `${tipo === 'apartamento' ? 'Apartamentos' : 'Casas'} em ${bairro}, ${cidade} SP`;
  } else if (tipo) {
    titulo = `${tipo === 'apartamento' ? 'Apartamentos' : 'Casas'} em ${cidade} SP`;
  } else if (bairro) {
    titulo = `Imóveis em ${bairro}, ${cidade} SP`;
  }
  
  return `${titulo} - Imobiliária Perto`;
}

/**
 * Gera descrição SEO otimizada
 */
export function gerarDescricaoSEO(
  cidade: CidadeNome,
  tipo?: 'apartamento' | 'casa',
  bairro?: string
): string {
  const tipoTexto = tipo === 'apartamento' ? 'apartamentos' : tipo === 'casa' ? 'casas' : 'imóveis';
  const localTexto = bairro ? `${bairro}, ${cidade}` : cidade;
  
  return `Encontre ${tipoTexto} para alugar e comprar em ${localTexto} SP. Imobiliária especializada com os melhores imóveis perto de você.`;
}

/**
 * Gera keywords SEO
 */
export function gerarKeywordsSEO(
  cidade: CidadeNome,
  tipo?: 'apartamento' | 'casa',
  bairro?: string
): string {
  const keywords = [
    `imobiliária ${cidade.toLowerCase()}`,
    `imóveis ${cidade.toLowerCase()}`,
    `aluguel ${cidade.toLowerCase()}`,
  ];
  
  if (tipo) {
    keywords.push(`${tipo} ${cidade.toLowerCase()}`);
    keywords.push(`${tipo} para alugar ${cidade.toLowerCase()}`);
  }
  
  if (bairro) {
    keywords.push(`imóveis ${bairro.toLowerCase()} ${cidade.toLowerCase()}`);
    keywords.push(`${tipo || 'imóvel'} ${bairro.toLowerCase()}`);
  }
  
  return keywords.join(', ');
}

/**
 * Calcula distância entre duas coordenadas (em km)
 */
export function calcularDistancia(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Encontra a cidade mais próxima baseado em coordenadas
 */
export function encontrarCidadeMaisProxima(
  lat: number,
  lng: number
): CidadeNome {
  let cidadeMaisProxima: CidadeNome = 'Salto';
  let menorDistancia = Infinity;
  
  (Object.keys(CIDADES_ATENDIDAS) as CidadeNome[]).forEach((cidade) => {
    const dados = CIDADES_ATENDIDAS[cidade];
    const distancia = calcularDistancia(lat, lng, dados.lat, dados.lng);
    
    if (distancia < menorDistancia) {
      menorDistancia = distancia;
      cidadeMaisProxima = cidade;
    }
  });
  
  return cidadeMaisProxima;
}

/**
 * Gera URL canônica
 */
export function gerarURLCanonica(
  cidade: CidadeNome,
  bairro?: string,
  tipo?: string
): string {
  const baseURL = 'https://www.imobiliariaperto.com.br';
  const cidadeSlug = CIDADES_ATENDIDAS[cidade].slug;
  
  if (bairro && tipo) {
    const bairroSlug = bairro.toLowerCase().replace(/\s+/g, '-');
    return `${baseURL}/imoveis-${cidadeSlug}/${tipo}/${bairroSlug}`;
  }
  
  if (bairro) {
    const bairroSlug = bairro.toLowerCase().replace(/\s+/g, '-');
    return `${baseURL}/imoveis-${cidadeSlug}/${bairroSlug}`;
  }
  
  return `${baseURL}/imoveis-${cidadeSlug}`;
}

/**
 * Formata preço para exibição
 */
export function formatarPreco(valor: number, tipo: 'venda' | 'aluguel'): string {
  const precoFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
  
  return tipo === 'aluguel' ? `${precoFormatado}/mês` : precoFormatado;
}
