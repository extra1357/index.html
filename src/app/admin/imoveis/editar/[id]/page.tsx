'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Proprietario {
  id: string
  nome: string
  email: string
}

interface Venda {
  id: string
  status: string
  valorVenda: number
  dataPropostaInicial: string
  lead: { nome: string }
  corretor: { nome: string }
}

interface Imovel {
  id: string
  tipo: string
  endereco: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  preco: number
  precoAluguel: number | null
  metragem: number
  quartos: number
  banheiros: number
  suites: number
  vagas: number
  descricao: string
  status: string
  disponivel: boolean
  finalidade: string
  destaque: boolean
  imagens: string[]
  caracteristicas: string[]
  codigo: string
  slug: string
  proprietarioId: string
  proprietario: Proprietario
  vendas: Venda[]
}

const STATUS_OPTIONS = ['ATIVO', 'INATIVO', 'VENDIDO', 'ALUGADO', 'EM_NEGOCIACAO', 'TEMPORARIAMENTE_INDISPONIVEL']
const TIPO_OPTIONS = ['Casa', 'Apartamento', 'Terreno', 'Comercial', 'Sobrado', 'Cobertura', 'Sala', 'Galpão']
const FINALIDADE_OPTIONS = ['venda', 'aluguel', 'venda_aluguel']
const ESTADOS_BR = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const CARACTERISTICAS_PADRAO = [
  'Piscina', 'Churrasqueira', 'Academia', 'Salão de Festas', 'Playground',
  'Portaria 24h', 'Câmeras de Segurança', 'Elevador', 'Varanda', 'Área Gourmet',
  'Jardim', 'Lavanderia', 'Escritório', 'Closet', 'Copa', 'Despensa',
  'Aquecimento Solar', 'Ar Condicionado', 'Mobiliado', 'Semi-mobiliado'
]

// Status que tornam o imóvel indisponível no site
const STATUS_INDISPONIVEL = ['VENDIDO', 'ALUGADO', 'INATIVO']
const STATUS_NEGOCIACAO = ['EM_NEGOCIACAO', 'TEMPORARIAMENTE_INDISPONIVEL']

export default function EditarImovel() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [imovel, setImovel] = useState<Imovel | null>(null)
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [abaAtiva, setAbaAtiva] = useState<'dados' | 'imagens' | 'vendas' | 'status'>('dados')
  const [novaImagem, setNovaImagem] = useState('')
  const [novaCaracteristica, setNovaCaracteristica] = useState('')

  const [form, setForm] = useState({
    tipo: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: 'SP',
    cep: '',
    preco: '',
    precoAluguel: '',
    metragem: '',
    quartos: '0',
    banheiros: '0',
    suites: '0',
    vagas: '0',
    descricao: '',
    status: 'ATIVO',
    disponivel: true,
    finalidade: 'venda',
    destaque: false,
    proprietarioId: '',
    imagens: [] as string[],
    caracteristicas: [] as string[],
    codigo: '',
    slug: '',
  })

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetch(`/api/imoveis/${id}`).then(r => r.json()),
      fetch('/api/proprietarios').then(r => r.json()),
    ]).then(([imovelData, propData]) => {
      const imv = imovelData
      setImovel(imv)
      setProprietarios(Array.isArray(propData) ? propData : propData.data || [])
      setForm({
        tipo: imv.tipo || '',
        endereco: imv.endereco || '',
        bairro: imv.bairro || '',
        cidade: imv.cidade || '',
        estado: imv.estado || 'SP',
        cep: imv.cep || '',
        preco: String(imv.preco || ''),
        precoAluguel: String(imv.precoAluguel || ''),
        metragem: String(imv.metragem || ''),
        quartos: String(imv.quartos || 0),
        banheiros: String(imv.banheiros || 0),
        suites: String(imv.suites || 0),
        vagas: String(imv.vagas || 0),
        descricao: imv.descricao || '',
        status: imv.status || 'ATIVO',
        disponivel: imv.disponivel,
        finalidade: imv.finalidade || 'venda',
        destaque: imv.destaque || false,
        proprietarioId: imv.proprietarioId || '',
        imagens: imv.imagens || [],
        caracteristicas: imv.caracteristicas || [],
        codigo: imv.codigo || '',
        slug: imv.slug || '',
      })
      setLoading(false)
    }).catch(() => {
      setErro('Erro ao carregar imóvel')
      setLoading(false)
    })
  }, [id])

  // Sincroniza disponivel automaticamente com status
  useEffect(() => {
    if (STATUS_INDISPONIVEL.includes(form.status)) {
      setForm(f => ({ ...f, disponivel: false }))
    } else if (form.status === 'ATIVO') {
      setForm(f => ({ ...f, disponivel: true }))
    }
    // EM_NEGOCIACAO e TEMPORARIAMENTE_INDISPONIVEL mantém disponivel false para mostrar marca d'água
    if (STATUS_NEGOCIACAO.includes(form.status)) {
      setForm(f => ({ ...f, disponivel: false }))
    }
  }, [form.status])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleExcluir = async () => {
    if (!confirm(`Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.`)) return;
    try {
      const res = await fetch(`/api/imoveis/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir');
      router.push('/admin/imoveis');
    } catch (err) {
      setErro('Erro ao excluir imóvel. Tente novamente.');
    }
  };

  const handleSalvar = async () => {
    setSaving(true)
    setErro('')
    setSucesso('')
    try {
      const res = await fetch(`/api/imoveis/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          preco: parseFloat(form.preco),
          precoAluguel: form.precoAluguel ? parseFloat(form.precoAluguel) : null,
          metragem: parseFloat(form.metragem),
          quartos: parseInt(form.quartos),
          banheiros: parseInt(form.banheiros),
          suites: parseInt(form.suites),
          vagas: parseInt(form.vagas),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar')
      setSucesso('✅ Imóvel atualizado com sucesso!')
      setImovel(data)
      setTimeout(() => setSucesso(''), 4000)
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setSaving(false)
    }
  }

  const adicionarImagem = () => {
    if (!novaImagem.trim()) return
    setForm(f => ({ ...f, imagens: [...f.imagens, novaImagem.trim()] }))
    setNovaImagem('')
  }

  const removerImagem = (idx: number) => {
    setForm(f => ({ ...f, imagens: f.imagens.filter((_, i) => i !== idx) }))
  }

  const toggleCaracteristica = (c: string) => {
    setForm(f => ({
      ...f,
      caracteristicas: f.caracteristicas.includes(c)
        ? f.caracteristicas.filter(x => x !== c)
        : [...f.caracteristicas, c]
    }))
  }

  const adicionarCaracteristicaCustom = () => {
    if (!novaCaracteristica.trim()) return
    if (!form.caracteristicas.includes(novaCaracteristica.trim())) {
      setForm(f => ({ ...f, caracteristicas: [...f.caracteristicas, novaCaracteristica.trim()] }))
    }
    setNovaCaracteristica('')
  }

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      ATIVO: '#16a34a',
      INATIVO: '#6b7280',
      VENDIDO: '#dc2626',
      ALUGADO: '#ea580c',
      EM_NEGOCIACAO: '#d97706',
      TEMPORARIAMENTE_INDISPONIVEL: '#9333ea',
    }
    return map[status] || '#6b7280'
  }

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      ATIVO: 'Ativo',
      INATIVO: 'Inativo',
      VENDIDO: 'Vendido',
      ALUGADO: 'Alugado',
      EM_NEGOCIACAO: 'Em Negociação',
      TEMPORARIAMENTE_INDISPONIVEL: 'Temporariamente Indisponível',
    }
    return map[status] || status
  }

  if (loading) return (
    <div style={styles.loading}>
      <div style={styles.spinner} />
      <p>Carregando imóvel...</p>
    </div>
  )

  if (!imovel && !loading) return (
    <div style={styles.loading}>
      <p style={{ color: '#dc2626' }}>Imóvel não encontrado.</p>
      <Link href="/admin/imoveis" style={styles.btnSecundario}>← Voltar</Link>
    </div>
  )

  return (
    <div style={styles.wrapper}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <Link href="/admin/imoveis" style={styles.back}>← Imóveis</Link>
          <h1 style={styles.titulo}>Editar Imóvel</h1>
          <p style={styles.subtitulo}>
            {form.tipo} • {form.cidade}/{form.estado}
            {form.codigo && <span style={styles.codigo}> #{form.codigo}</span>}
          </p>
        </div>
        <div style={styles.headerActions}>
          {/* Badge de status */}
          <span style={{ ...styles.badge, background: getStatusColor(form.status) }}>
            {getStatusLabel(form.status)}
          </span>
          {/* Badge disponível */}
          <span style={{ ...styles.badge, background: form.disponivel ? '#16a34a' : '#dc2626' }}>
            {form.disponivel ? '🟢 Visível no Site' : '🔴 Oculto do Site'}
          </span>
          <button onClick={handleSalvar} disabled={saving} style={styles.btnSalvar}>
            {saving ? 'Salvando...' : '💾 Salvar Alterações'}
          </button>
        </div>
      </div>

      {/* ALERTAS */}
      {erro && <div style={styles.alertErro}>❌ {erro}</div>}
      {sucesso && <div style={styles.alertSucesso}>{sucesso}</div>}

      {/* AVISO DE STATUS ESPECIAL */}
      {STATUS_NEGOCIACAO.includes(form.status) && (
        <div style={styles.alertWarning}>
          ⚠️ Imóvel com status <strong>{getStatusLabel(form.status)}</strong> — aparece no site com marca d'água. Para remover completamente, mude para <strong>Inativo</strong>.
        </div>
      )}
      {STATUS_INDISPONIVEL.includes(form.status) && form.status !== 'ATIVO' && (
        <div style={{ ...styles.alertWarning, background: '#fee2e2', borderColor: '#fca5a5', color: '#991b1b' }}>
          🚫 Imóvel <strong>{getStatusLabel(form.status)}</strong> — não aparece no site.
        </div>
      )}

      {/* ABAS */}
      <div style={styles.abas}>
        {(['dados', 'imagens', 'vendas', 'status'] as const).map(aba => (
          <button
            key={aba}
            onClick={() => setAbaAtiva(aba)}
            style={{ ...styles.aba, ...(abaAtiva === aba ? styles.abaAtiva : {}) }}
          >
            {aba === 'dados' && '📋 Dados'}
            {aba === 'imagens' && `🖼️ Imagens (${form.imagens.length})`}
            {aba === 'vendas' && `💰 Vendas (${imovel?.vendas?.length || 0})`}
            {aba === 'status' && '⚙️ Status & Visibilidade'}
          </button>
        ))}
      </div>

      <div style={styles.conteudo}>

        {/* ABA DADOS */}
        {abaAtiva === 'dados' && (
          <div style={styles.grid2}>
            {/* Coluna esquerda */}
            <div style={styles.card}>
              <h2 style={styles.cardTitulo}>📍 Informações Principais</h2>

              <div style={styles.campo}>
                <label style={styles.label}>Tipo de Imóvel *</label>
                <select name="tipo" value={form.tipo} onChange={handleChange} style={styles.select}>
                  {TIPO_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div style={styles.campo}>
                <label style={styles.label}>Finalidade *</label>
                <select name="finalidade" value={form.finalidade} onChange={handleChange} style={styles.select}>
                  <option value="venda">Venda</option>
                  <option value="aluguel">Aluguel</option>
                  <option value="venda_aluguel">Venda e Aluguel</option>
                </select>
              </div>

              <div style={styles.campo}>
                <label style={styles.label}>Proprietário *</label>
                <select name="proprietarioId" value={form.proprietarioId} onChange={handleChange} style={styles.select}>
                  <option value="">Selecione...</option>
                  {proprietarios.map(p => (
                    <option key={p.id} value={p.id}>{p.nome} — {p.email}</option>
                  ))}
                </select>
              </div>

              <div style={styles.gridDois}>
                <div style={styles.campo}>
                  <label style={styles.label}>Preço de Venda (R$) *</label>
                  <input name="preco" type="number" value={form.preco} onChange={handleChange} style={styles.input} placeholder="350000" />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Preço de Aluguel (R$)</label>
                  <input name="precoAluguel" type="number" value={form.precoAluguel} onChange={handleChange} style={styles.input} placeholder="2500" />
                </div>
              </div>

              <div style={styles.campo}>
                <label style={styles.label}>Descrição</label>
                <textarea name="descricao" value={form.descricao} onChange={handleChange} style={{ ...styles.input, height: 100, resize: 'vertical' }} placeholder="Descreva o imóvel..." />
              </div>

              <div style={styles.gridDois}>
                <div style={styles.campo}>
                  <label style={styles.label}>Código</label>
                  <input name="codigo" value={form.codigo} onChange={handleChange} style={styles.input} placeholder="IMV-001" />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Slug (URL)</label>
                  <input name="slug" value={form.slug} onChange={handleChange} style={styles.input} placeholder="casa-itu-sp" />
                </div>
              </div>

              <div style={styles.checkboxRow}>
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" name="destaque" checked={form.destaque} onChange={handleChange} />
                  <span>⭐ Imóvel em Destaque</span>
                </label>
              </div>
            </div>

            {/* Coluna direita */}
            <div>
              <div style={styles.card}>
                <h2 style={styles.cardTitulo}>🏠 Endereço</h2>
                <div style={styles.campo}>
                  <label style={styles.label}>Endereço *</label>
                  <input name="endereco" value={form.endereco} onChange={handleChange} style={styles.input} placeholder="Rua das Flores, 123" />
                </div>
                <div style={styles.gridDois}>
                  <div style={styles.campo}>
                    <label style={styles.label}>Bairro</label>
                    <input name="bairro" value={form.bairro} onChange={handleChange} style={styles.input} placeholder="Centro" />
                  </div>
                  <div style={styles.campo}>
                    <label style={styles.label}>CEP</label>
                    <input name="cep" value={form.cep} onChange={handleChange} style={styles.input} placeholder="13300-000" />
                  </div>
                </div>
                <div style={styles.gridDois}>
                  <div style={styles.campo}>
                    <label style={styles.label}>Cidade *</label>
                    <input name="cidade" value={form.cidade} onChange={handleChange} style={styles.input} placeholder="Itu" />
                  </div>
                  <div style={styles.campo}>
                    <label style={styles.label}>Estado *</label>
                    <select name="estado" value={form.estado} onChange={handleChange} style={styles.select}>
                      {ESTADOS_BR.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ ...styles.card, marginTop: 16 }}>
                <h2 style={styles.cardTitulo}>📐 Características</h2>
                <div style={styles.grid4}>
                  <div style={styles.campo}>
                    <label style={styles.label}>Metragem (m²)</label>
                    <input name="metragem" type="number" value={form.metragem} onChange={handleChange} style={styles.input} />
                  </div>
                  <div style={styles.campo}>
                    <label style={styles.label}>Quartos</label>
                    <input name="quartos" type="number" min="0" value={form.quartos} onChange={handleChange} style={styles.input} />
                  </div>
                  <div style={styles.campo}>
                    <label style={styles.label}>Banheiros</label>
                    <input name="banheiros" type="number" min="0" value={form.banheiros} onChange={handleChange} style={styles.input} />
                  </div>
                  <div style={styles.campo}>
                    <label style={styles.label}>Suítes</label>
                    <input name="suites" type="number" min="0" value={form.suites} onChange={handleChange} style={styles.input} />
                  </div>
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Vagas de Garagem</label>
                  <input name="vagas" type="number" min="0" value={form.vagas} onChange={handleChange} style={styles.input} />
                </div>
              </div>

              <div style={{ ...styles.card, marginTop: 16 }}>
                <h2 style={styles.cardTitulo}>✅ Comodidades</h2>
                <div style={styles.tagsGrid}>
                  {CARACTERISTICAS_PADRAO.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCaracteristica(c)}
                      style={{
                        ...styles.tagBtn,
                        ...(form.caracteristicas.includes(c) ? styles.tagBtnAtivo : {})
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <input
                    value={novaCaracteristica}
                    onChange={e => setNovaCaracteristica(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && adicionarCaracteristicaCustom()}
                    placeholder="Adicionar personalizado..."
                    style={{ ...styles.input, flex: 1 }}
                  />
                  <button onClick={adicionarCaracteristicaCustom} style={styles.btnAdd}>+</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA IMAGENS */}
        {abaAtiva === 'imagens' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitulo}>🖼️ Imagens do Imóvel</h2>
            <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>
              Adicione URLs das imagens. A primeira imagem será usada como capa.
            </p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input
                value={novaImagem}
                onChange={e => setNovaImagem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && adicionarImagem()}
                placeholder="https://exemplo.com/imagem.jpg"
                style={{ ...styles.input, flex: 1 }}
              />
              <button onClick={adicionarImagem} style={styles.btnAdd}>Adicionar</button>
            </div>

            {form.imagens.length === 0 ? (
              <div style={styles.vazio}>📷 Nenhuma imagem adicionada</div>
            ) : (
              <div style={styles.imagensGrid}>
                {form.imagens.map((url, idx) => (
                  <div key={idx} style={styles.imagemItem}>
                    <div style={styles.imagemWrapper}>
                      <img src={url} alt={`Imagem ${idx + 1}`} style={styles.imagemPreview}
                        onError={e => { (e.target as HTMLImageElement).src = '/placeholder.jpg' }}
                      />
                      {idx === 0 && <span style={styles.capaTag}>CAPA</span>}
                    </div>
                    <div style={styles.imagemAcoes}>
                      <span style={{ fontSize: 11, color: '#9ca3af', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {url}
                      </span>
                      <button onClick={() => removerImagem(idx)} style={styles.btnRemover}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA VENDAS */}
        {abaAtiva === 'vendas' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitulo}>💰 Histórico de Vendas / Negociações</h2>

            {!imovel?.vendas || imovel.vendas.length === 0 ? (
              <div style={styles.vazio}>
                <p>Nenhuma venda registrada para este imóvel.</p>
                <Link href="/admin/vendas/nova" style={styles.btnSalvar}>
                  + Registrar Venda
                </Link>
              </div>
            ) : (
              <div>
                {imovel.vendas.map(venda => (
                  <div key={venda.id} style={styles.vendaItem}>
                    <div style={styles.vendaHeader}>
                      <span style={{
                        ...styles.badge,
                        background: venda.status === 'concluida' ? '#16a34a' :
                          venda.status === 'proposta' ? '#d97706' : '#6b7280'
                      }}>
                        {venda.status.toUpperCase()}
                      </span>
                      <span style={styles.vendaValor}>
                        R$ {Number(venda.valorVenda).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div style={styles.vendaInfo}>
                      <span>👤 Comprador: {venda.lead?.nome || '—'}</span>
                      <span>🏢 Corretor: {venda.corretor?.nome || '—'}</span>
                      <span>📅 {new Date(venda.dataPropostaInicial).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 16 }}>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>
                    💡 Quando uma venda é concluída, altere o status do imóvel para <strong>Vendido</strong> na aba <strong>Status & Visibilidade</strong> para removê-lo do site.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABA STATUS */}
        {abaAtiva === 'status' && (
          <div style={styles.grid2}>
            <div style={styles.card}>
              <h2 style={styles.cardTitulo}>⚙️ Status do Imóvel</h2>
              <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 20 }}>
                O status controla automaticamente a visibilidade no site.
              </p>

              <div style={styles.statusGrid}>
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, status: s }))}
                    style={{
                      ...styles.statusBtn,
                      borderColor: form.status === s ? getStatusColor(s) : '#e5e7eb',
                      background: form.status === s ? getStatusColor(s) + '15' : '#fff',
                    }}
                  >
                    <span style={{ ...styles.statusDot, background: getStatusColor(s) }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{getStatusLabel(s)}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                        {s === 'ATIVO' && 'Aparece no site normalmente'}
                        {s === 'EM_NEGOCIACAO' && 'Aparece com marca d\'água'}
                        {s === 'TEMPORARIAMENTE_INDISPONIVEL' && 'Aparece com marca d\'água'}
                        {s === 'VENDIDO' && 'Removido do site'}
                        {s === 'ALUGADO' && 'Removido do site'}
                        {s === 'INATIVO' && 'Removido do site'}
                      </div>
                    </div>
                    {form.status === s && <span style={styles.checkIcon}>✓</span>}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 20, padding: 16, background: '#f9fafb', borderRadius: 8 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Controle Manual</h3>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="disponivel"
                    checked={form.disponivel}
                    onChange={handleChange}
                  />
                  <span>Disponível no site (visível para visitantes)</span>
                </label>
                <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                  Marque ou desmarque manualmente independente do status.
                </p>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitulo}>👁️ Preview de Visibilidade</h2>

              <div style={styles.previewCard}>
                <div style={styles.previewImgWrapper}>
                  {form.imagens[0] ? (
                    <img src={form.imagens[0]} alt="preview" style={styles.previewImg} />
                  ) : (
                    <div style={styles.previewImgPlaceholder}>
                      {form.tipo === 'Casa' ? '🏠' : form.tipo === 'Apartamento' ? '🏢' : '🏗️'}
                    </div>
                  )}

                  {/* MARCA D'ÁGUA */}
                  {STATUS_NEGOCIACAO.includes(form.status) && (
                    <div style={styles.marcaDagua}>
                      <span style={styles.marcaDaguaTexto}>
                        {form.status === 'EM_NEGOCIACAO' ? 'EM NEGOCIAÇÃO' : 'TEMPORARIAMENTE\nINDISPONÍVEL'}
                      </span>
                    </div>
                  )}

                  {STATUS_INDISPONIVEL.includes(form.status) && (
                    <div style={{ ...styles.marcaDagua, background: 'rgba(0,0,0,0.6)' }}>
                      <span style={styles.marcaDaguaTexto}>
                        {form.status === 'VENDIDO' ? 'VENDIDO' : form.status === 'ALUGADO' ? 'ALUGADO' : 'INDISPONÍVEL'}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{form.tipo} em {form.cidade}</div>
                  <div style={{ color: '#6b7280', fontSize: 12 }}>{form.endereco}</div>
                  <div style={{ fontWeight: 700, color: '#2563eb', marginTop: 8 }}>
                    R$ {Number(form.preco || 0).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 16, padding: 12, background: form.disponivel ? '#f0fdf4' : '#fef2f2', borderRadius: 8, border: `1px solid ${form.disponivel ? '#bbf7d0' : '#fecaca'}` }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: form.disponivel ? '#16a34a' : '#dc2626' }}>
                  {form.disponivel ? '✅ Visível no site' : '❌ Oculto do site'}
                </p>
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  {form.disponivel
                    ? 'Este imóvel aparece na listagem pública.'
                    : STATUS_NEGOCIACAO.includes(form.status)
                      ? 'Aparece com marca d\'água indicando status.'
                      : 'Este imóvel não aparece para visitantes.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RODAPÉ */}
      <div style={styles.footer}>
        <Link href="/admin/imoveis" style={styles.btnSecundario}>← Cancelar</Link>
        <button onClick={handleExcluir} style={{ ...styles.btnSalvar, background: '#dc2626' }}>
          🗑️ Excluir Imóvel
        </button>
        <button onClick={handleSalvar} disabled={saving} style={styles.btnSalvar}>
          {saving ? '⏳ Salvando...' : '💾 Salvar Alterações'}
        </button>
      </div>
    </div>
  )
}

// ─── ESTILOS ────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  wrapper: { minHeight: '100vh', background: '#f9fafb', paddingBottom: 80 },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 },
  spinner: { width: 40, height: 40, border: '4px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  header: { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 },
  back: { fontSize: 13, color: '#6b7280', textDecoration: 'none', display: 'block', marginBottom: 6 },
  titulo: { fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 },
  subtitulo: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  codigo: { background: '#e5e7eb', padding: '2px 8px', borderRadius: 4, fontSize: 12, marginLeft: 8 },
  headerActions: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  badge: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#fff' },
  btnSalvar: { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  btnSecundario: { background: '#fff', color: '#374151', border: '1px solid #d1d5db', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14, textDecoration: 'none' },
  alertErro: { margin: '16px 32px', padding: '12px 16px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, color: '#991b1b', fontSize: 14 },
  alertSucesso: { margin: '16px 32px', padding: '12px 16px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, color: '#166534', fontSize: 14 },
  alertWarning: { margin: '8px 32px', padding: '12px 16px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, color: '#92400e', fontSize: 14 },
  abas: { display: 'flex', gap: 4, padding: '16px 32px 0', borderBottom: '1px solid #e5e7eb', background: '#fff' },
  aba: { padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14, color: '#6b7280', borderBottom: '2px solid transparent', fontWeight: 500 },
  abaAtiva: { color: '#2563eb', borderBottomColor: '#2563eb', fontWeight: 600 },
  conteudo: { padding: '24px 32px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  card: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
  cardTitulo: { fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' },
  campo: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const },
  select: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff' },
  gridDois: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  checkboxRow: { marginTop: 8 },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' },
  tagsGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  tagBtn: { padding: '6px 12px', borderRadius: 20, border: '1px solid #d1d5db', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#374151' },
  tagBtnAtivo: { background: '#2563eb', borderColor: '#2563eb', color: '#fff' },
  btnAdd: { padding: '10px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
  imagensGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 },
  imagemItem: { border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' },
  imagemWrapper: { position: 'relative', height: 140 },
  imagemPreview: { width: '100%', height: '100%', objectFit: 'cover' },
  capaTag: { position: 'absolute', top: 8, left: 8, background: '#2563eb', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4 },
  imagemAcoes: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#f9fafb' },
  btnRemover: { background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 12, flexShrink: 0 },
  vazio: { textAlign: 'center', padding: 40, color: '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  statusGrid: { display: 'flex', flexDirection: 'column', gap: 8 },
  statusBtn: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' },
  statusDot: { width: 12, height: 12, borderRadius: '50%', flexShrink: 0 },
  checkIcon: { marginLeft: 'auto', color: '#16a34a', fontWeight: 700 },
  vendaItem: { border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 12 },
  vendaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  vendaValor: { fontWeight: 700, fontSize: 18, color: '#16a34a' },
  vendaInfo: { display: 'flex', gap: 16, fontSize: 13, color: '#6b7280', flexWrap: 'wrap' },
  previewCard: { border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' },
  previewImgWrapper: { position: 'relative', height: 180, background: '#f3f4f6' },
  previewImg: { width: '100%', height: '100%', objectFit: 'cover' },
  previewImgPlaceholder: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 60 },
  marcaDagua: { position: 'absolute', inset: 0, background: 'rgba(234, 88, 12, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  marcaDaguaTexto: { color: '#fff', fontWeight: 900, fontSize: 22, textAlign: 'center', letterSpacing: 2, textShadow: '0 2px 8px rgba(0,0,0,0.4)', whiteSpace: 'pre-line' },
  footer: { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #e5e7eb', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50 },
}
