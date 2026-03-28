'use client'

export const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Venda {
  id: string
  imovel: {
    id: string
    tipo: string
    endereco: string
    cidade: string
    estado: string
    codigo: string
  }
  lead: {
    nome: string
    telefone: string
    email: string
  }
  corretor: {
    nome: string
  }
  valorVenda: number
  valorComissao: number
  percentualComissao: number
  dataPropostaInicial: string
  dataAssinatura: string | null
  status: string
  formaPagamento: string | null
}

export default function ImoveisVendidos() {
  const router = useRouter()
  const [vendas, setVendas] = useState<Venda[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('finalizada')
  const [periodoFilter, setPeriodoFilter] = useState('todos')

  useEffect(() => {
    fetchVendas()
  }, [statusFilter, periodoFilter])

  const fetchVendas = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (periodoFilter !== 'todos') params.append('periodo', periodoFilter)
      
      const res = await fetch(`/api/vendas?${params}`)
      const data = await res.json()
      
      if (data.success) {
        setVendas(data.data || [])
      }
    } catch (error: any) {
      console.error('Erro ao carregar vendas:', error)
      alert('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const filteredVendas = vendas.filter(venda => {
    const search = searchTerm.toLowerCase()
    return (
      venda.imovel.endereco.toLowerCase().includes(search) ||
      venda.imovel.cidade.toLowerCase().includes(search) ||
      venda.imovel.codigo?.toLowerCase().includes(search) ||
      venda.lead.nome.toLowerCase().includes(search) ||
      venda.corretor.nome.toLowerCase().includes(search)
    )
  })

  const calcularEstatisticas = () => {
    const total = filteredVendas.reduce((acc: any, v: any) => acc + parseFloat(v.valorVenda.toString()), 0)
    const comissoes = filteredVendas.reduce((acc: any, v: any) => acc + parseFloat(v.valorComissao.toString()), 0)
    const finalizadas = filteredVendas.filter(v => v.status === 'finalizada').length
    
    return { total, comissoes, finalizadas, quantidade: filteredVendas.length }
  }

  const stats = calcularEstatisticas()

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-12 font-sans">
      {/* HEADER */}
      <div className="mb-12 border-l-[12px] border-blue-500 pl-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none text-slate-900">
              Imóveis <br />
              <span className="text-blue-600">Vendidos</span>
            </h1>
            <p className="font-black text-slate-500 text-sm tracking-widest uppercase mt-4">
              Histórico de Vendas e Comissões • STR Genetics
            </p>
          </div>
          <Link 
            href="/admin/imoveis"
            className="bg-slate-900 text-white px-8 py-4 font-black uppercase italic tracking-tighter shadow-lg shadow-blue-600 hover:shadow-none transition-all"
          >
            ← Voltar aos Imóveis
          </Link>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white border-4 border-slate-900 p-6 mb-8 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Endereço, Código, Cliente..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:bg-blue-50 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:outline-none"
            >
              <option value="">Todos</option>
              <option value="proposta">Proposta</option>
              <option value="aprovada">Aprovada</option>
              <option value="finalizada">Finalizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              Período
            </label>
            <select
              value={periodoFilter}
              onChange={e => setPeriodoFilter(e.target.value)}
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:outline-none"
            >
              <option value="todos">Todos</option>
              <option value="mes">Último Mês</option>
              <option value="trimestre">Último Trimestre</option>
              <option value="ano">Último Ano</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchVendas}
              className="w-full bg-blue-600 text-white p-4 font-black uppercase italic tracking-tighter hover:bg-blue-700 transition-all"
            >
              🔄 Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border-4 border-slate-900 p-6 shadow-lg shadow-blue-600">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
            Total de Vendas
          </p>
          <p className="text-4xl font-black text-blue-600">
            {stats.quantidade}
          </p>
        </div>

        <div className="bg-white border-4 border-slate-900 p-6">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
            Valor Total
          </p>
          <p className="text-3xl font-black text-slate-900">
            R$ {stats.total.toLocaleString('pt-BR')}
          </p>
        </div>

        <div className="bg-white border-4 border-slate-900 p-6">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
            Comissões
          </p>
          <p className="text-3xl font-black text-green-600">
            R$ {stats.comissoes.toLocaleString('pt-BR')}
          </p>
        </div>

        <div className="bg-white border-4 border-slate-900 p-6">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
            Finalizadas
          </p>
          <p className="text-4xl font-black text-slate-900">
            {stats.finalizadas}
          </p>
        </div>
      </div>

      {/* TABELA */}
      {loading ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl font-bold text-slate-500">Carregando vendas...</p>
        </div>
      ) : filteredVendas.length === 0 ? (
        <div className="bg-white border-4 border-slate-900 p-20 text-center">
          <div className="text-6xl mb-4">💰</div>
          <p className="text-2xl font-black text-slate-900 mb-2">Nenhuma venda encontrada</p>
          <p className="text-slate-500">Ajuste os filtros ou registre novas vendas</p>
        </div>
      ) : (
        <div className="bg-white border-4 border-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="p-4 text-left font-black uppercase text-xs tracking-widest">Código</th>
                  <th className="p-4 text-left font-black uppercase text-xs tracking-widest">Imóvel</th>
                  <th className="p-4 text-left font-black uppercase text-xs tracking-widest">Comprador</th>
                  <th className="p-4 text-left font-black uppercase text-xs tracking-widest">Corretor</th>
                  <th className="p-4 text-right font-black uppercase text-xs tracking-widest">Valor Venda</th>
                  <th className="p-4 text-right font-black uppercase text-xs tracking-widest">Comissão</th>
                  <th className="p-4 text-center font-black uppercase text-xs tracking-widest">Data</th>
                  <th className="p-4 text-center font-black uppercase text-xs tracking-widest">Status</th>
                  <th className="p-4 text-center font-black uppercase text-xs tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendas.map((venda: any, index: number) => {
                  const statusConfig: any = {
                    proposta: { cor: 'bg-yellow-100 text-yellow-600', label: 'Proposta' },
                    aprovada: { cor: 'bg-blue-100 text-blue-600', label: 'Aprovada' },
                    finalizada: { cor: 'bg-green-100 text-green-600', label: 'Finalizada' },
                    cancelada: { cor: 'bg-red-100 text-red-600', label: 'Cancelada' }
                  }
                  const status = statusConfig[venda.status] || statusConfig.proposta

                  return (
                    <tr key={venda.id} className={`border-b-2 border-slate-200 hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      <td className="p-4 font-bold text-sm">{venda.imovel.codigo || venda.imovel.id.substring(0, 8)}</td>
                      <td className="p-4">
                        <p className="font-bold text-sm">{venda.imovel.tipo}</p>
                        <p className="text-xs text-slate-500">{venda.imovel.endereco}, {venda.imovel.cidade}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-sm">{venda.lead.nome}</p>
                        <p className="text-xs text-slate-500">{venda.lead.telefone}</p>
                      </td>
                      <td className="p-4 font-bold text-sm">{venda.corretor.nome}</td>
                      <td className="p-4 text-right">
                        <p className="font-black text-lg text-blue-600">R$ {parseFloat(venda.valorVenda.toString()).toLocaleString('pt-BR')}</p>
                        {venda.formaPagamento && (
                          <p className="text-xs text-slate-500">{venda.formaPagamento}</p>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <p className="font-black text-lg text-green-600">R$ {parseFloat(venda.valorComissao.toString()).toLocaleString('pt-BR')}</p>
                        <p className="text-xs text-slate-500">{parseFloat(venda.percentualComissao.toString())}%</p>
                      </td>
                      <td className="p-4 text-center">
                        <p className="text-sm font-bold">{new Date(venda.dataPropostaInicial).toLocaleDateString('pt-BR')}</p>
                        {venda.dataAssinatura && (
                          <p className="text-xs text-green-600 font-bold">
                            Assinada: {new Date(venda.dataAssinatura).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded text-xs font-black uppercase ${status.cor}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => router.push(`/admin/vendas/${venda.id}`)}
                            className="bg-blue-600 text-white px-3 py-2 text-xs font-bold hover:bg-blue-700 transition-all"
                            title="Ver Detalhes"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => router.push(`/admin/imoveis/${venda.imovel.id}`)}
                            className="bg-slate-600 text-white px-3 py-2 text-xs font-bold hover:bg-slate-700 transition-all"
                            title="Ver Imóvel"
                          >
                            🏠
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
