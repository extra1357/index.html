"use client"
import { useState } from "react"
import { Anuncio, Foto, User } from "@prisma/client"
import CarCard from "./CarCard"

type AnuncioComRelacoes = Anuncio & { fotos: Foto[]; user: Pick<User, "name" | "whatsapp"> }

const categorias = ["Todos", "Carros", "SUV", "Picapes", "Motos"]

export default function Listings({ anuncios }: { anuncios: AnuncioComRelacoes[] }) {
  const [categoria, setCategoria] = useState("Todos")
  const [modal, setModal] = useState<AnuncioComRelacoes | null>(null)

  const filtrados = categoria === "Todos" ? anuncios : anuncios.filter(a => a.categoria === categoria)

  return (
    <section className="listings-section" id="anuncios">
      <div className="section-header">
        <div className="section-title">Anúncios em <span>Destaque</span></div>
        <div className="filter-tabs">
          {categorias.map(c => (
            <button key={c} className={`filter-tab${categoria === c ? " active" : ""}`} onClick={() => setCategoria(c)}>{c}</button>
          ))}
        </div>
      </div>

      <div className="cars-grid">
        {filtrados.length === 0 && <p style={{color:"var(--muted)"}}>Nenhum anúncio encontrado.</p>}
        {filtrados.map(a => (
          <CarCard key={a.id} anuncio={a} onClick={() => setModal(a)} />
        ))}
      </div>

      {modal && (
        <div className="modal-overlay open" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal.titulo}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {modal.fotos[0] && <img src={modal.fotos[0].url} alt={modal.titulo} style={{width:"100%",height:"220px",objectFit:"cover",borderRadius:"8px",marginBottom:"1rem"}} />}
              <strong style={{fontSize:"1.3rem"}}>{modal.preco.toLocaleString("pt-BR",{style:"currency",currency:"BRL",minimumFractionDigits:0})}</strong>
              <p style={{marginTop:"8px",fontSize:"0.88rem",color:"var(--muted)",lineHeight:"1.6"}}>{modal.descricao}</p>
              <a className="btn-whatsapp" href={"https://wa.me/" + modal.user.whatsapp} target="_blank" style={{marginTop:"1rem",display:"flex",justifyContent:"center"}}>
                Entrar em contato pelo WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}