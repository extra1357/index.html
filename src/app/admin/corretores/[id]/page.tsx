'use client'

export const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Corretor {
  id: string
  nome: string
  email: string
  telefone: string
  cpf: string | null
  creci: string
  dataAdmissao: string
  dataDemissao: string | null
  ativo: boolean
  banco: string | null
  agencia: string | null
  conta: string | null
  tipoConta: string | null
  pix: string | null
  comissaoPadrao: string
  foto: string | null
  observacoes: string | null
}

interface Venda {
  id: string
  valorVenda: string
  valorComissao: string
  percentualComissao: string
  dataPropostaInicial: string
  dataAssinatura: string | null
  status: string
  imovel: {
    tipo: string
    endereco: string
    cidade: string
    codigo: string | null
  }
  lead: {
    nome: string
    telefone: string
  }
}

interface Comissao {
  id: string
  tipo: string
  valorBase: string
  percentual: string
  valorComissao: string
  status: string
  dataPrevista: string | null
  dataPagamento: string | null
  observacoes: string | null
  venda?: {
    id: string
    imovel: {
      endereco: string
      codigo: string | null
    }
  } | null
  aluguel?: {
    id: string
    imovel: {
      endereco: string
      codigo: string | null
    }
  } | null
}

export default function DetalhesCorretor() {
  const params = useParams()
  const corretorId = params?.id as string

  const [corretor, setCorretor] = useState<Corretor | null>(null)
  const [vendas, setVendas] = useState<Venda[]>([])
  const [comissoes, setComissoes] = useState<Comissao[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'vendas' | 'comissoes'>('info')

  useEffect(() => {
    if (corretorId) {
      fetchDados()
    }
  }, [corretorId])

  const fetchDados = async () => {
    try {
      setLoading(true)
      
      const res = await fetch(`/api/corretores/${corretorId}`)
      const data = await res.json()
      
      if (data.success && data.data) {
        setCorretor(data.data)
        setVendas(data.data.vendas || [])
        setComissoes(data.data.comissoes || [])
      } else {
        alert('Erro ao carregar corretor')
      }
    } catch (error: any) {
      console.error('Erro:', error)
      alert('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const calcularStats = () => {
    const totalVendas = vendas.length
    const valorTotalVendas = vendas.reduce((acc: any, v: any) => acc + parseFloat(v.valorVenda || '0'), 0)
    const totalComissoes = comissoes.reduce((acc: any, c: any) => acc + parseFloat(c.valorComissao || '0'), 0)
    const pendentes = comissoes.filter(c => c.status === 'pendente').reduce((acc: any, c: any) => acc + parseFloat(c.valorComissao || '0'), 0)
    const pagas = comissoes.filter(c => c.status === 'paga').reduce((acc: any, c: any) => acc + parseFloat(c.valorComissao || '0'), 0)
    
    return { totalVendas, valorTotalVendas, totalComissoes, pendentes, pagas }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6 animate-pulse">⚡</div>
          <p className="text-2xl font-black text-white uppercase tracking-widest">
            Carregando dados...
          </p>
        </div>
      </div>
    )
  }

  if (!corretor) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6">❌</div>
          <p className="text-3xl font-black text-white uppercase mb-8">Corretor não encontrado</p>
          <Link 
            href="/admin/corretores"
            className="inline-block bg-yellow-400 text-black px-10 py-5 font-black text-xl uppercase hover:bg-yellow-300 transition-all"
          >
            ← Voltar
          </Link>
        </div>
      </div>
    )
  }

  const stats = calcularStats()

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-12">
      {/* HEADER */}
      <div className="mb-12 bg-gradient-to-r from-yellow-400 to-pink-500 p-1">
        <div className="bg-black p-8">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter mb-2">
                {corretor.nome}
              </h1>
              <p className="text-yellow-400 font-black text-lg uppercase tracking-widest">
                CRECI: {corretor.creci}
              </p>
              <p className="mt-2">
                <span className={`inline-block px-4 py-2 font-black text-sm uppercase ${
                  corretor.ativo ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
                }`}>
                  {corretor.ativo ? '✓ ATIVO' : '✗ INATIVO'}
                </span>
              </p>
            </div>
            <Link 
              href="/admin/corretores"
              className="bg-yellow-400 text-black px-8 py-4 font-black uppercase hover:bg-yellow-300 transition-all text-xl"
            >
              ← VOLTAR
            </Link>
          </div>
        </div>
      </div>

      {/* ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
        <StatCard 
          label="VENDAS"
          value={stats.totalVendas.toString()}
          color="from-purple-500 to-pink-500"
        />
        <StatCard 
          label="VALOR VENDIDO"
          value={`R$ ${stats.valorTotalVendas.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard 
          label="COMISSÕES"
          value={`R$ ${stats.totalComissoes.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
          color="from-green-500 to-emerald-500"
        />
        <StatCard 
          label="PENDENTES"
          value={`R$ ${stats.pendentes.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
          color="from-yellow-500 to-orange-500"
        />
        <StatCard 
          label="PAGAS"
          value={`R$ ${stats.pagas.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
          color="from-emerald-500 to-teal-500"
        />
      </div>

      {/* TABS */}
      <div className="bg-white text-black">
        <div className="flex border-b-4 border-black">
          <TabButton 
            active={activeTab === 'info'} 
            onClick={() => setActiveTab('info')}
            label="📋 INFORMAÇÕES"
          />
          <TabButton 
            active={activeTab === 'vendas'} 
            onClick={() => setActiveTab('vendas')}
            label={`💰 VENDAS (${stats.totalVendas})`}
            bordered
          />
          <TabButton 
            active={activeTab === 'comissoes'} 
            onClick={() => setActiveTab('comissoes')}
            label={`💵 COMISSÕES (${comissoes.length})`}
          />
        </div>

        <div className="p-8 bg-gray-50">
          {/* TAB INFORMAÇÕES */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InfoSection title="DADOS PESSOAIS" color="yellow">
                <InfoItem label="Nome" value={corretor.nome} />
                <InfoItem label="E-mail" value={corretor.email} />
                <InfoItem label="Telefone" value={corretor.telefone} />
                <InfoItem label="CPF" value={corretor.cpf || '-'} />
                <InfoItem label="CRECI" value={corretor.creci} />
                <InfoItem 
                  label="Admissão" 
                  value={new Date(corretor.dataAdmissao).toLocaleDateString('pt-BR')} 
                />
                {corretor.dataDemissao && (
                  <InfoItem 
                    label="Demissão" 
                    value={new Date(corretor.dataDemissao).toLocaleDateString('pt-BR')}
                    highlight="red"
                  />
                )}
                <InfoItem 
                  label="Comissão Padrão" 
                  value={`${parseFloat(corretor.comissaoPadrao || '0')}%`}
                  highlight="blue"
                />
              </InfoSection>

              <InfoSection title="DADOS BANCÁRIOS" color="blue">
                <InfoItem label="Banco" value={corretor.banco || '-'} />
                <InfoItem label="Agência" value={corretor.agencia || '-'} />
                <InfoItem label="Conta" value={corretor.conta || '-'} />
                <InfoItem label="Tipo" value={corretor.tipoConta || '-'} />
                <InfoItem label="PIX" value={corretor.pix || '-'} />
              </InfoSection>

              {corretor.observacoes && (
                <div className="lg:col-span-2 bg-white p-6 border-l-8 border-pink-500">
                  <h3 className="font-black text-2xl uppercase mb-4">📝 OBSERVAÇÕES</h3>
                  <p className="text-gray-700 leading-relaxed">{corretor.observacoes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB VENDAS */}
          {activeTab === 'vendas' && (
            <div>
              {vendas.length === 0 ? (
                <EmptyState icon="💰" message="Nenhuma venda registrada" />
              ) : (
                <div className="space-y-4">
                  {vendas.map((venda: any) => (
                    <VendaCard key={venda.id} venda={venda} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB COMISSÕES */}
          {activeTab === 'comissoes' && (
            <div>
              {comissoes.length === 0 ? (
                <EmptyState icon="💵" message="Nenhuma comissão registrada" />
              ) : (
                <div className="space-y-4">
                  {comissoes.map((comissao: any) => (
                    <ComissaoCard key={comissao.id} comissao={comissao} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// COMPONENTES AUXILIARES

function StatCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className={`bg-gradient-to-br ${color} p-1`}>
      <div className="bg-black p-6 h-full">
        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
          {label}
        </p>
        <p className="text-3xl font-black text-white">
          {value}
        </p>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, label, bordered }: { 
  active: boolean
  onClick: () => void
  label: string
  bordered?: boolean 
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 p-6 font-black uppercase text-sm lg:text-base transition-all ${
        bordered ? 'border-x-4 border-black' : ''
      } ${
        active 
          ? 'bg-yellow-400 text-black' 
          : 'bg-white text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  )
}

function InfoSection({ title, color, children }: { 
  title: string
  color: string
  children: React.ReactNode 
}) {
  const borderColor = color === 'yellow' ? 'border-yellow-400' : 'border-blue-400'
  
  return (
    <div className={`bg-white p-6 border-l-8 ${borderColor}`}>
      <h3 className="font-black text-2xl uppercase mb-6">{title}</h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}

function InfoItem({ label, value, highlight }: { 
  label: string
  value: string
  highlight?: 'red' | 'blue' 
}) {
  const valueColor = highlight === 'red' ? 'text-red-600' : 
                     highlight === 'blue' ? 'text-blue-600' : 
                     'text-black'
  
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-200">
      <span className="font-bold text-xs uppercase text-gray-500">
        {label}
      </span>
      <span className={`font-black text-sm ${valueColor}`}>
        {value}
      </span>
    </div>
  )
}

function VendaCard({ venda }: { venda: Venda }) {
  const statusColors = {
    finalizada: 'bg-green-500 text-white',
    aprovada: 'bg-blue-500 text-white',
    cancelada: 'bg-red-500 text-white',
    default: 'bg-yellow-500 text-black'
  }
  
  const statusColor = statusColors[venda.status as keyof typeof statusColors] || statusColors.default
  
  return (
    <div className="bg-white border-l-8 border-yellow-400 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-black text-xl uppercase">{venda.imovel.tipo}</h4>
          <p className="text-gray-600">{venda.imovel.endereco}, {venda.imovel.cidade}</p>
          {venda.imovel.codigo && (
            <p className="text-xs text-gray-400">CÓD: {venda.imovel.codigo}</p>
          )}
        </div>
        <span className={`px-4 py-2 font-black text-xs uppercase ${statusColor}`}>
          {venda.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <DataBox label="CLIENTE" value={venda.lead.nome} sub={venda.lead.telefone} />
        <DataBox 
          label="VALOR" 
          value={`R$ ${parseFloat(venda.valorVenda || '0').toLocaleString('pt-BR')}`}
          highlight="blue"
        />
        <DataBox 
          label="COMISSÃO" 
          value={`R$ ${parseFloat(venda.valorComissao || '0').toLocaleString('pt-BR')}`}
          sub={`${parseFloat(venda.percentualComissao || '0')}%`}
          highlight="green"
        />
        <DataBox 
          label="DATA" 
          value={new Date(venda.dataPropostaInicial).toLocaleDateString('pt-BR')}
        />
      </div>
    </div>
  )
}

function ComissaoCard({ comissao }: { comissao: Comissao }) {
  const imovel = comissao.venda?.imovel || comissao.aluguel?.imovel
  
  const statusColors = {
    paga: 'bg-green-500 text-white',
    aprovada: 'bg-blue-500 text-white',
    cancelada: 'bg-red-500 text-white',
    default: 'bg-yellow-500 text-black'
  }
  
  const statusColor = statusColors[comissao.status as keyof typeof statusColors] || statusColors.default
  
  return (
    <div className="bg-white border-l-8 border-pink-500 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-black text-xl uppercase">{comissao.tipo}</h4>
          {imovel && (
            <>
              <p className="text-gray-600">{imovel.endereco}</p>
              {imovel.codigo && (
                <p className="text-xs text-gray-400">CÓD: {imovel.codigo}</p>
              )}
            </>
          )}
        </div>
        <span className={`px-4 py-2 font-black text-xs uppercase ${statusColor}`}>
          {comissao.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <DataBox 
          label="BASE" 
          value={`R$ ${parseFloat(comissao.valorBase || '0').toLocaleString('pt-BR')}`}
          sub={`${parseFloat(comissao.percentual || '0')}%`}
        />
        <DataBox 
          label="COMISSÃO" 
          value={`R$ ${parseFloat(comissao.valorComissao || '0').toLocaleString('pt-BR')}`}
          highlight="green"
        />
        <DataBox 
          label="PREVISÃO" 
          value={comissao.dataPrevista 
            ? new Date(comissao.dataPrevista).toLocaleDateString('pt-BR')
            : '-'
          }
        />
        <DataBox 
          label="PAGAMENTO" 
          value={comissao.dataPagamento 
            ? `✅ ${new Date(comissao.dataPagamento).toLocaleDateString('pt-BR')}`
            : '-'
          }
          highlight={comissao.dataPagamento ? 'green' : undefined}
        />
      </div>
    </div>
  )
}

function DataBox({ label, value, sub, highlight }: { 
  label: string
  value: string
  sub?: string
  highlight?: 'blue' | 'green' 
}) {
  const valueColor = highlight === 'blue' ? 'text-blue-600' : 
                     highlight === 'green' ? 'text-green-600' : 
                     'text-black'
  
  return (
    <div>
      <p className="text-xs font-black text-gray-500 uppercase mb-1">{label}</p>
      <p className={`font-black text-lg ${valueColor}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  )
}

function EmptyState({ icon, message }: { icon: string, message: string }) {
  return (
    <div className="text-center py-20">
      <div className="text-7xl mb-6">{icon}</div>
      <p className="text-3xl font-black text-black uppercase">{message}</p>
    </div>
  )
}
