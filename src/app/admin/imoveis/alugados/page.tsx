'use client'

export const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Aluguel {
  id: string
  imovel: {
    id: string
    tipo: string
    endereco: string
    cidade: string
    estado: string
    codigo: string
  }
  inquilino: {
    nome: string
    telefone: string
    email: string
  }
  corretor: {
    nome: string
  }
  valorAluguel: number
  valorTotal: number
  dataInicio: string
  dataFim: string
  status: string
  diaVencimento: number
}

export default function ImoveisAlugados() {
  const router = useRouter()
  const [alugueis, setAlugueis] = useState<Aluguel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ativo')

  useEffect(() => {
    fetchAlugueis()
  }, [statusFilter])

  const fetchAlugueis = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/alugueis?status=${statusFilter}`)
      const data = await res.json()
      
      if (data.success) {
        setAlugueis(data.data || [])
      }
    } catch (error: any) {
      console.error('Erro ao carregar aluguéis:', error)
      alert('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const filteredAlugueis = alugueis.filter(aluguel => {
    const search = searchTerm.toLowerCase()
    return (
      aluguel.imovel.endereco.toLowerCase().includes(search) ||
      aluguel.imovel.cidade.toLowerCase().includes(search) ||
      aluguel.imovel.codigo?.toLowerCase().includes(search) ||
      aluguel.inquilino.nome.toLowerCase().includes(search)
    )
  })

  const calcularDiasRestantes = (dataFim: string) => {
    const hoje = new Date()
    const fim = new Date(dataFim)
    const diff = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-12 font-sans">
      {/* HEADER */}
      <div className="mb-12 border-l-[12px] border-green-500 pl-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none text-slate-900">
              Imóveis <br />
              <span className="text-green-600">Alugados</span>
            </h1>
            <p className="font-black text-slate-500 text-sm tracking-widest uppercase mt-4">
              Gestão de Contratos Ativos • STR Genetics
            </p>
          </div>
          <Link 
            href="/admin/imoveis"
            className="bg-slate-900 text-white px-8 py-4 font-black uppercase italic tracking-tighter shadow-lg shadow-green-600 hover:shadow-none transition-all"
          >
            ← Voltar aos Imóveis
          </Link>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white border-4 border-slate-900 p-6 mb-8 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Endereço, Código, Inquilino..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:bg-green-50 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block mb-2 font-black uppercase tracking-widest text-xs text-slate-400">
              Status do Contrato
            </label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 p-4 border-4 border-slate-900 font-bold text-lg focus:outline-none"
            >
              <option value="ativo">Ativos</option>
              <option value="vencido">Vencidos</option>
              <option value="cancelado">Cancelados</option>
              <option value="">Todos</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchAlugueis}
              className="w-full bg-green-600 text-white p-4 font-black uppercase italic tracking-tighter hover:bg-green-700 transition-all"
            >
              🔄 Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border-4 border-slate-900 p-6 shadow-lg shadow-green-600">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
            Total Alugados
          </p>
          <p className="text-4xl font-black text-green-600">
            {filteredAlugueis.length}
          </p>
        </div>

        <div className="bg-white border-4 border-slate-900 p-6">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
            Receita Mensal
          </p>
          <p className="text-4xl font-black text-slate-900">
            R$ {filteredAlugueis.reduce((acc: any, a: any) => acc + parseFloat(a.valorTotal.toString()), 0).toLocaleString('pt-BR')}
          </p>
        </div>

        <div className="bg-white border-4 border-slate-900 p-6">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
            Vencendo em 30d
          </p>
          <p className="text-4xl font-black text-orange-600">
            {filteredAlugueis.filter(a => {
              const dias = calcularDiasRestantes(a.dataFim)
              return dias > 0 && dias <= 30
            }).length}
          </p>
        </div>

        <div className="bg-white border-4 border-slate-900 p-6">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
            Vencidos
          </p>
          <p className="text-4xl font-black text-red-600">
            {filteredAlugueis.filter(a => calcularDiasRestantes(a.dataFim) < 0).length}
          </p>
        </div>
      </div>

      {/* TABELA */}
      {loading ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl font-bold text-slate-500">Carregando contratos...</p>
        </div>
      ) : filteredAlugueis.length === 0 ? (
        <div className="bg-white border-4 border-slate-900 p-20 text-center">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-2xl font-black text-slate-900 mb-2">Nenhum contrato encontrado</p>
          <p className="text-slate-500">Ajuste os filtros ou adicione novos contratos</p>
        </div>
      ) : (
        <div className="bg-white border-4 border-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="p-4 text-left font-black uppercase text-xs tracking-widest">Código</th>
                  <th className="p-4 text-left font-black uppercase text-xs tracking-widest">Imóvel</th>
                  <th className="p-4 text-left font-black uppercase text-xs tracking-widest">Inquilino</th>
                  <th className="p-4 text-left font-black uppercase text-xs tracking-widest">Corretor</th>
                  <th className="p-4 text-right font-black uppercase text-xs tracking-widest">Valor</th>
                  <th className="p-4 text-center font-black uppercase text-xs tracking-widest">Vencimento</th>
                  <th className="p-4 text-center font-black uppercase text-xs tracking-widest">Status</th>
                  <th className="p-4 text-center font-black uppercase text-xs tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlugueis.map((aluguel: any, index: number) => {
                  const diasRestantes = calcularDiasRestantes(aluguel.dataFim)
                  const statusCor = diasRestantes < 0 ? 'bg-red-100 text-red-600' : 
                                   diasRestantes <= 30 ? 'bg-orange-100 text-orange-600' : 
                                   'bg-green-100 text-green-600'

                  return (
                    <tr key={aluguel.id} className={`border-b-2 border-slate-200 hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      <td className="p-4 font-bold text-sm">{aluguel.imovel.codigo || aluguel.imovel.id.substring(0, 8)}</td>
                      <td className="p-4">
                        <p className="font-bold text-sm">{aluguel.imovel.tipo}</p>
                        <p className="text-xs text-slate-500">{aluguel.imovel.endereco}, {aluguel.imovel.cidade}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-sm">{aluguel.inquilino.nome}</p>
                        <p className="text-xs text-slate-500">{aluguel.inquilino.telefone}</p>
                      </td>
                      <td className="p-4 font-bold text-sm">{aluguel.corretor.nome}</td>
                      <td className="p-4 text-right">
                        <p className="font-black text-lg text-green-600">R$ {parseFloat(aluguel.valorTotal.toString()).toLocaleString('pt-BR')}</p>
                        <p className="text-xs text-slate-500">Dia {aluguel.diaVencimento}</p>
                      </td>
                      <td className="p-4 text-center">
                        <p className="text-sm font-bold">{new Date(aluguel.dataFim).toLocaleDateString('pt-BR')}</p>
                        <p className={`text-xs font-bold ${diasRestantes < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                          {diasRestantes < 0 ? `Vencido há ${Math.abs(diasRestantes)} dias` : `${diasRestantes} dias restantes`}
                        </p>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded text-xs font-black uppercase ${statusCor}`}>
                          {aluguel.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => router.push(`/admin/alugueis/${aluguel.id}`)}
                            className="bg-blue-600 text-white px-3 py-2 text-xs font-bold hover:bg-blue-700 transition-all"
                            title="Ver Detalhes"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => router.push(`/admin/imoveis/${aluguel.imovel.id}`)}
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
