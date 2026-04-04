"use client"
import { Anuncio, Foto, User } from "@prisma/client"

type AnuncioComRelacoes = Anuncio & { fotos: Foto[]; user: Pick<User, "name" | "whatsapp"> }

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })
}

function diffLabel(preco: number, fipe: number | null) {
  if (!fipe) return null
  const diff = preco - fipe
  const pct = ((diff / fipe) * 100).toFixed(1)
  if (diff < 0) return <span className="price-diff below">▼ {Math.abs(Number(pct))}% abaixo da FIPE</span>
  if (diff > 0) return <span className="price-diff above">▲ {pct}% acima da FIPE</span>
  return <span className="price-diff">= Na média FIPE</span>
}

export default function CarCard({ anuncio, onClick }: { anuncio: AnuncioComRelacoes; onClick: () => void }) {
  const capa = anuncio.fotos.find(f => f.capa) ?? anuncio.fotos[0]
  const whatsappMsg = encodeURIComponent("Olá! Tenho interesse no " + anuncio.titulo + " anunciado no VibeCarros.")
  const whatsappUrl = "https://wa.me/" + anuncio.user.whatsapp + "?text=" + whatsappMsg
  return (
    <div className="car-card" onClick={onClick}>
      <div className="card-img-wrap">
        {capa && <img src={capa.url} alt={anuncio.titulo} loading="lazy" />}
        {anuncio.destaque && <div className="card-badge destaque">Destaque</div>}
      </div>
      <div className="card-body">
        <div className="card-title">{anuncio.titulo}</div>
        <div className="card-sub">{anuncio.anoFab} · {anuncio.marca}</div>
        <div className="card-specs">
          <span className="card-spec">{anuncio.combustivel}</span>
          <span className="card-spec">{anuncio.cambio}</span>
          <span className="card-spec">{anuncio.km.toLocaleString("pt-BR")} km</span>
        </div>
        <div className="card-prices">
          <div className="price-ask">
            <label>Preço pedido</label>
            <strong>{formatBRL(anuncio.preco)}</strong>
            {diffLabel(anuncio.preco, anuncio.fipe)}
          </div>
          {anuncio.fipe && (
            <div className="price-fipe">
              <label>Tabela FIPE</label>
              <strong>{formatBRL(anuncio.fipe)}</strong>
            </div>
          )}
        </div>
        <div className="card-footer">
          <a className="btn-whatsapp" href={whatsappUrl} target="_blank" onClick={e => e.stopPropagation()}>WhatsApp</a>
          <button className="btn-detail" onClick={e => { e.stopPropagation(); onClick() }}>Ver +</button>
        </div>
      </div>
    </div>
  )
}