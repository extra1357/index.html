'use client'

export const dynamic = 'force-dynamic';


import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Consulta {
  id: string
  tipo: string
  status: string
  dataAgendada: string | null
  observacoes: string | null
  createdAt: string
  lead: {
    id: string
    nome: string
    email: string
    telefone: string
  }
  imovel: {
    id: string
    tipo: string
    endereco: string
    cidade: string
    estado: string
    preco: string
    codigo: string | null
  }
  corretor?: {
    id: string
    nome: string
    creci: string
  } | null
}

export default function ConsultasPage() {
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    fetchConsultas()
  }, [])

  const fetchConsultas = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/consultas')
      const data = await res.json()
      
      if (data.success && data.data) {
        setConsultas(data.data)
      } else {
        console.error('Erro ao carregar consultas:', data.error)
      }
    } catch (error: any) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const consultasFiltradas = consultas.filter(consulta => {
    const matchStatus = filtroStatus === 'todos' || consulta.status === filtroStatus
    const matchBusca = busca === '' || 
      consulta.lead.nome.toLowerCase().includes(busca.toLowerCase()) ||
      consulta.imovel.endereco.toLowerCase().includes(busca.toLowerCase())
    
    return matchStatus && matchBusca
  })

  const contarPorStatus = () => {
    return {
      agendada: consultas.filter(c => c.status === 'agendada').length,
      confirmada: consultas.filter(c => c.status === 'confirmada').length,
      realizada: consultas.filter(c => c.status === 'realizada').length,
      cancelada: consultas.filter(c => c.status === 'cancelada').length
    }
  }

  const stats = contarPorStatus()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6 animate-pulse">📅</div>
          <p className="text-2xl font-black text-white uppercase tracking-widest">
            Carregando consultas...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-12">
      {/* HEADER */}
      <div className="mb-12 bg-gradient-to-r from-purple-400 to-pink-500 p-1">
        <div className="bg-black p-8">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter">
                CONSULTAS
              </h1>
              <p className="text-purple-400 font-black text-lg uppercase tracking-widest mt-2">
                Gerenciamento de visitas e consultas
              </p>
            </div>
            <div className="flex gap-4">
              <Link 
                href="/admin/consultas/funil"
                className="bg-blue-500 text-white px-8 py-4 font-black uppercase hover:bg-blue-400 transition-all text-xl"
              >
                🎯 FUNIL
              </Link>
              <Link 
                href="/admin/consultas/novo"
                className="bg-purple-400 text-black px-8 py-4 font-black uppercase hover:bg-purple-300 transition-all text-xl"
              >
                + NOVA CONSULTA
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <StatCard 
          label="AGENDADAS"
          value={stats.agendada.toString()}
          color="from-yellow-500 to-orange-500"
        />
        <StatCard 
          label="CONFIRMADAS"
          value={stats.confirmada.toString()}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard 
          label="REALIZADAS"
          value={stats.realizada.toString()}
          color="from-green-500 to-emerald-500"
        />
        <StatCard 
          label="CANCELADAS"
          value={stats.cancelada.toString()}
          color="from-red-500 to-pink-500"
        />
      </div>

      {/* FILTROS */}
      <div className="bg-white text-black p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-black text-xs uppercase mb-2">
              🔍 Buscar
            </label>
            <input
              type="text"
              value={busca}
              onChange={(e: any) => setBusca(e.target.value)}
              placeholder="Nome do cliente ou endereço..."
              className="w-full border-4 border-black p-3 font-bold"
            />
          </div>

          <div>
            <label className="block font-black text-xs uppercase mb-2">
              📊 Filtrar por Status
            </label>
            <select
              value={filtroStatus}
              onChange={(e: any) => setFiltroStatus(e.target.value)}
              className="w-full border-4 border-black p-3 font-bold"
            >
              <option value="todos">Todos</option>
              <option value="agendada">Agendada</option>
              <option value="confirmada">Confirmada</option>
              <option value="realizada">Realizada</option>
              <option value="cancelada">Cancelada</option>
              <option value="remarcada">Remarcada</option>
            </select>
          </div>
        </div>
      </div>

      {/* LISTA DE CONSULTAS */}
      <div className="bg-white text-black">
        {consultasFiltradas.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-6">📅</div>
            <p className="text-3xl font-black">
              {busca || filtroStatus !== 'todos' 
                ? 'Nenhuma consulta encontrada com os filtros aplicados' 
                : 'Nenhuma consulta cadastrada'
              }
            </p>
            {(busca || filtroStatus !== 'todos') && (
              <button
                onClick={() => {
                  setBusca('')
                  setFiltroStatus('todos')
                }}
                className="mt-6 bg-black text-white px-6 py-3 font-black uppercase"
              >
                Limpar Filtros
              </button>
            )}
            {!busca && filtroStatus === 'todos' && (
              <Link
                href="/admin/consultas/novo"
                className="mt-6 inline-block bg-purple-500 text-white px-8 py-4 font-black uppercase"
              >
                + Cadastrar Primeira Consulta
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y-4 divide-black">
            {consultasFiltradas.map((consulta: any) => (
              <ConsultaCard key={consulta.id} consulta={consulta} />
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
        <p className="text-4xl font-black text-white">
          {value}
        </p>
      </div>
    </div>
  )
}

// COMPONENTE DE CARD DE CONSULTA
function ConsultaCard({ consulta }: { consulta: Consulta }) {
  const statusColors = {
    agendada: 'bg-yellow-500 text-black',
    confirmada: 'bg-blue-500 text-white',
    realizada: 'bg-green-500 text-white',
    cancelada: 'bg-red-500 text-white',
    remarcada: 'bg-orange-500 text-white'
  }
  
  const statusColor = statusColors[consulta.status as keyof typeof statusColors] || 'bg-gray-500 text-white'

  const tipoLabels = {
    visita: '🏠 Visita',
    avaliacao: '📊 Avaliação',
    proposta: '💰 Proposta',
    negociacao: '🤝 Negociação'
  }

  const tipoLabel = tipoLabels[consulta.tipo as keyof typeof tipoLabels] || consulta.tipo

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <h3 className="font-black text-2xl uppercase">{tipoLabel}</h3>
            <span className={`px-4 py-2 font-black text-xs uppercase ${statusColor}`}>
              {consulta.status}
            </span>
          </div>
          
          <div className="mb-3">
            <p className="font-black text-lg">👤 {consulta.lead.nome}</p>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>📧 {consulta.lead.email}</span>
              <span>📱 {consulta.lead.telefone}</span>
            </div>
          </div>
          
          <div className="bg-gray-100 p-4 rounded mb-3">
            <p className="font-black text-sm text-gray-700 mb-1">🏠 IMÓVEL:</p>
            <p className="font-bold">{consulta.imovel.tipo} - {consulta.imovel.endereco}</p>
            <div className="flex gap-4 text-sm text-gray-600 mt-1">
              <span>{consulta.imovel.cidade}/{consulta.imovel.estado}</span>
              <span className="font-bold text-green-600">
                R$ {parseFloat(consulta.imovel.preco || '0').toLocaleString('pt-BR')}
              </span>
              {consulta.imovel.codigo && (
                <span className="text-gray-400">CÓD: {consulta.imovel.codigo}</span>
              )}
            </div>
          </div>

          {consulta.corretor && (
            <div className="text-sm text-gray-600">
              <span className="font-bold">👨‍💼 Corretor:</span> {consulta.corretor.nome} (CRECI: {consulta.corretor.creci})
            </div>
          )}
        </div>

        <Link
          href={`/admin/consultas/${consulta.id}`}
          className="bg-black text-white px-6 py-3 font-black uppercase text-sm hover:bg-gray-800 transition-all ml-4"
        >
          VER DETALHES →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t-2 border-gray-200">
        <DataBox 
          label="TIPO" 
          value={tipoLabel}
        />
        <DataBox 
          label="DATA AGENDADA" 
          value={consulta.dataAgendada 
            ? new Date(consulta.dataAgendada).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            : 'Não definida'
          }
        />
        <DataBox 
          label="CADASTRADA EM" 
          value={new Date(consulta.createdAt).toLocaleDateString('pt-BR')}
        />
      </div>

      {consulta.observacoes && (
        <div className="mt-4 bg-blue-50 p-4 rounded border-l-4 border-blue-500">
          <p className="text-xs font-black text-blue-700 uppercase mb-1">📝 Observações:</p>
          <p className="text-sm text-gray-700">{consulta.observacoes}</p>
        </div>
      )}
    </div>
  )
}

function DataBox({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-xs font-black text-gray-500 uppercase mb-1">{label}</p>
      <p className="font-black text-sm text-black">{value}</p>
    </div>
  )
}
