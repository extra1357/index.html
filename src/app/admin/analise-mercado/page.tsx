'use client'

export const dynamic = 'force-dynamic';


import { useEffect, useState } from 'react'
import Link from 'next/link'
import Container from '@/components/ui/Container'

interface Analise {
  id: string
  cidade: string
  estado: string
  valorM2: number
  valorMinimo?: number
  valorMaximo?: number
  tendencia: 'alta' | 'baixa' | 'estavel' | string
  fonte?: string
  observacoes?: string
  dataAnalise: string
  _count?: {
    imoveis: number
  }
}

interface AnaliseDinamica {
  cidade: string
  estado: string
  totalImoveis: number
  valorM2Medio: number
  valorMinimo: number
  valorMaximo: number
  precoMedio: number
  metragemMedia: number
  tiposMaisComuns: string[]
}

export default function AnaliseMercadoPage() {
  const [analisesSalvas, setAnalisesSalvas] = useState<Analise[]>([])
  const [analisesGeradas, setAnalisesGeradas] = useState<AnaliseDinamica[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [gerandoAnalise, setGerandoAnalise] = useState(false)
  const [mostrarGeradas, setMostrarGeradas] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Buscar análises salvas
      const analiseResponse = await fetch('/api/analise-mercado')
      if (analiseResponse.ok) {
        const analiseData = await analiseResponse.json()
        setAnalisesSalvas(analiseData.analises || analiseData.data || [])
      }

      // Buscar e analisar imóveis
      const imoveisResponse = await fetch('/api/imoveis')
      if (imoveisResponse.ok) {
        const imoveisData = await imoveisResponse.json()
        const imoveis = Array.isArray(imoveisData) ? imoveisData : (imoveisData.imoveis || [])
        
        // Gerar análises dinâmicas por cidade
        const analisesPorCidade = gerarAnalisesPorCidade(imoveis)
        setAnalisesGeradas(analisesPorCidade)
      }

    } catch (err: any) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar análises de mercado')
    } finally {
      setLoading(false)
    }
  }

  const gerarAnalisesPorCidade = (imoveis: any[]): AnaliseDinamica[] => {
    const grupos: { [key: string]: any[] } = {}

    // Agrupar imóveis por cidade
    imoveis.forEach(imovel => {
      const chave = `${imovel.cidade}-${imovel.estado}`
      if (!grupos[chave]) {
        grupos[chave] = []
      }
      grupos[chave].push(imovel)
    })

    // Calcular estatísticas para cada cidade
    return Object.keys(grupos).map(chave => {
      const [cidade, estado] = chave.split('-')
      const imoveisCidade = grupos[chave]
      
      const precos = imoveisCidade.map((i: any) => Number(i.preco))
      const metragens = imoveisCidade.map((i: any) => Number(i.metragem))
      const valoresM2 = imoveisCidade
        .filter((i: any) => i.metragem > 0)
        .map((i: any) => Number(i.preco) / Number(i.metragem))

      // Contar tipos mais comuns
      const tiposCount: { [key: string]: number } = {}
      imoveisCidade.forEach((i: any) => {
        tiposCount[i.tipo] = (tiposCount[i.tipo] || 0) + 1
      })
      const tiposMaisComuns = Object.entries(tiposCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tipo]) => tipo)

      return {
        cidade,
        estado,
        totalImoveis: imoveisCidade.length,
        valorM2Medio: valoresM2.length > 0 ? valoresM2.reduce((a: any, b: any) => a + b, 0) / valoresM2.length : 0,
        valorMinimo: Math.min(...precos),
        valorMaximo: Math.max(...precos),
        precoMedio: precos.reduce((a: any, b: any) => a + b, 0) / precos.length,
        metragemMedia: metragens.reduce((a: any, b: any) => a + b, 0) / metragens.length,
        tiposMaisComuns
      }
    }).sort((a, b) => b.totalImoveis - a.totalImoveis)
  }

  const salvarAnaliseGerada = async (analise: AnaliseDinamica) => {
    setGerandoAnalise(true)
    try {
      // Determinar tendência baseada em dados
      const tendencia = analise.valorM2Medio > 3000 ? 'alta' : 
                       analise.valorM2Medio < 1500 ? 'baixa' : 'estavel'

      const dados = {
        cidade: analise.cidade,
        estado: analise.estado,
        valorM2: Math.round(analise.valorM2Medio),
        valorMinimo: Math.round(analise.valorMinimo),
        valorMaximo: Math.round(analise.valorMaximo),
        tendencia,
        fonte: 'Análise Automática - Base de Dados Interna',
        observacoes: `Análise baseada em ${analise.totalImoveis} imóveis. Tipos predominantes: ${analise.tiposMaisComuns.join(', ')}. Metragem média: ${Math.round(analise.metragemMedia)}m².`
      }

      const response = await fetch('/api/analise-mercado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      })

      if (response.ok) {
        alert('✅ Análise salva com sucesso!')
        carregarDados()
        setMostrarGeradas(false)
      } else {
        throw new Error('Erro ao salvar análise')
      }
    } catch (err: any) {
      alert('❌ Erro ao salvar análise')
    } finally {
      setGerandoAnalise(false)
    }
  }

  const formatarPreco = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  if (loading) {
    return (
      <Container title="📊 Análise de Mercado" subtitle="Carregando análises...">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Container>
    )
  }

  const ultimaAnalise = analisesSalvas.length > 0 ? analisesSalvas[0] : null

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Análise de Mercado</h1>
            <p className="text-gray-600">Análise inteligente baseada em dados reais de imóveis</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setMostrarGeradas(!mostrarGeradas)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              {mostrarGeradas ? '📋 Ver Salvas' : '🔍 Gerar Análises'}
            </button>
            <Link
              href="/admin/analise-mercado/nova"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              ➕ Nova Análise Manual
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <p className="text-red-600 font-semibold">❌ {error}</p>
          </div>
        )}

        {/* Análises Geradas Dinamicamente */}
        {mostrarGeradas && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">🤖 Análises Geradas Automaticamente</h2>
            {analisesGeradas.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">Nenhum imóvel cadastrado para gerar análises</p>
                <Link href="/admin/imoveis/novo" className="text-purple-600 hover:underline font-semibold">
                  Cadastrar primeiro imóvel
                </Link>
              </div>
            ) : (
              <div className="grid gap-6">
                {analisesGeradas.map((analise: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {analise.cidade} / {analise.estado}
                          </h3>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {analise.totalImoveis} imóveis
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Valor/m²</p>
                            <p className="text-2xl font-bold text-green-600">
                              {formatarPreco(analise.valorM2Medio)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Preço Médio</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {formatarPreco(analise.precoMedio)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Faixa de Preço</p>
                            <p className="text-sm font-semibold text-gray-700">
                              {formatarPreco(analise.valorMinimo)} - {formatarPreco(analise.valorMaximo)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Metragem Média</p>
                            <p className="text-2xl font-bold text-purple-600">
                              {Math.round(analise.metragemMedia)}m²
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Tipos mais comuns:</span> {analise.tiposMaisComuns.join(', ')}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => salvarAnaliseGerada(analise)}
                        disabled={gerandoAnalise}
                        className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                      >
                        💾 Salvar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Destaque - Última Análise */}
        {!mostrarGeradas && ultimaAnalise && (
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-purple-200 text-sm font-semibold mb-2">📍 Última Análise</p>
                <h2 className="text-4xl font-bold">{ultimaAnalise.cidade} / {ultimaAnalise.estado}</h2>
              </div>
              <div className={`px-4 py-2 rounded-full font-bold text-sm ${
                ultimaAnalise.tendencia === 'alta' ? 'bg-green-500' :
                ultimaAnalise.tendencia === 'baixa' ? 'bg-red-500' : 'bg-yellow-500'
              }`}>
                {ultimaAnalise.tendencia === 'alta' ? '📈 ALTA' :
                 ultimaAnalise.tendencia === 'baixa' ? '📉 BAIXA' : '➡️ ESTÁVEL'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <p className="text-purple-200 text-xs uppercase font-semibold mb-2">Valor por m²</p>
                <p className="text-3xl font-bold">{formatarPreco(ultimaAnalise.valorM2)}</p>
              </div>
              {ultimaAnalise.valorMinimo && ultimaAnalise.valorMaximo && (
                <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                  <p className="text-purple-200 text-xs uppercase font-semibold mb-2">Faixa de Valores</p>
                  <p className="text-lg font-bold">
                    {formatarPreco(ultimaAnalise.valorMinimo)} - {formatarPreco(ultimaAnalise.valorMaximo)}
                  </p>
                </div>
              )}
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <p className="text-purple-200 text-xs uppercase font-semibold mb-2">Data da Análise</p>
                <p className="text-lg font-bold">
                  {new Date(ultimaAnalise.dataAnalise).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {ultimaAnalise.observacoes && (
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <p className="text-purple-200 text-xs uppercase font-semibold mb-3">💡 Observações</p>
                <p className="text-white font-medium leading-relaxed">{ultimaAnalise.observacoes}</p>
              </div>
            )}

            {ultimaAnalise.fonte && (
              <p className="mt-4 text-sm text-purple-200">
                <span className="font-semibold">Fonte:</span> {ultimaAnalise.fonte}
              </p>
            )}
          </div>
        )}

        {/* Lista de Todas as Análises Salvas */}
        {!mostrarGeradas && (
          <div>
            <h2 className="text-2xl font-bold mb-6">📋 Histórico de Análises</h2>
            {analisesSalvas.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2">Nenhuma análise salva</h3>
                <p className="text-gray-600 mb-4">Clique em "Gerar Análises" para criar análises automáticas baseadas nos seus imóveis</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {analisesSalvas.map((analise: Analise) => (
                  <div key={analise.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-gray-900">
                            {analise.cidade} / {analise.estado}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            analise.tendencia === 'alta' ? 'bg-green-100 text-green-700' :
                            analise.tendencia === 'baixa' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {analise.tendencia?.toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Valor/m²</p>
                            <p className="text-lg font-bold text-green-600">
                              {formatarPreco(analise.valorM2)}
                            </p>
                          </div>
                          {analise.valorMinimo && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Mínimo</p>
                              <p className="text-lg font-semibold">
                                {formatarPreco(analise.valorMinimo)}
                              </p>
                            </div>
                          )}
                          {analise.valorMaximo && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Máximo</p>
                              <p className="text-lg font-semibold">
                                {formatarPreco(analise.valorMaximo)}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Data</p>
                            <p className="text-sm font-medium">
                              {new Date(analise.dataAnalise).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>

                        {analise.observacoes && (
                          <p className="text-sm text-gray-600 italic">"{analise.observacoes}"</p>
                        )}
                        {analise.fonte && (
                          <p className="text-xs text-gray-500 mt-2">Fonte: {analise.fonte}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
