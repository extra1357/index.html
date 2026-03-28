'use client'

export const dynamic = 'force-dynamic';


import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Lead {
  id: string
  nome: string
  email: string
  telefone: string
}

interface Imovel {
  id: string
  tipo: string
  endereco: string
  cidade: string
  estado: string
  preco: string
  codigo: string | null
  disponivel: boolean
  status: string
}

interface Corretor {
  id: string
  nome: string
  creci: string
}

export default function NovaConsultaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [erro, setErro] = useState('')

  const [leads, setLeads] = useState<Lead[]>([])
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [corretores, setCorretores] = useState<Corretor[]>([])

  const [formData, setFormData] = useState({
    leadId: '',
    imovelId: '',
    corretorId: '',
    dataAgendada: '',
    tipo: 'visita',
    status: 'agendada',
    observacoes: ''
  })

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoadingData(true)
      
      // Buscar leads
      const resLeads = await fetch('/api/leads')
      const dataLeads = await resLeads.json()
      if (dataLeads.success) {
        setLeads(dataLeads.data || [])
      }

      // Buscar imóveis
      const resImoveis = await fetch('/api/imoveis')
      const dataImoveis = await resImoveis.json()
      if (dataImoveis.success) {
        // Filtrar apenas imóveis disponíveis
        const imoveisDisponiveis = (dataImoveis.data || []).filter(
          (imovel: Imovel) => imovel.disponivel === true && imovel.status === 'ATIVO'
        )
        setImoveis(imoveisDisponiveis)
      }

      // Buscar corretores
      const resCorretores = await fetch('/api/corretores')
      const dataCorretores = await resCorretores.json()
      if (dataCorretores.success) {
        setCorretores(dataCorretores.data || [])
      }

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
      setErro('Erro ao carregar dados do formulário')
    } finally {
      setLoadingData(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    // Validação
    if (!formData.leadId || !formData.imovelId) {
      setErro('Cliente e imóvel são obrigatórios!')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/consultas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dataAgendada: formData.dataAgendada ? new Date(formData.dataAgendada).toISOString() : null,
          corretorId: formData.corretorId || null
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Consulta agendada com sucesso!')
        router.push('/admin/consultas')
      } else {
        setErro(data.error || 'Erro ao agendar consulta')
      }

    } catch (error: any) {
      console.error('Erro:', error)
      setErro('Erro ao agendar consulta')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-6 animate-pulse">📅</div>
          <p className="text-2xl font-black text-white uppercase tracking-widest">
            Carregando dados...
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
                NOVA CONSULTA
              </h1>
              <p className="text-purple-400 font-black text-lg uppercase tracking-widest mt-2">
                Agende uma visita ou consulta
              </p>
            </div>
            <Link 
              href="/admin/consultas"
              className="bg-purple-400 text-black px-8 py-4 font-black uppercase hover:bg-purple-300 transition-all text-xl"
            >
              ← VOLTAR
            </Link>
          </div>
        </div>
      </div>

      {/* ERRO */}
      {erro && (
        <div className="mb-8 bg-red-500 text-white p-6 border-l-8 border-red-700">
          <p className="font-black text-xl">❌ {erro}</p>
        </div>
      )}

      {/* AVISOS */}
      {leads.length === 0 && (
        <div className="mb-8 bg-yellow-500 text-black p-6 border-l-8 border-yellow-700">
          <p className="font-black text-xl mb-2">⚠️ Nenhum lead cadastrado!</p>
          <Link href="/admin/leads/novo" className="underline font-bold">
            Cadastrar novo lead →
          </Link>
        </div>
      )}

      {imoveis.length === 0 && (
        <div className="mb-8 bg-orange-500 text-black p-6 border-l-8 border-orange-700">
          <p className="font-black text-xl mb-2">⚠️ Nenhum imóvel disponível!</p>
          <Link href="/admin/imoveis/novo" className="underline font-bold">
            Cadastrar novo imóvel →
          </Link>
        </div>
      )}

      {/* FORMULÁRIO */}
      <form onSubmit={handleSubmit} className="bg-white text-black p-8 max-w-4xl">
        {/* DADOS DA CONSULTA */}
        <div className="mb-8">
          <h2 className="text-3xl font-black uppercase mb-6 border-b-4 border-purple-400 pb-4">
            📅 DADOS DA CONSULTA
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cliente */}
            <div className="lg:col-span-2">
              <label className="block font-black text-xs uppercase mb-2">
                Cliente (Lead) *
              </label>
              <select
                name="leadId"
                value={formData.leadId}
                onChange={handleChange}
                required
                className="w-full border-4 border-black p-4 font-bold uppercase text-sm"
              >
                <option value="">SELECIONE O CLIENTE</option>
                {leads.map((lead: any) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.nome} - {lead.email} - {lead.telefone}
                  </option>
                ))}
              </select>
            </div>

            {/* Imóvel */}
            <div className="lg:col-span-2">
              <label className="block font-black text-xs uppercase mb-2">
                Imóvel *
              </label>
              <select
                name="imovelId"
                value={formData.imovelId}
                onChange={handleChange}
                required
                className="w-full border-4 border-black p-4 font-bold uppercase text-sm"
              >
                <option value="">SELECIONE O IMÓVEL</option>
                {imoveis.map((imovel: any) => (
                  <option key={imovel.id} value={imovel.id}>
                    {imovel.tipo} - {imovel.endereco}, {imovel.cidade}/{imovel.estado} - 
                    R$ {parseFloat(imovel.preco || '0').toLocaleString('pt-BR')}
                    {imovel.codigo && ` (${imovel.codigo})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Corretor (Opcional) */}
            <div className="lg:col-span-2">
              <label className="block font-black text-xs uppercase mb-2">
                Corretor Responsável (Opcional)
              </label>
              <select
                name="corretorId"
                value={formData.corretorId}
                onChange={handleChange}
                className="w-full border-4 border-black p-4 font-bold uppercase text-sm"
              >
                <option value="">SEM CORRETOR</option>
                {corretores.map((corretor: any) => (
                  <option key={corretor.id} value={corretor.id}>
                    {corretor.nome} - CRECI: {corretor.creci}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo */}
            <div>
              <label className="block font-black text-xs uppercase mb-2">
                Tipo de Consulta
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full border-4 border-black p-4 font-bold uppercase text-sm"
              >
                <option value="visita">VISITA</option>
                <option value="avaliacao">AVALIAÇÃO</option>
                <option value="proposta">PROPOSTA</option>
                <option value="negociacao">NEGOCIAÇÃO</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block font-black text-xs uppercase mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border-4 border-black p-4 font-bold uppercase text-sm"
              >
                <option value="agendada">AGENDADA</option>
                <option value="confirmada">CONFIRMADA</option>
                <option value="realizada">REALIZADA</option>
                <option value="cancelada">CANCELADA</option>
                <option value="remarcada">REMARCADA</option>
              </select>
            </div>

            {/* Data Agendada */}
            <div className="lg:col-span-2">
              <label className="block font-black text-xs uppercase mb-2">
                Data e Hora do Agendamento
              </label>
              <input
                type="datetime-local"
                name="dataAgendada"
                value={formData.dataAgendada}
                onChange={handleChange}
                className="w-full border-4 border-black p-4 font-bold uppercase text-sm"
              />
            </div>

            {/* Observações */}
            <div className="lg:col-span-2">
              <label className="block font-black text-xs uppercase mb-2">
                Observações
              </label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows={4}
                className="w-full border-4 border-black p-4 font-bold"
                placeholder="Informações adicionais sobre a consulta..."
              />
            </div>
          </div>
        </div>

        {/* BOTÕES */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || leads.length === 0 || imoveis.length === 0}
            className="flex-1 bg-gradient-to-r from-purple-400 to-pink-500 text-black px-8 py-6 font-black text-xl uppercase hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ AGENDANDO...' : '✓ AGENDAR CONSULTA'}
          </button>
          
          <Link
            href="/admin/consultas"
            className="bg-gray-800 text-white px-8 py-6 font-black text-xl uppercase hover:bg-gray-700 transition-all"
          >
            ✗ CANCELAR
          </Link>
        </div>
      </form>
    </div>
  )
}
