#!/bin/bash

# ============================================
#   Script para aplicar arquivos do projeto
#   Imobiliária STR — caminhos corretos src/app
# ============================================

PROJECT_DIR="$(pwd)"

echo "📁 Aplicando arquivos em: $PROJECT_DIR"
echo ""

# ─────────────────────────────────────────────
# Limpa arquivos criados no lugar errado antes
# ─────────────────────────────────────────────
rm -f "$PROJECT_DIR/app/components/ListaImoveisClient.tsx"
rm -f "$PROJECT_DIR/app/page.tsx"
rmdir "$PROJECT_DIR/app/components" 2>/dev/null
rmdir "$PROJECT_DIR/app/api/imoveis" 2>/dev/null
rmdir "$PROJECT_DIR/app/api" 2>/dev/null
rmdir "$PROJECT_DIR/app" 2>/dev/null
echo "🧹 Arquivos do lugar errado removidos"
echo ""

# ─────────────────────────────────────────────
# 1. src/app/api/imoveis/route.ts
# ─────────────────────────────────────────────
mkdir -p "$PROJECT_DIR/src/app/api/imoveis"
cat > "$PROJECT_DIR/src/app/api/imoveis/route.ts" << 'EOF'
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSlug, generateCodigo } from '@/lib/generateSlug';

// GET: Lista todos os imóveis com dados do proprietário
// Aceita ?cidade=NomeCidade para filtrar por cidade
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cidade = searchParams.get('cidade');

    const imoveis = await prisma.imovel.findMany({
      where: cidade
        ? { cidade: { contains: cidade, mode: 'insensitive' } }
        : undefined,
      include: {
        proprietario: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(imoveis);
  } catch (error: any) {
    console.error('❌ Erro ao ler banco STR:', error);
    return NextResponse.json({ error: 'Erro ao ler banco STR' }, { status: 500 });
  }
}

// POST: Cria um novo imóvel
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📦 Recebido para salvar:', body);

    const codigo = body.codigo || generateCodigo(body.tipo);
    const slug = generateSlug({
      tipo: body.tipo,
      cidade: body.cidade,
      bairro: body.endereco?.split(',')[1]?.trim() || '',
      quartos: parseInt(body.quartos) || 0,
      codigo,
    });

    const novoImovel = await prisma.imovel.create({
      data: {
        tipo: body.tipo,
        endereco: body.endereco,
        cidade: body.cidade,
        estado: body.estado,
        preco: Number(body.preco),
        metragem: Number(body.metragem),
        quartos: parseInt(body.quartos) || 0,
        banheiros: parseInt(body.banheiros) || 0,
        vagas: parseInt(body.vagas) || 0,
        descricao: body.descricao,
        status: body.status || 'ATIVO',
        disponivel: body.disponivel !== undefined ? body.disponivel : true,
        imagens: body.imagens || [],
        proprietarioId: body.proprietarioId,
        finalidade: body.finalidade || 'venda',
        bairro: body.bairro || null,
        cep: body.cep || null,
        suites: parseInt(body.suites) || 0,
        precoAluguel: body.precoAluguel ? Number(body.precoAluguel) : null,
        caracteristicas: body.caracteristicas || [],
        destaque: body.destaque || false,
        codigo,
        slug,
      },
    });

    return NextResponse.json(novoImovel);
  } catch (error: any) {
    console.error('❌ Erro ao salvar imóvel:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar no banco', detalhes: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove um imóvel específico
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) throw new Error('ID não fornecido');

    await prisma.imovel.delete({ where: { id } });

    return NextResponse.json({ mensagem: 'Imóvel removido com sucesso' });
  } catch (error: any) {
    console.error('❌ Erro ao deletar imóvel:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
EOF
echo "✅ src/app/api/imoveis/route.ts"

# ─────────────────────────────────────────────
# 2. src/lib/imoveis.ts
# ─────────────────────────────────────────────
mkdir -p "$PROJECT_DIR/src/lib"
cat > "$PROJECT_DIR/src/lib/imoveis.ts" << 'EOF'
export const dynamic = 'force-dynamic';
import { prisma } from './prisma';

export async function buscarImoveis(cidade?: string) {
  const imoveis = await prisma.imovel.findMany({
    where: {
      disponivel: true,
      ...(cidade ? { cidade: { contains: cidade, mode: 'insensitive' } } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return imoveis.map((i: any) => ({
    id: i.id,
    type: i.tipo,
    title: `${i.tipo} em ${i.cidade}`,
    addr: `${i.endereco}${i.bairro ? ' - ' + i.bairro : ''}, ${i.cidade}/${i.estado}`,
    price: Number(i.preco),
    imagens: i.imagens || [],
    description: i.descricao,
    quartos: i.quartos,
    banheiros: i.banheiros,
    garagem: i.vagas,
    suites: i.suites,
    metragem: Number(i.metragem),
    finalidade: i.finalidade,
    destaque: i.destaque,
    slug: i.slug,
    codigo: i.codigo,
    precoAluguel: i.precoAluguel ? Number(i.precoAluguel) : null,
    caracteristicas: i.caracteristicas || [],
  }));
}

export async function buscarImovelPorId(id: string) {
  const imovel = await prisma.imovel.findUnique({ where: { id } });
  if (!imovel) return null;

  return {
    id: imovel.id,
    type: imovel.tipo,
    title: `${imovel.tipo} em ${imovel.cidade}`,
    addr: `${imovel.endereco}${imovel.bairro ? ' - ' + imovel.bairro : ''}, ${imovel.cidade}/${imovel.estado}`,
    price: Number(imovel.preco),
    imagens: imovel.imagens || [],
    description: imovel.descricao,
    quartos: imovel.quartos,
    banheiros: imovel.banheiros,
    garagem: imovel.vagas,
    suites: imovel.suites,
    metragem: Number(imovel.metragem),
    finalidade: imovel.finalidade,
    destaque: imovel.destaque,
    slug: imovel.slug,
    codigo: imovel.codigo,
    precoAluguel: imovel.precoAluguel ? Number(imovel.precoAluguel) : null,
    caracteristicas: imovel.caracteristicas || [],
  };
}

export async function buscarImovelPorSlug(slug: string) {
  const imovel = await prisma.imovel.findUnique({ where: { slug } });
  if (!imovel) return null;

  return {
    id: imovel.id,
    type: imovel.tipo,
    title: `${imovel.tipo} em ${imovel.cidade}`,
    addr: `${imovel.endereco}${imovel.bairro ? ' - ' + imovel.bairro : ''}, ${imovel.cidade}/${imovel.estado}`,
    price: Number(imovel.preco),
    imagens: imovel.imagens || [],
    description: imovel.descricao,
    quartos: imovel.quartos,
    banheiros: imovel.banheiros,
    garagem: imovel.vagas,
    suites: imovel.suites,
    metragem: Number(imovel.metragem),
    finalidade: imovel.finalidade,
    destaque: imovel.destaque,
    slug: imovel.slug,
    codigo: imovel.codigo,
    precoAluguel: imovel.precoAluguel ? Number(imovel.precoAluguel) : null,
    caracteristicas: imovel.caracteristicas || [],
  };
}
EOF
echo "✅ src/lib/imoveis.ts"

# ─────────────────────────────────────────────
# 3. src/app/page.tsx
# ─────────────────────────────────────────────
cat > "$PROJECT_DIR/src/app/page.tsx" << 'EOF'
export const dynamic = 'force-dynamic';

import { buscarImoveis } from '@/lib/imoveis';
import ListaImoveisClient from './components/ListaImoveisClient';
import Footer from './components/Footer';

interface HomePageProps {
  searchParams: { cidade?: string };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const cidade = searchParams?.cidade || '';
  const imoveis = await buscarImoveis(cidade || undefined);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ListaImoveisClient initialData={imoveis} cidadeAtual={cidade} />
      <Footer />
    </div>
  );
}
EOF
echo "✅ src/app/page.tsx"

# ─────────────────────────────────────────────
# 4. src/app/components/ListaImoveisClient.tsx
# ─────────────────────────────────────────────
cat > "$PROJECT_DIR/src/app/components/ListaImoveisClient.tsx" << 'EOF'
'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import LeadWidget from './LeadWidget'

interface Imovel {
  id: string
  type: string
  title: string
  addr: string
  price: number
  imagens: string[]
  description: string
  quartos?: number
  banheiros?: number
  garagem?: number
  suites?: number
  metragem?: number
  finalidade?: string
  destaque?: boolean
  slug?: string
  codigo?: string
  precoAluguel?: number | null
  caracteristicas?: string[]
}

interface ListaImoveisProps {
  initialData: Imovel[]
  cidadeAtual?: string
}

export default function ListaImoveisClient({ initialData, cidadeAtual }: ListaImoveisProps) {
  const properties = initialData

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [maxPrice, setMaxPrice] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const ITEMS_PER_PAGE = 8

  const filteredProperties = useMemo(() => {
    const q = searchQuery.toLowerCase()
    const max = Number(maxPrice.replace(/\D/g, ''))

    return properties.filter(p => {
      const matchSearch =
        p.title.toLowerCase().includes(q) ||
        p.addr.toLowerCase().includes(q) ||
        String(p.id).includes(q)
      const matchType = filterType === 'all' || p.type === filterType
      const matchPrice = !maxPrice || p.price <= max
      return matchSearch && matchType && matchPrice
    })
  }, [properties, searchQuery, filterType, maxPrice])

  useEffect(() => { setCurrentPage(1) }, [searchQuery, filterType, maxPrice])

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE)

  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProperties.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredProperties, currentPage])

  return (
    <div className="page-wrapper">
      <header className="header">
        <div className="header-content">
          <Link href="/" className="logo">🏠 Imobiliária</Link>
          <div className="header-subtitles">
            <p>Salto • Itu • Indaiatuba • Sorocaba • Porto Feliz</p>
            <p>Casas • Apartamentos • Terrenos • Chácaras • Comércio</p>
            <p>2 Dormitórios • 3 Dormitórios • 4 Dormitórios • Várias quantidades de vagas</p>
          </div>
          <Link href="/admin" className="btn-login">🔐 Entrar</Link>
        </div>
      </header>

      <main className="main-content">

        {cidadeAtual && (
          <div className="cidade-banner">
            <h2>📍 Imóveis em <strong>{cidadeAtual}</strong></h2>
            <Link href="/" className="ver-todos">Ver todas as cidades →</Link>
          </div>
        )}

        <div className="filtros">
          <input
            type="text"
            placeholder="Buscar por título, endereço..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input"
          />
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="select">
            <option value="all">Todos os tipos</option>
            <option value="Casa">Casas</option>
            <option value="Apartamento">Apartamentos</option>
            <option value="Terreno">Terrenos</option>
            <option value="Comercial">Comercial</option>
          </select>
          <input
            type="text"
            placeholder="Preço máx."
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            className="input input-preco"
          />
        </div>

        <p className="contador">
          {filteredProperties.length} imóvel{filteredProperties.length !== 1 ? 'is' : ''} encontrado{filteredProperties.length !== 1 ? 's' : ''}
          {cidadeAtual ? ` em ${cidadeAtual}` : ''}
        </p>

        {paginatedProperties.length > 0 ? (
          <div className="grid">
            {paginatedProperties.map(p => (
              <Link href={`/imoveis/${p.id}`} key={p.id} className="card-link">
                <article className="card">
                  {p.destaque && <div className="destaque-badge">⭐ Destaque</div>}
                  <div className="card-img">
                    <img src={p.imagens?.[0] || '/placeholder.jpg'} alt={p.title} loading="lazy" />
                    <span className="tag tipo">{p.type}</span>
                    {p.finalidade && (
                      <span className={`tag finalidade ${p.finalidade.toLowerCase()}`}>
                        {p.finalidade}
                      </span>
                    )}
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{p.title}</h3>
                    <p className="card-endereco">📍 {p.addr}</p>
                    <div className="card-features">
                      {p.quartos ? <span>🛏️ {p.quartos}</span> : null}
                      {p.suites ? <span>🛁 {p.suites}</span> : null}
                      {p.banheiros ? <span>🚿 {p.banheiros}</span> : null}
                      {p.garagem ? <span>🚗 {p.garagem}</span> : null}
                      {p.metragem ? <span>📐 {p.metragem}m²</span> : null}
                    </div>
                    <div className="card-preco">R$ {p.price.toLocaleString('pt-BR')}</div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="vazio">
            <div className="vazio-icon">🏚️</div>
            <p>Nenhum imóvel encontrado</p>
            {(searchQuery || filterType !== 'all' || maxPrice) && (
              <button className="limpar-filtros" onClick={() => { setSearchQuery(''); setFilterType('all'); setMaxPrice('') }}>
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="paginacao">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>←</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
              <button key={pg} onClick={() => setCurrentPage(pg)} className={currentPage === pg ? 'ativo' : ''}>{pg}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>→</button>
          </div>
        )}
      </main>

      <LeadWidget />

      <style jsx>{`
        .page-wrapper { min-height: 100vh; background: #f9fafb; }
        .header { background: #fff; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; z-index: 100; }
        .header-content { max-width: 1400px; margin: 0 auto; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
        .logo { font-size: 18px; font-weight: 700; color: #1f2937; text-decoration: none; white-space: nowrap; }
        .header-subtitles p { font-size: 12px; color: #6b7280; margin: 0; text-align: center; }
        .btn-login { background: #1f2937; color: #fff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; white-space: nowrap; }
        .main-content { max-width: 1400px; margin: 0 auto; padding: 24px; }
        .cidade-banner { display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px 20px; margin-bottom: 20px; }
        .cidade-banner h2 { font-size: 18px; color: #1e40af; margin: 0; }
        .ver-todos { font-size: 13px; color: #2563eb; text-decoration: none; }
        .ver-todos:hover { text-decoration: underline; }
        .filtros { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
        .input, .select { padding: 10px 14px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
        .input { flex: 1; min-width: 150px; }
        .input-preco { width: 130px; flex: none; }
        .contador { color: #6b7280; margin-bottom: 20px; font-size: 14px; }
        .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; align-items: stretch; }
        .card-link { display: flex; height: 100%; text-decoration: none; color: inherit; position: relative; }
        .destaque-badge { position: absolute; top: -8px; left: 12px; z-index: 10; background: #f59e0b; color: #fff; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; }
        .card { width: 100%; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 8px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s; height: 340px; display: flex; flex-direction: column; }
        .card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
        .card-img { position: relative; height: 180px; overflow: hidden; background: #e5e7eb; flex-shrink: 0; }
        .card-img img { width: 100%; height: 100%; object-fit: cover; }
        .tag { position: absolute; top: 10px; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; color: #fff; }
        .tag.tipo { left: 10px; background: #2563eb; }
        .tag.finalidade { right: 10px; }
        .tag.venda { background: #16a34a; }
        .tag.aluguel { background: #ea580c; }
        .card-body { padding: 14px; display: flex; flex-direction: column; flex: 1; }
        .card-title { font-size: 15px; font-weight: 600; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .card-endereco { font-size: 12px; color: #6b7280; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .card-features { display: flex; gap: 8px; font-size: 11px; color: #6b7280; flex-wrap: wrap; }
        .card-preco { margin-top: auto; font-size: 18px; font-weight: 700; color: #2563eb; }
        .vazio { text-align: center; padding: 60px; color: #9ca3af; }
        .vazio-icon { font-size: 48px; margin-bottom: 12px; }
        .limpar-filtros { margin-top: 12px; padding: 8px 20px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
        .paginacao { display: flex; justify-content: center; gap: 6px; margin-top: 32px; }
        .paginacao button { padding: 8px 14px; border: none; border-radius: 6px; background: #e5e7eb; cursor: pointer; font-size: 14px; }
        .paginacao button:disabled { opacity: 0.4; cursor: default; }
        .paginacao button.ativo { background: #2563eb; color: #fff; }
        @media (max-width: 1200px) { .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 900px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 600px) {
          .grid { grid-template-columns: 1fr; }
          .filtros { flex-direction: column; }
          .input, .input-preco { width: 100%; }
          .cidade-banner { flex-direction: column; gap: 8px; align-items: flex-start; }
          .header-subtitles { display: none; }
        }
      `}</style>
    </div>
  )
}
EOF
echo "✅ src/app/components/ListaImoveisClient.tsx"

echo ""
echo "✅ Todos os arquivos aplicados com sucesso!"
echo ""
echo "Agora rode: npm run dev"
