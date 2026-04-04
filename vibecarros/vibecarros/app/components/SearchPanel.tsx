"use client"
import { useState } from "react"

interface Props {
  onSearch?: (filtros: Record<string, string>) => void
}

export default function SearchPanel({ onSearch }: Props) {
  const [filtros, setFiltros] = useState<Record<string, string>>({})
  const set = (k: string, v: string) => setFiltros(f => ({ ...f, [k]: v }))

  return (
    <section className="search-section" id="busca">
      <div className="search-panel">
        <h2>🔍 Encontre seu veículo ideal</h2>
        <div className="search-grid">
          <div className="field-group">
            <label>Categoria</label>
            <select onChange={e => set("categoria", e.target.value)}>
              <option value="">Todos</option>
              <option>Carros</option>
              <option>Caminhonetes/SUV</option>
              <option>Motos</option>
              <option>Caminhões</option>
              <option>Vans/Utilitários</option>
            </select>
          </div>
          <div className="field-group">
            <label>Marca</label>
            <select onChange={e => set("marca", e.target.value)}>
              <option value="">Qualquer marca</option>
              <option>Chevrolet</option><option>Fiat</option><option>Ford</option>
              <option>Honda</option><option>Hyundai</option><option>Jeep</option>
              <option>Nissan</option><option>Renault</option><option>Toyota</option>
              <option>Volkswagen</option><option>BMW</option><option>Mercedes-Benz</option>
              <option>Audi</option>
            </select>
          </div>
          <div className="field-group">
            <label>Combustível</label>
            <select onChange={e => set("combustivel", e.target.value)}>
              <option value="">Qualquer</option>
              <option>Flex</option><option>Gasolina</option>
              <option>Etanol</option><option>Diesel</option>
              <option>Elétrico</option><option>Híbrido</option>
            </select>
          </div>
          <div className="field-group">
            <label>Preço mínimo</label>
            <input type="number" placeholder="R$ 0" onChange={e => set("precoMin", e.target.value)} />
          </div>
          <div className="field-group">
            <label>Preço máximo</label>
            <input type="number" placeholder="R$ 999.999" onChange={e => set("precoMax", e.target.value)} />
          </div>
        </div>
        <button className="btn-search" onClick={() => onSearch?.(filtros)}>🔍 Buscar Veículos</button>
      </div>
    </section>
  )
}