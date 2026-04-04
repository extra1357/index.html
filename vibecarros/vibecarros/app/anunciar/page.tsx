"use client"

import { useState, useRef } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { useUser, SignInButton } from "@clerk/nextjs"

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Etapa = "veiculo" | "fotos" | "contato" | "publicar"

interface DadosVeiculo {
  categoria: string
  marca: string
  modelo: string
  versao: string
  anoFab: string
  anoMod: string
  km: string
  combustivel: string
  cambio: string
  cor: string
  portas: string
  blindado: boolean
  financiamento: boolean
  troca: boolean
  preco: string
  fipe: string
  placa: string
  descricao: string
}

interface DadosContato {
  nome: string
  email: string
  whatsapp: string
  documento: string // CPF ou CNPJ
  cidade: string
  estado: string
}

const CIDADES_COBERTURA = ["Itu", "Salto", "Indaiatuba", "Sorocaba", "Porto Feliz"]

const CATEGORIAS = ["Carros", "Caminhonetes/SUV", "Motos", "Utilitários", "Esportivos"]
const COMBUSTIVEIS = ["Flex", "Gasolina", "Diesel", "Elétrico", "Híbrido", "Etanol", "GNV"]
const CAMBIOS = ["Manual", "Automático", "CVT", "Automatizado", "Dupla Embreagem"]
const CORES = ["Branco", "Preto", "Prata", "Cinza", "Vermelho", "Azul", "Verde", "Amarelo", "Laranja", "Marrom", "Bege", "Vinho"]
const ESTADOS = ["SP", "RJ", "MG", "PR", "SC", "RS", "GO", "DF", "BA", "CE", "PE", "AM", "PA"]

// ─── Utilitários ──────────────────────────────────────────────────────────────

function formatarWhatsApp(valor: string) {
  const nums = valor.replace(/\D/g, "").slice(0, 11)
  if (nums.length <= 2) return nums
  if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`
}

function formatarDocumento(valor: string) {
  const nums = valor.replace(/\D/g, "").slice(0, 14)
  if (nums.length <= 11) {
    // CPF
    if (nums.length <= 3) return nums
    if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`
    if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`
    return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`
  }
  // CNPJ
  if (nums.length <= 2) return nums
  if (nums.length <= 5) return `${nums.slice(0, 2)}.${nums.slice(2)}`
  if (nums.length <= 8) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5)}`
  if (nums.length <= 12) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8)}`
  return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8, 12)}-${nums.slice(12)}`
}

function detectarTipoDoc(doc: string) {
  const nums = doc.replace(/\D/g, "")
  if (nums.length <= 11) return "CPF"
  return "CNPJ"
}

function formatarPreco(valor: string) {
  const nums = valor.replace(/\D/g, "")
  if (!nums) return ""
  return Number(nums).toLocaleString("pt-BR")
}

// ─── Componente de Progresso ──────────────────────────────────────────────────

function BarraProgresso({ etapaAtual }: { etapaAtual: Etapa }) {
  const etapas: { id: Etapa; label: string; icon: string }[] = [
    { id: "veiculo", label: "Veículo", icon: "🚗" },
    { id: "fotos", label: "Fotos", icon: "📷" },
    { id: "contato", label: "Contato", icon: "👤" },
    { id: "publicar", label: "Publicar", icon: "🚀" },
  ]
  const idx = etapas.findIndex((e) => e.id === etapaAtual)
  return (
    <div style={styles.progressWrapper}>
      {etapas.map((etapa, i) => (
        <div key={etapa.id} style={styles.progressItem}>
          <div style={{
            ...styles.progressCircle,
            background: i <= idx ? "var(--accent2)" : "var(--card-bg)",
            border: i <= idx ? "2px solid var(--accent2)" : "2px solid #444",
            color: i <= idx ? "#000" : "#888",
            transform: i === idx ? "scale(1.15)" : "scale(1)",
          }}>
            {i < idx ? "✓" : etapa.icon}
          </div>
          <span style={{
            ...styles.progressLabel,
            color: i <= idx ? "var(--accent2)" : "#666",
            fontWeight: i === idx ? 700 : 400,
          }}>
            {etapa.label}
          </span>
          {i < etapas.length - 1 && (
            <div style={{
              ...styles.progressLine,
              background: i < idx ? "var(--accent2)" : "#333",
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Etapa 1: Dados do Veículo ────────────────────────────────────────────────

function EtapaVeiculo({ dados, onChange, onNext }: {
  dados: DadosVeiculo
  onChange: (field: keyof DadosVeiculo, value: string | boolean) => void
  onNext: () => void
}) {
  const [erros, setErros] = useState<Partial<Record<keyof DadosVeiculo, string>>>({})

  function validar() {
    const e: Partial<Record<keyof DadosVeiculo, string>> = {}
    if (!dados.categoria) e.categoria = "Selecione a categoria"
    if (!dados.marca.trim()) e.marca = "Informe a marca"
    if (!dados.modelo.trim()) e.modelo = "Informe o modelo"
    if (!dados.anoFab || Number(dados.anoFab) < 1950 || Number(dados.anoFab) > new Date().getFullYear() + 1)
      e.anoFab = "Ano inválido"
    if (!dados.anoMod || Number(dados.anoMod) < 1950 || Number(dados.anoMod) > new Date().getFullYear() + 2)
      e.anoMod = "Ano inválido"
    if (!dados.km || Number(dados.km.replace(/\D/g, "")) < 0) e.km = "KM inválido"
    if (!dados.combustivel) e.combustivel = "Selecione o combustível"
    if (!dados.cambio) e.cambio = "Selecione o câmbio"
    if (!dados.cor) e.cor = "Selecione a cor"
    if (!dados.preco) e.preco = "Informe o preço"
    setErros(e)
    return Object.keys(e).length === 0
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>🚗 Dados do Veículo</h2>
      <p style={styles.cardSubtitle}>Preencha as informações do seu veículo. Quanto mais detalhes, mais rápido você vende!</p>

      <div style={styles.grid2}>
        <Campo label="Categoria *" erro={erros.categoria}>
          <select style={styles.select} value={dados.categoria} onChange={e => onChange("categoria", e.target.value)}>
            <option value="">Selecione...</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Campo>
        <Campo label="Cor *" erro={erros.cor}>
          <select style={styles.select} value={dados.cor} onChange={e => onChange("cor", e.target.value)}>
            <option value="">Selecione...</option>
            {CORES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Campo>
      </div>

      <div style={styles.grid2}>
        <Campo label="Marca *" erro={erros.marca}>
          <input style={styles.input} placeholder="Ex: Toyota, Honda, Fiat..." value={dados.marca}
            onChange={e => onChange("marca", e.target.value)} />
        </Campo>
        <Campo label="Modelo *" erro={erros.modelo}>
          <input style={styles.input} placeholder="Ex: Corolla, Civic, Uno..." value={dados.modelo}
            onChange={e => onChange("modelo", e.target.value)} />
        </Campo>
      </div>

      <Campo label="Versão / Trim">
        <input style={styles.input} placeholder="Ex: XEi 2.0 Flex, EXL 1.5 Turbo..." value={dados.versao}
          onChange={e => onChange("versao", e.target.value)} />
      </Campo>

      <div style={styles.grid3}>
        <Campo label="Ano Fab. *" erro={erros.anoFab}>
          <input style={styles.input} type="number" placeholder="2020" value={dados.anoFab}
            onChange={e => onChange("anoFab", e.target.value)} />
        </Campo>
        <Campo label="Ano Mod. *" erro={erros.anoMod}>
          <input style={styles.input} type="number" placeholder="2021" value={dados.anoMod}
            onChange={e => onChange("anoMod", e.target.value)} />
        </Campo>
        <Campo label="KM *" erro={erros.km}>
          <input style={styles.input} placeholder="45.000" value={dados.km}
            onChange={e => onChange("km", formatarPreco(e.target.value))} />
        </Campo>
      </div>

      <div style={styles.grid2}>
        <Campo label="Combustível *" erro={erros.combustivel}>
          <select style={styles.select} value={dados.combustivel} onChange={e => onChange("combustivel", e.target.value)}>
            <option value="">Selecione...</option>
            {COMBUSTIVEIS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Campo>
        <Campo label="Câmbio *" erro={erros.cambio}>
          <select style={styles.select} value={dados.cambio} onChange={e => onChange("cambio", e.target.value)}>
            <option value="">Selecione...</option>
            {CAMBIOS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Campo>
      </div>

      <div style={styles.grid2}>
        <Campo label="Portas">
          <select style={styles.select} value={dados.portas} onChange={e => onChange("portas", e.target.value)}>
            <option value="">Selecione...</option>
            {["2", "3", "4", "5"].map(p => <option key={p} value={p}>{p} portas</option>)}
          </select>
        </Campo>
        <Campo label="Placa (opcional)">
          <input style={styles.input} placeholder="ABC-1234 ou ABC1D23" value={dados.placa}
            onChange={e => onChange("placa", e.target.value.toUpperCase())} maxLength={8} />
        </Campo>
      </div>

      <div style={styles.grid2}>
        <Campo label="Preço Pedido (R$) *" erro={erros.preco}>
          <div style={styles.inputPrefix}>
            <span style={styles.prefix}>R$</span>
            <input style={{ ...styles.input, paddingLeft: "42px" }} placeholder="85.000" value={dados.preco}
              onChange={e => onChange("preco", formatarPreco(e.target.value))} />
          </div>
        </Campo>
        <Campo label="Valor FIPE (R$) — opcional">
          <div style={styles.inputPrefix}>
            <span style={styles.prefix}>R$</span>
            <input style={{ ...styles.input, paddingLeft: "42px" }} placeholder="82.000" value={dados.fipe}
              onChange={e => onChange("fipe", formatarPreco(e.target.value))} />
          </div>
        </Campo>
      </div>

      <div style={styles.checkboxGroup}>
        {[
          { field: "blindado" as const, label: "🛡️ Blindado" },
          { field: "financiamento" as const, label: "💳 Aceita Financiamento" },
          { field: "troca" as const, label: "🔄 Aceita Troca" },
        ].map(({ field, label }) => (
          <label key={field} style={styles.checkboxLabel}>
            <input type="checkbox" checked={dados[field] as boolean}
              onChange={e => onChange(field, e.target.checked)}
              style={styles.checkbox} />
            {label}
          </label>
        ))}
      </div>

      <Campo label="Descrição do Anúncio">
        <textarea style={{ ...styles.input, ...styles.textarea }}
          placeholder="Conte mais sobre o veículo: histórico, revisões, acessórios, motivo da venda..."
          value={dados.descricao}
          onChange={e => onChange("descricao", e.target.value)}
          maxLength={1000} />
        <span style={styles.charCount}>{dados.descricao.length}/1000</span>
      </Campo>

      <button style={styles.btnPrimary} onClick={() => { if (validar()) onNext() }}>
        Próximo: Fotos →
      </button>
    </div>
  )
}

// ─── Etapa 2: Fotos ───────────────────────────────────────────────────────────

function EtapaFotos({ fotos, onFotos, tipoConta, onNext, onBack }: {
  fotos: File[]
  onFotos: (f: File[]) => void
  tipoConta: "PF" | "PJ"
  onNext: () => void
  onBack: () => void
}) {
  const maxFotos = tipoConta === "PJ" ? 6 : 4
  const inputRef = useRef<HTMLInputElement>(null)
  const [erro, setErro] = useState("")
  const [previews, setPreviews] = useState<string[]>([])

  function handleFiles(files: FileList | null) {
    if (!files) return
    setErro("")
    const arr = Array.from(files)
    const validas: File[] = []
    for (const f of arr) {
      if (f.size > 2 * 1024 * 1024) {
        setErro(`"${f.name}" ultrapassa 2MB. Reduza o tamanho e tente novamente.`)
        continue
      }
      if (!f.type.startsWith("image/")) {
        setErro(`"${f.name}" não é uma imagem válida.`)
        continue
      }
      validas.push(f)
    }
    const novas = [...fotos, ...validas].slice(0, maxFotos)
    onFotos(novas)
    setPreviews(novas.map(f => URL.createObjectURL(f)))
  }

  function remover(idx: number) {
    const novas = fotos.filter((_, i) => i !== idx)
    onFotos(novas)
    setPreviews(novas.map(f => URL.createObjectURL(f)))
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>📷 Fotos do Veículo</h2>
      <p style={styles.cardSubtitle}>
        Anúncios com fotos vendem até 3x mais rápido. Máximo de <strong>{maxFotos} fotos</strong> (máx. 2MB cada).
      </p>

      <div style={styles.fotoGrid}>
        {previews.map((src, i) => (
          <div key={i} style={styles.fotoItem}>
            <img src={src} alt={`Foto ${i + 1}`} style={styles.fotoImg} />
            {i === 0 && <span style={styles.fotoCapa}>CAPA</span>}
            <button style={styles.fotoRemove} onClick={() => remover(i)}>✕</button>
          </div>
        ))}
        {fotos.length < maxFotos && (
          <button style={styles.fotoAdd} onClick={() => inputRef.current?.click()}>
            <span style={{ fontSize: "2rem" }}>+</span>
            <span style={{ fontSize: "0.8rem", color: "#888" }}>Adicionar foto</span>
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }}
        onChange={e => handleFiles(e.target.files)} />

      {erro && <div style={styles.erroBox}>{erro}</div>}

      <div style={styles.dica}>
        💡 <strong>Dica:</strong> A primeira foto será a capa do anúncio. Use fotos bem iluminadas e de frente, lateral e interior.
      </div>

      <div style={styles.btnRow}>
        <button style={styles.btnSecondary} onClick={onBack}>← Voltar</button>
        <button style={styles.btnPrimary} onClick={onNext}>
          Próximo: Contato →
        </button>
      </div>
    </div>
  )
}

// ─── Etapa 3: Dados de Contato ────────────────────────────────────────────────

function EtapaContato({ dados, onChange, onNext, onBack }: {
  dados: DadosContato
  onChange: (field: keyof DadosContato, value: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const [erros, setErros] = useState<Partial<Record<keyof DadosContato, string>>>({})
  const tipoDoc = detectarTipoDoc(dados.documento)

  function validar() {
    const e: Partial<Record<keyof DadosContato, string>> = {}
    if (!dados.nome.trim()) e.nome = "Informe seu nome"
    if (!dados.email.includes("@")) e.email = "E-mail inválido"
    const tel = dados.whatsapp.replace(/\D/g, "")
    if (tel.length < 10) e.whatsapp = "WhatsApp inválido"
    const doc = dados.documento.replace(/\D/g, "")
    if (doc.length !== 11 && doc.length !== 14) e.documento = "CPF (11 dígitos) ou CNPJ (14 dígitos)"
    if (!CIDADES_COBERTURA.includes(dados.cidade)) e.cidade = `Atendemos apenas: ${CIDADES_COBERTURA.join(", ")}`
    if (!dados.estado) e.estado = "Selecione o estado"
    setErros(e)
    return Object.keys(e).length === 0
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>👤 Seus Dados de Contato</h2>
      <p style={styles.cardSubtitle}>
        Suas informações são protegidas. O número de WhatsApp nunca será exibido publicamente — só via botão de contato.
      </p>

      <Campo label="Nome / Razão Social *" erro={erros.nome}>
        <input style={styles.input} placeholder="Seu nome ou razão social" value={dados.nome}
          onChange={e => onChange("nome", e.target.value)} />
      </Campo>

      <div style={styles.grid2}>
        <Campo label="E-mail *" erro={erros.email}>
          <input style={styles.input} type="email" placeholder="seu@email.com" value={dados.email}
            onChange={e => onChange("email", e.target.value)} />
        </Campo>
        <Campo label="WhatsApp *" erro={erros.whatsapp}>
          <input style={styles.input} placeholder="(11) 99999-9999" value={dados.whatsapp}
            onChange={e => onChange("whatsapp", formatarWhatsApp(e.target.value))} />
        </Campo>
      </div>

      <Campo label={`${tipoDoc} *`} erro={erros.documento}>
        <input style={styles.input} placeholder="CPF ou CNPJ" value={dados.documento}
          onChange={e => onChange("documento", formatarDocumento(e.target.value))} />
        <span style={styles.docTipo}>
          {tipoDoc === "CPF" ? "👤 Pessoa Física — até 2 anúncios ativos" : "🏢 Pessoa Jurídica — até 6 anúncios ativos"}
        </span>
      </Campo>

      <div style={styles.grid2}>
        <Campo label="Cidade *" erro={erros.cidade}>
          <select style={styles.select} value={dados.cidade} onChange={e => onChange("cidade", e.target.value)}>
            <option value="">Selecione sua cidade...</option>
            {CIDADES_COBERTURA.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Campo>
        <Campo label="Estado *" erro={erros.estado}>
          <select style={styles.select} value={dados.estado} onChange={e => onChange("estado", e.target.value)}>
            <option value="">UF</option>
            {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Campo>
      </div>

      <div style={styles.avisoCobertura}>
        📍 <strong>Cobertura regional:</strong> Itu · Salto · Indaiatuba · Sorocaba · Porto Feliz
      </div>

      <div style={styles.btnRow}>
        <button style={styles.btnSecondary} onClick={onBack}>← Voltar</button>
        <button style={styles.btnPrimary} onClick={() => { if (validar()) onNext() }}>
          Próximo: Publicar →
        </button>
      </div>
    </div>
  )
}

// ─── Etapa 4: Revisão e Publicação ───────────────────────────────────────────

function EtapaPublicar({ veiculo, contato, fotos, onBack, onPublicar, publicando, publicado }: {
  veiculo: DadosVeiculo
  contato: DadosContato
  fotos: File[]
  onBack: () => void
  onPublicar: () => void
  publicando: boolean
  publicado: boolean
}) {
  const { isSignedIn } = useUser()
  const tipoDoc = detectarTipoDoc(contato.documento)
  const maxFotos = tipoDoc === "CNPJ" ? 6 : 4
  const maxAnuncios = tipoDoc === "CNPJ" ? 6 : 2

  if (publicado) {
    return (
      <div style={{ ...styles.card, textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
        <h2 style={{ ...styles.cardTitle, color: "var(--accent2)" }}>Anúncio Publicado!</h2>
        <p style={{ color: "#aaa", marginBottom: "1.5rem" }}>
          Seu veículo está no ar. Compradores da região já podem encontrar seu anúncio.
          Ele ficará ativo por <strong>60 dias</strong> — após isso, basta renovar pelo painel.
        </p>
        <div style={styles.wppPreview}>
          <span style={{ fontSize: "1.2rem" }}>📱</span>
          <div>
            <strong>Mensagem automática para interessados:</strong>
            <p style={{ margin: "4px 0 0", color: "#aaa", fontSize: "0.9rem" }}>
              "Olá! Vi seu anúncio do {veiculo.marca} {veiculo.modelo} {veiculo.anoMod} no VibeCarros. Ele ainda está disponível?"
            </p>
          </div>
        </div>
        <a href="/" style={{ ...styles.btnPrimary, display: "inline-block", textDecoration: "none", marginTop: "1.5rem" }}>
          Ver meu anúncio →
        </a>
      </div>
    )
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>🚀 Revisar e Publicar</h2>
      <p style={styles.cardSubtitle}>Confira as informações antes de publicar. Após publicado, você pode editar a qualquer momento.</p>

      {/* Resumo */}
      <div style={styles.resumoGrid}>
        <div style={styles.resumoItem}>
          <span style={styles.resumoLabel}>Veículo</span>
          <span style={styles.resumoValor}>{veiculo.marca} {veiculo.modelo} {veiculo.versao}</span>
        </div>
        <div style={styles.resumoItem}>
          <span style={styles.resumoLabel}>Ano</span>
          <span style={styles.resumoValor}>{veiculo.anoFab}/{veiculo.anoMod}</span>
        </div>
        <div style={styles.resumoItem}>
          <span style={styles.resumoLabel}>KM</span>
          <span style={styles.resumoValor}>{veiculo.km} km</span>
        </div>
        <div style={styles.resumoItem}>
          <span style={styles.resumoLabel}>Preço</span>
          <span style={{ ...styles.resumoValor, color: "var(--accent2)", fontWeight: 700 }}>R$ {veiculo.preco}</span>
        </div>
        <div style={styles.resumoItem}>
          <span style={styles.resumoLabel}>Fotos</span>
          <span style={styles.resumoValor}>{fotos.length}/{maxFotos}</span>
        </div>
        <div style={styles.resumoItem}>
          <span style={styles.resumoLabel}>Cidade</span>
          <span style={styles.resumoValor}>{contato.cidade} - {contato.estado}</span>
        </div>
        <div style={styles.resumoItem}>
          <span style={styles.resumoLabel}>Anunciante</span>
          <span style={styles.resumoValor}>{contato.nome} ({tipoDoc})</span>
        </div>
        <div style={styles.resumoItem}>
          <span style={styles.resumoLabel}>Validade</span>
          <span style={styles.resumoValor}>60 dias</span>
        </div>
      </div>

      <div style={styles.regraBox}>
        <strong>📋 Seu plano ({tipoDoc === "CNPJ" ? "Loja/PJ" : "Pessoa Física"}):</strong>
        <ul style={{ margin: "8px 0 0", paddingLeft: "1.2rem", color: "#aaa" }}>
          <li>Máximo de <strong>{maxAnuncios} anúncios ativos</strong> simultâneos</li>
          <li>Máximo de <strong>{maxFotos} fotos</strong> por veículo</li>
          <li>Anúncio válido por <strong>60 dias</strong>, renovável pelo painel</li>
          <li>Contato exclusivo via <strong>botão WhatsApp</strong> (número protegido)</li>
        </ul>
      </div>

      {!isSignedIn ? (
        <div style={styles.loginBox}>
          <p style={{ margin: "0 0 1rem", color: "#ccc" }}>
            🔐 Para publicar, faça login ou crie sua conta gratuitamente. Seus dados já estão salvos!
          </p>
          <SignInButton mode="modal">
            <button style={styles.btnPrimary}>Entrar / Criar Conta para Publicar</button>
          </SignInButton>
        </div>
      ) : (
        <div style={styles.btnRow}>
          <button style={styles.btnSecondary} onClick={onBack} disabled={publicando}>← Voltar</button>
          <button style={{ ...styles.btnPrimary, opacity: publicando ? 0.7 : 1 }}
            onClick={onPublicar} disabled={publicando}>
            {publicando ? "⏳ Publicando..." : "✅ Publicar Anúncio Grátis"}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Campo helper ─────────────────────────────────────────────────────────────

function Campo({ label, erro, children }: { label: string; erro?: string; children: React.ReactNode }) {
  return (
    <div style={styles.campo}>
      <label style={styles.label}>{label}</label>
      {children}
      {erro && <span style={styles.erro}>{erro}</span>}
    </div>
  )
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export default function AnunciarPage() {
  const [etapa, setEtapa] = useState<Etapa>("veiculo")
  const [publicando, setPublicando] = useState(false)
  const [publicado, setPublicado] = useState(false)

  const [veiculo, setVeiculo] = useState<DadosVeiculo>({
    categoria: "", marca: "", modelo: "", versao: "", anoFab: "", anoMod: "",
    km: "", combustivel: "", cambio: "", cor: "", portas: "", blindado: false,
    financiamento: true, troca: false, preco: "", fipe: "", placa: "", descricao: "",
  })

  const [fotos, setFotos] = useState<File[]>([])

  const [contato, setContato] = useState<DadosContato>({
    nome: "", email: "", whatsapp: "", documento: "", cidade: "", estado: "SP",
  })

  function changeVeiculo(field: keyof DadosVeiculo, value: string | boolean) {
    setVeiculo(prev => ({ ...prev, [field]: value }))
  }

  function changeContato(field: keyof DadosContato, value: string) {
    setContato(prev => ({ ...prev, [field]: value }))
  }

  async function publicar() {
    setPublicando(true)
    try {
      const form = new FormData()
      form.append("veiculo", JSON.stringify(veiculo))
      form.append("contato", JSON.stringify(contato))
      fotos.forEach(f => form.append("fotos", f))

      const res = await fetch("/api/anuncios", { method: "POST", body: form })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Erro ao publicar. Tente novamente.")
        return
      }
      setPublicado(true)
    } catch {
      alert("Erro de conexão. Verifique sua internet e tente novamente.")
    } finally {
      setPublicando(false)
    }
  }

  return (
    <>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.titulo}>Anunciar Grátis</h1>
            <p style={styles.subtitulo}>
              Venda seu veículo para compradores de Itu, Salto, Indaiatuba e região. Rápido, grátis e sem intermediários.
            </p>
          </div>

          <BarraProgresso etapaAtual={etapa} />

          {etapa === "veiculo" && (
            <EtapaVeiculo dados={veiculo} onChange={changeVeiculo} onNext={() => setEtapa("fotos")} />
          )}
          {etapa === "fotos" && (
            <EtapaFotos
              fotos={fotos}
              onFotos={setFotos}
              tipoConta={detectarTipoDoc(contato.documento) === "CNPJ" ? "PJ" : "PF"}
              onNext={() => setEtapa("contato")}
              onBack={() => setEtapa("veiculo")}
            />
          )}
          {etapa === "contato" && (
            <EtapaContato dados={contato} onChange={changeContato}
              onNext={() => setEtapa("publicar")} onBack={() => setEtapa("fotos")} />
          )}
          {etapa === "publicar" && (
            <EtapaPublicar
              veiculo={veiculo} contato={contato} fotos={fotos}
              onBack={() => setEtapa("contato")}
              onPublicar={publicar}
              publicando={publicando}
              publicado={publicado}
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    background: "var(--bg, #0f0f0f)",
    paddingTop: "80px",
    paddingBottom: "60px",
  },
  container: {
    maxWidth: "760px",
    margin: "0 auto",
    padding: "0 20px",
  },
  header: {
    textAlign: "center",
    marginBottom: "2.5rem",
  },
  titulo: {
    fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
    fontWeight: 800,
    color: "var(--fg, #fff)",
    margin: "0 0 0.5rem",
  },
  subtitulo: {
    color: "#888",
    fontSize: "1rem",
    margin: 0,
  },
  progressWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0",
    marginBottom: "2.5rem",
  },
  progressItem: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    position: "relative" as const,
    gap: "6px",
  },
  progressCircle: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    transition: "all 0.3s ease",
    cursor: "default",
    zIndex: 1,
  },
  progressLabel: {
    fontSize: "0.72rem",
    letterSpacing: "0.03em",
    textTransform: "uppercase" as const,
  },
  progressLine: {
    position: "absolute" as const,
    top: "24px",
    left: "48px",
    width: "80px",
    height: "2px",
    zIndex: 0,
  },
  card: {
    background: "var(--card-bg, #1a1a1a)",
    border: "1px solid #2a2a2a",
    borderRadius: "16px",
    padding: "clamp(1.2rem, 4vw, 2rem)",
    marginBottom: "1.5rem",
  },
  cardTitle: {
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "var(--fg, #fff)",
    margin: "0 0 0.4rem",
  },
  cardSubtitle: {
    color: "#777",
    fontSize: "0.9rem",
    margin: "0 0 1.8rem",
    lineHeight: 1.5,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "1rem",
  },
  campo: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
    marginBottom: "1rem",
  },
  label: {
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#aaa",
    letterSpacing: "0.03em",
    textTransform: "uppercase" as const,
  },
  input: {
    background: "#111",
    border: "1px solid #333",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "0.95rem",
    padding: "10px 14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s",
  },
  select: {
    background: "#111",
    border: "1px solid #333",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "0.95rem",
    padding: "10px 14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
    cursor: "pointer",
  },
  textarea: {
    minHeight: "100px",
    resize: "vertical" as const,
  },
  charCount: {
    fontSize: "0.75rem",
    color: "#555",
    textAlign: "right" as const,
  },
  inputPrefix: {
    position: "relative" as const,
  },
  prefix: {
    position: "absolute" as const,
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#666",
    fontSize: "0.9rem",
    pointerEvents: "none" as const,
  },
  erro: {
    fontSize: "0.78rem",
    color: "#ff5555",
  },
  erroBox: {
    background: "#2a1111",
    border: "1px solid #ff5555",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#ff5555",
    fontSize: "0.85rem",
    marginBottom: "1rem",
  },
  checkboxGroup: {
    display: "flex",
    gap: "1.5rem",
    flexWrap: "wrap" as const,
    marginBottom: "1.2rem",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#ccc",
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
    accentColor: "var(--accent2, #f5a623)",
  },
  btnPrimary: {
    background: "var(--accent2, #f5a623)",
    color: "#000",
    border: "none",
    borderRadius: "10px",
    padding: "14px 28px",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "opacity 0.2s",
    width: "100%",
  },
  btnSecondary: {
    background: "transparent",
    color: "#aaa",
    border: "1px solid #333",
    borderRadius: "10px",
    padding: "14px 28px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  btnRow: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem",
  },
  fotoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
    gap: "12px",
    marginBottom: "1.2rem",
  },
  fotoItem: {
    position: "relative" as const,
    borderRadius: "10px",
    overflow: "hidden",
    aspectRatio: "4/3",
    background: "#111",
  },
  fotoImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },
  fotoCapa: {
    position: "absolute" as const,
    bottom: "6px",
    left: "6px",
    background: "var(--accent2, #f5a623)",
    color: "#000",
    fontSize: "0.65rem",
    fontWeight: 700,
    padding: "2px 6px",
    borderRadius: "4px",
  },
  fotoRemove: {
    position: "absolute" as const,
    top: "6px",
    right: "6px",
    background: "rgba(0,0,0,0.7)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    cursor: "pointer",
    fontSize: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  fotoAdd: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    background: "#111",
    border: "2px dashed #333",
    borderRadius: "10px",
    aspectRatio: "4/3",
    cursor: "pointer",
    color: "#555",
    transition: "border-color 0.2s",
  },
  dica: {
    background: "#1a1a00",
    border: "1px solid #444400",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#aaa",
    fontSize: "0.85rem",
    marginBottom: "1.2rem",
    lineHeight: 1.5,
  },
  avisoCobertura: {
    background: "#001a1a",
    border: "1px solid #004444",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#aaa",
    fontSize: "0.85rem",
    marginBottom: "1.2rem",
  },
  docTipo: {
    fontSize: "0.78rem",
    color: "var(--accent2, #f5a623)",
  },
  resumoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1px",
    background: "#222",
    border: "1px solid #222",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "1.5rem",
  },
  resumoItem: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
    padding: "12px 16px",
    background: "#111",
  },
  resumoLabel: {
    fontSize: "0.72rem",
    color: "#555",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
  resumoValor: {
    fontSize: "0.95rem",
    color: "#fff",
    fontWeight: 600,
  },
  regraBox: {
    background: "#0f1a0f",
    border: "1px solid #1a3a1a",
    borderRadius: "8px",
    padding: "14px 16px",
    color: "#ccc",
    fontSize: "0.88rem",
    marginBottom: "1.5rem",
    lineHeight: 1.6,
  },
  loginBox: {
    background: "#111",
    border: "1px solid #333",
    borderRadius: "10px",
    padding: "1.5rem",
    textAlign: "center" as const,
  },
  wppPreview: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    background: "#0a1f0a",
    border: "1px solid #1a3a1a",
    borderRadius: "10px",
    padding: "14px 16px",
    marginTop: "1.5rem",
    textAlign: "left" as const,
    color: "#ccc",
    fontSize: "0.88rem",
  },
}
