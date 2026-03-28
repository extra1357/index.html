/**
 * Gera slug SEO-friendly para imóveis
 * @example "Casa em Salto, 3 quartos" → "casa-salto-3-quartos-cs001"
 */
export function generateSlug(imovel: {
  tipo: string;
  cidade: string;
  bairro?: string | null;
  quartos?: number;
  codigo?: string | null;
}): string {
  const parts: string[] = [];
  
  // 1. Tipo do imóvel
  parts.push(imovel.tipo.toLowerCase());
  
  // 2. Cidade
  parts.push(imovel.cidade.toLowerCase());
  
  // 3. Bairro (opcional)
  if (imovel.bairro) {
    parts.push(imovel.bairro.toLowerCase());
  }
  
  // 4. Quartos (se casa/apto)
  if (imovel.quartos && imovel.quartos > 0) {
    parts.push(`${imovel.quartos}q`);
  }
  
  // 5. Código único (garante unicidade)
  if (imovel.codigo) {
    parts.push(imovel.codigo.toLowerCase());
  }
  
  // Juntar e limpar
  return parts
    .join('-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100); // Max 100 chars
}

/**
 * Gera código único se não existir
 */
export function generateCodigo(tipo: string): string {
  const prefixo = tipo.substring(0, 2).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  return `${prefixo}${timestamp}`;
}
