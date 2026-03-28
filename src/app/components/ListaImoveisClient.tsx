'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
          <Link href="/" className="logo">🏠 Imobiliaria</Link>
          <div className="header-subtitles">
            <p>Salto • Itu • Indaiatuba • Sorocaba • Porto Feliz</p>
            <p>Casas • Apartamentos • Terrenos • Chacaras • Comercio</p>
            <p>2 Dormitorios • 3 Dormitorios • 4 Dormitorios • Varias quantidades de vagas</p>
          </div>
          <Link href="/admin" className="btn-login">Entrar</Link>
        </div>
      </header>

      <main className="main-content">

        {cidadeAtual && (
          <div className="cidade-banner">
            <h2>Imoveis em <strong>{cidadeAtual}</strong></h2>
            <Link href="/" className="ver-todos">Ver todas as cidades</Link>
          </div>
        )}

        <div className="filtros">
          <input
            type="text"
            placeholder="Buscar por titulo, endereco..."
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
            placeholder="Preco max."
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            className="input input-preco"
          />
        </div>

        <p className="contador">
          {filteredProperties.length} imovel{filteredProperties.length !== 1 ? 'is' : ''} encontrado{filteredProperties.length !== 1 ? 's' : ''}
          {cidadeAtual ? ` em ${cidadeAtual}` : ''}
        </p>

        {paginatedProperties.length > 0 ? (
          <div className="grid">
            {paginatedProperties.map((p, index) => (
              <Link href={`/imoveis/${p.slug || p.id}`} key={p.id} className="card-link">
                <article className="card">
                  {p.destaque && <div className="destaque-badge">Destaque</div>}
                  <div className="card-img">
                    <Image
                      src={p.imagens?.[0] || '/placeholder.jpg'}
                      alt={p.title}
                      width={400}
                      height={240}
                      sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      priority={index < 4}
                      loading={index < 4 ? 'eager' : 'lazy'}
                    />
                    <span className="tag tipo">{p.type}</span>
                    {p.finalidade && (
                      <span className={`tag finalidade ${p.finalidade.toLowerCase()}`}>
                        {p.finalidade}
                      </span>
                    )}
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{p.title}</h3>
                    <p className="card-endereco">{p.addr}</p>
                    <div className="card-features">
                      {p.quartos ? <span>{p.quartos} quartos</span> : null}
                      {p.suites ? <span>{p.suites} suites</span> : null}
                      {p.banheiros ? <span>{p.banheiros} ban.</span> : null}
                      {p.garagem ? <span>{p.garagem} vagas</span> : null}
                      {p.metragem ? <span>{p.metragem}m²</span> : null}
                    </div>
                    <div className="card-preco">R$ {new Intl.NumberFormat('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(p.price))}</div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="vazio">
            <div className="vazio-icon">🏚️</div>
            <p>Nenhum imovel encontrado</p>
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
        .card { width: 100%; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 8px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; }
        .card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
        .card-img { position: relative; width: 100%; aspect-ratio: 5/3; overflow: hidden; background: #e5e7eb; flex-shrink: 0; }
        .tag { position: absolute; top: 10px; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; color: #fff; z-index: 1; }
        .tag.tipo { left: 10px; background: #2563eb; }
        .tag.finalidade { right: 10px; }
        .tag.venda { background: #16a34a; }
        .tag.aluguel { background: #ea580c; }
        .card-body { padding: 14px; display: flex; flex-direction: column; flex: 1; }
        .card-title { font-size: 15px; font-weight: 600; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .card-endereco { font-size: 12px; color: #6b7280; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .card-features { display: flex; gap: 8px; font-size: 11px; color: #6b7280; flex-wrap: wrap; }
        .card-preco { margin-top: auto; padding-top: 10px; font-size: 18px; font-weight: 700; color: #2563eb; }
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
