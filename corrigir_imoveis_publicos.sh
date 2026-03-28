#!/bin/bash

PROJECT_DIR="$(pwd)"
echo "📁 Corrigindo imoveis-publicos em: $PROJECT_DIR"
echo ""

mkdir -p "$PROJECT_DIR/src/app/imoveis-publicos"
cat > "$PROJECT_DIR/src/app/imoveis-publicos/page.tsx" << 'EOF'
export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import Link from 'next/link';

interface Props {
  searchParams: { cidade?: string; bairro?: string; tipo?: string }
}

async function getImoveis(cidade?: string, bairro?: string, tipo?: string) {
  try {
    const imoveis = await prisma.imovel.findMany({
      where: {
        disponivel: true,
        status: 'ATIVO',
        ...(cidade ? { cidade: { contains: cidade, mode: 'insensitive' } } : {}),
        ...(bairro  ? { bairro:  { contains: bairro,  mode: 'insensitive' } } : {}),
        ...(tipo    ? { tipo:    { contains: tipo,    mode: 'insensitive' } } : {}),
      },
      orderBy: [
        { destaque: 'desc' },
        { createdAt: 'desc' },
      ],
    });
    return imoveis;
  } catch (error) {
    console.error('Erro ao buscar imóveis:', error);
    return [];
  }
}

export default async function ImoveisPublicosPage({ searchParams }: Props) {
  const cidade = searchParams?.cidade || '';
  const bairro = searchParams?.bairro || '';
  const tipo   = searchParams?.tipo   || '';

  const imoveis = await getImoveis(cidade || undefined, bairro || undefined, tipo || undefined);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div>
              <h1 className="text-3xl font-bold">🏢 Imobiliária Perto</h1>
              <p className="text-blue-200 text-sm">Encontre seu imóvel ideal</p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-sm"
            >
              🔐 Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Título dinâmico */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-10 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            {cidade ? `Imóveis em ${cidade}` : 'Todos os Imóveis'}
            {bairro ? ` - ${bairro}` : ''}
          </h2>
          <p className="text-gray-600">
            {imoveis.length} imóvel{imoveis.length !== 1 ? 'is' : ''} encontrado{imoveis.length !== 1 ? 's' : ''}
          </p>

          {/* Filtros rápidos por tipo */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['Casa', 'Apartamento', 'Terreno', 'Comercial'].map(t => (
              <Link
                key={t}
                href={`/imoveis-publicos?${cidade ? `cidade=${cidade}&` : ''}tipo=${t}`}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                  tipo === t
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {t}s
              </Link>
            ))}
            {(cidade || bairro || tipo) && (
              <Link
                href="/imoveis-publicos"
                className="px-4 py-2 rounded-full text-sm font-medium border border-red-300 text-red-600 bg-white hover:bg-red-50 transition"
              >
                ✕ Limpar filtros
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Listagem */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {imoveis.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="text-8xl mb-6">🏚️</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Nenhum imóvel encontrado</h3>
            <p className="text-gray-600 mb-6">
              {cidade ? `Não há imóveis disponíveis em ${cidade} no momento.` : 'Tente ajustar os filtros.'}
            </p>
            <Link href="/" className="text-blue-600 hover:underline">
              ← Voltar para a página inicial
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {imoveis.map((imovel) => {
              const preco = imovel.finalidade === 'aluguel' && imovel.precoAluguel
                ? Number(imovel.precoAluguel)
                : Number(imovel.preco);

              return (
                <Link
                  key={imovel.id}
                  href={`/imoveis/${imovel.id}`}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group block"
                >
                  <div className="h-52 overflow-hidden relative bg-gray-100">
                    {imovel.imagens && imovel.imagens.length > 0 ? (
                      <img
                        src={imovel.imagens[0]}
                        alt={`${imovel.tipo} em ${imovel.cidade}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-7xl">
                        {imovel.tipo === 'Apartamento' ? '🏢' :
                         imovel.tipo === 'Casa' ? '🏠' :
                         imovel.tipo === 'Terreno' ? '🏞️' : '🏪'}
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {imovel.tipo}
                    </span>
                    {imovel.finalidade && (
                      <span className={`absolute top-3 right-3 text-white text-xs font-bold px-3 py-1 rounded-full ${
                        imovel.finalidade === 'aluguel' ? 'bg-orange-500' : 'bg-green-600'
                      }`}>
                        {imovel.finalidade}
                      </span>
                    )}
                    {imovel.destaque && (
                      <span className="absolute bottom-3 left-3 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded">
                        ⭐ Destaque
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition">
                      {imovel.tipo} em {imovel.bairro || imovel.cidade}
                    </h3>
                    <p className="text-gray-500 text-sm mb-3">
                      📍 {imovel.endereco}, {imovel.cidade}/{imovel.estado}
                    </p>

                    <div className="flex gap-4 text-sm text-gray-600 mb-4 flex-wrap">
                      {imovel.quartos > 0 && <span>🛏️ {imovel.quartos} qtos</span>}
                      {imovel.banheiros > 0 && <span>🚿 {imovel.banheiros} ban</span>}
                      {imovel.vagas > 0 && <span>🚗 {imovel.vagas} vag</span>}
                      <span>📐 {Number(imovel.metragem)}m²</span>
                    </div>

                    <div className="border-t pt-3">
                      <p className="text-2xl font-bold text-green-600">
                        R$ {preco.toLocaleString('pt-BR')}
                        {imovel.finalidade === 'aluguel' && <span className="text-sm text-gray-500">/mês</span>}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 mt-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2025 Imobiliária Perto. Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  );
}
EOF
echo "✅ src/app/imoveis-publicos/page.tsx corrigido"
echo ""
echo "✅ Pronto! Rode: npm run dev"
