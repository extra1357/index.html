'use client'

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Container from '@/components/ui/Container'

export default function RelatorioLeads() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [stats, setStats] = useState<any>({ 
    total: 0, 
    quente: 0, 
    morno: 0, 
    frio: 0 
  })

  useEffect(() => {
    fetch('/api/leads')
      .then(r => {
        if (!r.ok) throw new Error('Erro ao buscar leads')
        return r.json()
      })
      .then(d => {
        const data = d.leads || []
        setLeads(data)
        setStats({
          total: data.length,
          quente: data.filter((l: any) => l.status?.toLowerCase() === 'quente').length,
          morno: data.filter((l: any) => l.status?.toLowerCase() === 'morno').length,
          frio: data.filter((l: any) => l.status?.toLowerCase() === 'frio').length,
        })
        setLoading(false)
      })
      .catch(err => {
        console.error('Erro ao carregar relatório:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Container title="📊 Relatório de Leads" subtitle="Carregando dados...">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      </Container>
    )
  }

  return (
    <Container
      title="📊 Relatório de Leads"
      subtitle="Análise detalhada da captação"
      action={
        <Link href="/admin/leads" className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition text-gray-600">
          ← Voltar para Leads
        </Link>
      }
    >
      {/* Cards de Destaque com Gradiente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Total de Leads</h3>
          <p className="text-5xl font-bold">{stats.total}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2">🔥 Quentes</h3>
          <p className="text-5xl font-bold">{stats.quente}</p>
          <p className="text-sm mt-2 opacity-80">{stats.total > 0 ? ((stats.quente/stats.total)*100).toFixed(1) : 0}% do total</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2">☀️ Mornos</h3>
          <p className="text-5xl font-bold">{stats.morno}</p>
          <p className="text-sm mt-2 opacity-80">{stats.total > 0 ? ((stats.morno/stats.total)*100).toFixed(1) : 0}% do total</p>
        </div>

        <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2">❄️ Frios</h3>
          <p className="text-5xl font-bold">{stats.frio}</p>
          <p className="text-sm mt-2 opacity-80">{stats.total > 0 ? ((stats.frio/stats.total)*100).toFixed(1) : 0}% do total</p>
        </div>
      </div>

      {/* Gráfico de Barras por Origem */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Análise por Origem</h2>
        <div className="space-y-6">
          {['site', 'Site Profissional', 'redes-sociais', 'indicacao'].map(origem => {
            const count = leads.filter((l: any) => l.origem?.toLowerCase() === origem.toLowerCase()).length
            const percent = stats.total > 0 ? ((count/stats.total)*100).toFixed(1) : 0
            
            return (
              <div key={origem} className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="w-40 font-semibold text-gray-600 uppercase text-xs tracking-wider">{origem.replace('-', ' ')}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-10 overflow-hidden border border-gray-200 shadow-inner">
                  <div 
                    className="bg-blue-600 h-full flex items-center justify-end pr-4 text-white text-xs font-bold transition-all duration-1000"
                    style={{ width: `${percent}%`, minWidth: count > 0 ? '40px' : '0' }}
                  >
                    {count > 0 && `${count} (${percent}%)`}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-700 text-sm">
        💡 <strong>Dica:</strong> {stats.total > 0 ? `Você tem ${stats.total} leads cadastrados. ` : 'Ainda não há leads cadastrados. '}
        {stats.quente > 0 && `${stats.quente} lead${stats.quente > 1 ? 's' : ''} quente${stats.quente > 1 ? 's' : ''} merece${stats.quente > 1 ? 'm' : ''} atenção prioritária!`}
      </div>
    </Container>
  )
}
