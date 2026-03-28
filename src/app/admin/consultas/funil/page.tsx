'use client'

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react'
import { STATUS_LABELS, STATUS_CORES } from '@/types/funil'
import Container from '@/components/ui/Container'
import Link from 'next/link'

export default function FunilVendas() {
  const [consultas, setConsultas] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // Busca os dados da API que criamos para o Funil
    fetch('/api/consultas/funil')
      .then(r => r.json())
      .then(d => {
        // No Prisma, o retorno costuma vir direto ou dentro de .data
        const dados = Array.isArray(d) ? d : (d.data || [])
        setConsultas(dados)
        setLoading(false)
      })
      .catch(err => {
        console.error("Erro ao carregar o Kanban:", err)
        setLoading(false)
      })
  }, [])

  const agruparPorStatus = () => {
    const grupos: any = {}
    Object.keys(STATUS_LABELS).forEach(status => {
      grupos[status] = consultas.filter(c => c.status === status)
    })
    return grupos
  }

  const grupos = agruparPorStatus()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Carregando Funil...</p>
        </div>
      </div>
    )
  }

  return (
    <Container
      title="🎯 Funil de Vendas"
      subtitle="Gestão visual de leads e negociações"
      action={
        <Link href="/admin/consultas" className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-black hover:bg-gray-50 transition-all shadow-sm">
          ← Voltar para Lista
        </Link>
      }
    >
      {/* Quadro Kanban */}
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-4 min-w-max">
          {Object.entries(STATUS_LABELS).map(([status, label]: [string, any]) => (
            <div key={status} className="w-80 flex-shrink-0">
              <div className="bg-gray-100 rounded-xl p-3 min-h-[600px] border border-gray-200 shadow-inner">
                {/* Cabeçalho da Coluna */}
                <div className={`p-3 rounded-lg mb-4 shadow-sm flex items-center justify-between ${STATUS_CORES[status as keyof typeof STATUS_CORES] || 'bg-white text-gray-800'}`}>
                  <span className="font-bold text-xs uppercase tracking-widest">{label}</span>
                  <span className="bg-white/50 px-2 py-0.5 rounded text-[10px] font-black">
                    {grupos[status]?.length || 0}
                  </span>
                </div>

                {/* Lista de Cards */}
                <div className="space-y-3">
                  {grupos[status]?.map((consulta: any) => (
                    <div 
                      key={consulta.id}
                      className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
                          {consulta.imovel?.tipo || 'IMÓVEL'}
                        </span>
                        <span className="text-[9px] text-gray-400 font-mono">
                          ID: {consulta.id.slice(-5).toUpperCase()}
                        </span>
                      </div>

                      {/* Nome do Cliente (Lead) */}
                      <div className="font-bold text-gray-900 text-sm mb-1">
                        {consulta.lead?.nome || 'Cliente não identificado'}
                      </div>

                      {/* Endereço do Imóvel (Substituindo o Título) */}
                      <div className="text-[11px] text-gray-500 leading-tight line-clamp-2">
                        📍 {consulta.imovel?.endereco || 'Interesse Geral / Não especificado'}
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 font-medium">
                          📅 {new Date(consulta.createdAt || consulta.data).toLocaleDateString('pt-BR')}
                        </span>
                        {consulta.imovel?.preco && (
                          <span className="text-xs font-black text-green-600">
                            R$ {consulta.imovel.preco.toLocaleString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {(!grupos[status] || grupos[status].length === 0) && (
                    <div className="text-center text-gray-400 py-12 text-[11px] border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 uppercase tracking-tighter">
                      Sem leads nesta etapa
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  )
}
