'use client'

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react'
import Link from 'next/link'

type AnaliseMercado = {
  id: string
  cidade: string
  estado: string
  valorM2: number
  valorMinimo?: number
  valorMaximo?: number
  tendencia: string
  fonte?: string
  observacoes?: string
  dataAnalise: string
}

export default function RelatoriosAnalise() {
  const [analises, setAnalises] = useState<AnaliseMercado[]>([])
  const [cidades, setCidades] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/admin/analise-mercado')
      .then(r => {
        if (!r.ok) throw new Error('Falha ao carregar dados')
        return r.json()
      })
      .then(d => {
        const data: AnaliseMercado[] = d.data || []
        setAnalises(data)
        const uniqueCidades = [...new Set(data.map(a => a.cidade))]
        setCidades(uniqueCidades)
        setLoading(false)
      })
      .catch(err => {
        console.error('Erro:', err)
        setError('Não foi possível carregar os relatórios')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-blue-500 font-black tracking-[0.7em] uppercase italic animate-pulse">
            Loading Reports
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-10 bg-[#f1f5f9] min-h-screen font-sans antialiased text-slate-900">
      {/* Header */}
      <div className="flex justify-between items-start mb-16 border-l-[12px] border-blue-600 pl-8">
        <div>
          <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-[0.8]">
            Market <br />
            <span className="text-blue-600">Reports</span>
          </h1>
          <p className="font-black text-slate-500 text-sm tracking-[0.3em] uppercase mt-4">
            Genetic Analysis Dashboard v1.0
          </p>
        </div>
        <Link 
          href="/admin/analise-mercado" 
          className="bg-slate-900 text-white px-12 py-5 font-black rounded-sm hover:bg-blue-600 transition-all shadow-[10px_10px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 uppercase italic tracking-tighter text-xl"
        >
          ← Back to Analysis
        </Link>
      </div>

      {error && (
        <div className="bg-red-600 text-white p-8 mb-12 font-black uppercase tracking-[0.2em] text-center shadow-[10px_10px_0px_0px_rgba(0,0,0,0.2)] animate-pulse border-4 border-white">
          ERROR: {error}
        </div>
      )}

      {/* Reports Grid */}
      {cidades.length === 0 ? (
        <div className="p-32 border-[6px] border-dashed border-slate-200 text-center font-black text-slate-300 uppercase tracking-[1em] bg-white">
          NO_DATA_AVAILABLE
        </div>
      ) : (
        <div className="grid gap-8">
          {cidades.map(cidade => {
            const analiseCidade = analises.filter(a => a.cidade === cidade)
            const ultima = analiseCidade[0] || null
            const mediaValor = analiseCidade.reduce((acc: any, a: any) => acc + Number(a.valorM2), 0) / analiseCidade.length
            
            let variacao = 0
            if (analiseCidade.length > 1) {
              const maisAntiga = analiseCidade[analiseCidade.length - 1]
              variacao = ((Number(ultima.valorM2) - Number(maisAntiga.valorM2)) / Number(maisAntiga.valorM2)) * 100
            }

            return (
              <div 
                key={cidade} 
                className="bg-white border-[3px] border-slate-900 shadow-[15px_15px_0px_0px_rgba(15,23,42,0.08)] hover:shadow-[20px_20px_0px_0px_rgba(37,99,235,0.3)] transition-all overflow-hidden"
              >
                <div className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <h2 className="font-black text-3xl uppercase tracking-tighter italic">
                      {cidade}
                    </h2>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      {ultima?.estado || 'SP'}
                    </span>
                  </div>
                  <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                    {analiseCidade.length} análises
                  </span>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 text-blue-400 text-6xl opacity-10 font-black">R$</div>
                      <p className="text-xs font-black text-blue-200 uppercase tracking-[0.3em] mb-2">
                        Valor Atual/m²
                      </p>
                      <p className="text-4xl font-black text-white tracking-tighter">
                        {ultima ? `R$ ${Number(ultima.valorM2).toLocaleString('pt-BR')}` : '--'}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-6 border-l-8 border-green-500">
                      <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-2">
                        Média Histórica
                      </p>
                      <p className="text-4xl font-black text-slate-900 tracking-tighter">
                        R$ {mediaValor.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </p>
                    </div>

                    <div className={`p-6 border-l-8 ${
                      ultima?.tendencia === 'alta' ? 'bg-green-50 border-green-500' :
                      ultima?.tendencia === 'baixa' ? 'bg-red-50 border-red-500' :
                      'bg-amber-50 border-amber-500'
                    }`}>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-2">
                        Tendência AI
                      </p>
                      <p className={`text-4xl font-black tracking-tighter uppercase italic ${
                        ultima?.tendencia === 'alta' ? 'text-green-600' :
                        ultima?.tendencia === 'baixa' ? 'text-red-600' :
                        'text-amber-600'
                      }`}>
                        {ultima?.tendencia === 'alta' ? '↑ ALTA' :
                         ultima?.tendencia === 'baixa' ? '↓ BAIXA' :
                         '→ ESTÁVEL'}
                      </p>
                    </div>

                    <div className={`p-6 border-l-8 ${
                      variacao > 0 ? 'bg-green-50 border-green-500' :
                      variacao < 0 ? 'bg-red-50 border-red-500' :
                      'bg-slate-50 border-slate-300'
                    }`}>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-2">
                        Variação
                      </p>
                      <p className={`text-4xl font-black tracking-tighter ${
                        variacao > 0 ? 'text-green-600' :
                        variacao < 0 ? 'text-red-600' :
                        'text-slate-600'
                      }`}>
                        {variacao > 0 ? '+' : ''}{variacao.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t-[3px] border-slate-100">
                    {ultima?.valorMinimo && ultima?.valorMaximo && (
                      <div className="bg-slate-50 p-6 rounded-sm">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-4">
                          Range de Valores
                        </p>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs text-slate-500 font-black mb-1">MIN</p>
                            <p className="text-xl font-black text-slate-700">
                              R$ {Number(ultima.valorMinimo).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <div className="h-1 flex-1 bg-gradient-to-r from-blue-600 to-blue-400"></div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500 font-black mb-1">MAX</p>
                            <p className="text-xl font-black text-slate-700">
                              R$ {Number(ultima.valorMaximo).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-slate-900 text-white p-6 rounded-sm">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-2">
                        Última Análise
                      </p>
                      <p className="text-2xl font-black">
                        {ultima 
                          ? new Date(ultima.dataAnalise).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })
                          : '--'}
                      </p>
                      {ultima?.fonte && (
                        <p className="text-xs text-blue-400 font-black uppercase tracking-widest mt-2">
                          Fonte: {ultima.fonte}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <footer className="mt-24 py-12 border-t-[6px] border-slate-900 flex justify-center">
        <div className="text-center">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] block mb-2">
            STR Genetics Intelligence Core
          </span>
          <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em]">
            Real Estate Market Analysis System
          </span>
        </div>
      </footer>
    </div>
  )
}
