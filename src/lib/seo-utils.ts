/**
 * 🔗 GERADOR DE SLUGS SEO - STR GENETICS
 * Cria URLs amigáveis para Google
 */

/**
 * Gera slug SEO-friendly a partir do título e características do imóvel
 */
export function gerarSlugImovel(imovel: {
  titulo: string;
  tipo: string;
  endereco: string;
  quartos?: number;
  banheiros?: number;
  id: string;
}): string {
  // Pegar palavras importantes do título
  let slug = imovel.titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por hífen
    .replace(/-+/g, '-'); // Remove hífens duplicados

  // Adicionar tipo
  const tipo = imovel.tipo.toLowerCase().replace(/[^a-z]/g, '');
  
  // Adicionar características importantes
  const caracteristicas: string[] = [];
  
  if (imovel.quartos && imovel.quartos > 0) {
    caracteristicas.push(`${imovel.quartos}-quartos`);
  }
  
  if (imovel.banheiros && imovel.banheiros > 0) {
    caracteristicas.push(`${imovel.banheiros}-banheiros`);
  }

  // Pegar bairro do endereço se possível
  const enderecoLimpo = imovel.endereco
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/[\s,]+/)
    .slice(0, 2) // Pega primeiras 2 palavras
    .join('-');

  // Montar slug final
  const partes = [
    tipo,
    slug.slice(0, 40), // Limita tamanho
    ...caracteristicas,
    enderecoLimpo
  ].filter(Boolean);

  const slugFinal = partes.join('-').slice(0, 100); // Max 100 chars

  // Adicionar ID no final para garantir unicidade
  return `${slugFinal}-${imovel.id.slice(0, 8)}`;
}

/**
 * Extrai ID do slug
 */
export function extrairIdDoSlug(slug: string): string | null {
  // ID está sempre nos últimos 8 caracteres após último hífen
  const partes = slug.split('-');
  const ultimaParte = partes[partes.length - 1];
  
  if (ultimaParte && ultimaParte.length === 8) {
    return ultimaParte;
  }
  
  return null;
}

/**
 * Gera meta description SEO otimizada
 */
export function gerarMetaDescription(imovel: {
  titulo: string;
  tipo: string;
  endereco: string;
  preco: number;
  quartos?: number;
  banheiros?: number;
  garagem?: number;
}): string {
  const caracteristicas: string[] = [];
  
  if (imovel.quartos) caracteristicas.push(`${imovel.quartos} quartos`);
  if (imovel.banheiros) caracteristicas.push(`${imovel.banheiros} banheiros`);
  if (imovel.garagem) caracteristicas.push(`${imovel.garagem} vagas`);

  const precoFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(imovel.preco);

  const descricao = `${imovel.tipo} ${imovel.titulo} em ${imovel.endereco}. ` +
    (caracteristicas.length > 0 ? `${caracteristicas.join(', ')}. ` : '') +
    `${precoFormatado}. Confira fotos e agende sua visita! Imobiliária Perto STR.`;

  // Google recomenda max 160 caracteres
  return descricao.slice(0, 160);
}

/**
 * Gera keywords SEO
 */
export function gerarKeywords(imovel: {
  titulo: string;
  tipo: string;
  endereco: string;
}): string {
  const palavrasChave = [
    imovel.tipo.toLowerCase(),
    'imóvel',
    'venda',
    imovel.endereco.split(',')[0]?.trim().toLowerCase(),
    'imobiliária',
    'imóveis à venda',
    imovel.titulo.toLowerCase(),
  ].filter(Boolean);

  return palavrasChave.join(', ');
}
