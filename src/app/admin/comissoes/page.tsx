'use client'

export const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react'
import Link from 'next/link'

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
  corretor: {
    id: string
    nome: string
    creci: string
  }
  venda?: {
    id: string
    imovel: {
      endereco: string
      codigo: string | null
      tipo: string
    }
  } | null
  aluguel?: {
    id: string
    imovel: {
      endereco: string
      codigo: string | null
      tipo: string
    }
  } | null
}

export default function ComissoesPage() {
  const [comissoes, setComissoes] = useState<Comissao[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    fetchComissoes()
  }, [])

  const fetchComissoes = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/comissoes')
      const data = await res.json()
      
      if (data.success) {
        setComissoes(data.data || [])
      } else {
        alert('Erro ao carregar comissões')
      }
    } catch (error: any) {
      console.error('Erro:', error)
      alert('Erro ao carregar comissões')
    } finally {
      setLoading(false)
    }
  }

  const calcularTotais = () => {
    const total = comissoes.reduce((acc: any, c: any) => acc + parseFloat(c.valorComissao || '0'), 0)
    const pendentes = comissoes
      .filter(c => c.status === 'pendente')
      .reduce((acc: any, c: any) => acc + parseFloat(c.valorComissao || '0'), 0)
    const aprovadas = comissoes
      .filter(c => c.status === 'aprovada')
      .reduce((acc: any, c: any) => acc + parseFloat(c.valorComissao || '0'), 0)
    const pagas = comissoes
      .filter(c => c.status === 'paga')
      .reduce((acc: any, c: any) => acc + parseFloat(c.valorComissao || '0'), 0)
    
    return { total, pendentes, aprovadas, pagas }
  }

  const comissoesFiltradas = comissoes.filter(comissao => {
    const matchStatus = filtroStatus === 'todos' || comissao.status === filtroStatus
    const matchTipo = filtroTipo === 'todos' || comissao.tipo === filtroTipo
    const matchBusca = busca === '' || 
      comissao.corretor.nome.toLowerCase().includes(busca.toLowerCase()) ||
      comissao.corretor.creci.toLowerCase().includes(busca.toLowerCase())
    
    return matchStatus && matchTipo && matchBusca
  })

  const totais = calcularTotais()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6 animate-pulse">💵</div>
          <p className="text-2xl font-black text-white uppercase tracking-widest">
            Carregando comissões...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-12">
      {/* HEADER */}
      <div className="mb-12 bg-gradient-to-r from-green-400 to-emerald-500 p-1">
        <div className="bg-black p-8">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter">
                COMISSÕES
              </h1>
              <p className="text-green-400 font-black text-lg uppercase tracking-widest mt-2">
                Gerenciamento de comissões
              </p>
            </div>
            <div className="flex gap-4">
              <Link 
                href="/admin/comissoes/novo"
                className="bg-green-400 text-black px-8 py-4 font-black uppercase hover:bg-green-300 transition-all text-xl"
              >
                + NOVA COMISSÃO
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <StatCard 
          label="TOTAL"
          value={`R$ ${totais.total.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
          color="from-purple-500 to-pink-500"
        />
        <StatCard 
          label="PENDENTES"
          value={`R$ ${totais.pendentes.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
          color="from-yellow-500 to-orange-500"
        />
        <StatCard 
          label="APROVADAS"
          value={`R$ ${totais.aprovadas.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard 
          label="PAGAS"
          value={`R$ ${totais.pagas.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
          color="from-green-500 to-emerald-500"
        />
      </div>

      {/* FILTROS */}
      <div className="bg-white text-black p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-black text-xs uppercase mb-2">
              🔍 Buscar
            </label>
            <input
              type="text"
              value={busca}
              onChange={(e: any) => setBusca(e.target.value)}
              placeholder="Nome do corretor ou CRECI..."
              className="w-full border-4 border-black p-3 font-bold"
            />
          </div>

          <div>
            <label className="block font-black text-xs uppercase mb-2">
              📊 Status
            </label>
            <select
              value={filtroStatus}
              onChange={(e: any) => setFiltroStatus(e.target.value)}
              className="w-full border-4 border-black p-3 font-bold"
            >
              <option value="todos">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="aprovada">Aprovada</option>
              <option value="paga">Paga</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="block font-black text-xs uppercase mb-2">
              🏷️ Tipo
            </label>
            <select
              value={filtroTipo}
              onChange={(e: any) => setFiltroTipo(e.target.value)}
              className="w-full border-4 border-black p-3 font-bold"
            >
              <option value="todos">Todos</option>
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
              <option value="entrada">Entrada</option>
              <option value="renovacao">Renovação</option>
            </select>
          </div>
        </div>
      </div>

      {/* LISTA DE COMISSÕES */}
      <div className="bg-white text-black">
        {comissoesFiltradas.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-6">💵</div>
            <p className="text-3xl font-black">Nenhuma comissão encontrada</p>
            {(filtroStatus !== 'todos' || filtroTipo !== 'todos' || busca !== '') && (
              <button
                onClick={() => {
                  setFiltroStatus('todos')
                  setFiltroTipo('todos')
                  setBusca('')
                }}
                className="mt-6 bg-black text-white px-6 py-3 font-black uppercase"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y-4 divide-black">
            {comissoesFiltradas.map((comissao: any) => (
              <ComissaoCard key={comissao.id} comissao={comissao} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// COMPONENTE DE CARD ESTATÍSTICO
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

// COMPONENTE DE CARD DE COMISSÃO
function ComissaoCard({ comissao }: { comissao: Comissao }) {
  const imovel = comissao.venda?.imovel || comissao.aluguel?.imovel
  
  const statusColors = {
    paga: 'bg-green-500 text-white',
    aprovada: 'bg-blue-500 text-white',
    pendente: 'bg-yellow-500 text-black',
    cancelada: 'bg-red-500 text-white'
  }
  
  const statusColor = statusColors[comissao.status as keyof typeof statusColors] || statusColors.pendente
  
  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h3 className="font-black text-2xl uppercase">{comissao.tipo}</h3>
            <span className={`px-4 py-2 font-black text-xs uppercase ${statusColor}`}>
              {comissao.status}
            </span>
          </div>
          
          {imovel && (
            <div className="text-gray-600 mb-2">
              <p className="font-bold">{imovel.tipo} - {imovel.endereco}</p>
              {imovel.codigo && (
                <p className="text-xs">CÓD: {imovel.codigo}</p>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-4 text-sm">
            <span className="font-bold text-gray-700">
              👤 {comissao.corretor.nome}
            </span>
            <span className="text-gray-500">
              CRECI: {comissao.corretor.creci}
            </span>
          </div>
        </div>

        <Link
          href={`/admin/comissoes/${comissao.id}`}
          className="bg-black text-white px-6 py-3 font-black uppercase text-sm hover:bg-gray-800 transition-all"
        >
          VER DETALHES →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t-2 border-gray-200">
        <DataBox 
          label="VALOR BASE" 
          value={`R$ ${parseFloat(comissao.valorBase || '0').toLocaleString('pt-BR')}`}
        />
        <DataBox 
          label="PERCENTUAL" 
          value={`${parseFloat(comissao.percentual || '0')}%`}
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
            ? new Date(comissao.dataPagamento).toLocaleDateString('pt-BR')
            : '-'
          }
          highlight={comissao.dataPagamento ? 'green' : undefined}
        />
      </div>
    </div>
  )
}

function DataBox({ label, value, highlight }: { 
  label: string
  value: string
  highlight?: 'green' 
}) {
  const valueColor = highlight === 'green' ? 'text-green-600' : 'text-black'
  
  return (
    <div>
      <p className="text-xs font-black text-gray-500 uppercase mb-1">{label}</p>
      <p className={`font-black text-lg ${valueColor}`}>{value}</p>
    </div>
  )
}
