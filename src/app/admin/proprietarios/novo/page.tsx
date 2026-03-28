'use client'

export const dynamic = 'force-dynamic';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Container from '@/components/ui/Container'

export default function NovoProprietarioPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    tipo: 'PF', // PF = Pessoa Física, PJ = Pessoa Jurídica
    cpf: '',
    cnpj: '',
    endereco: '',
    observacoes: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validações básicas
    if (!formData.nome || !formData.email || !formData.telefone) {
      setError('Nome, email e telefone são obrigatórios')
      setLoading(false)
      return
    }

    if (formData.tipo === 'PF' && !formData.cpf) {
      setError('CPF é obrigatório para Pessoa Física')
      setLoading(false)
      return
    }

    if (formData.tipo === 'PJ' && !formData.cnpj) {
      setError('CNPJ é obrigatório para Pessoa Jurídica')
      setLoading(false)
      return
    }

    // Preparar dados para envio
    const dados = {
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      tipo: formData.tipo,
      cpf: formData.tipo === 'PF' ? formData.cpf : null,
      cnpj: formData.tipo === 'PJ' ? formData.cnpj : null,
      endereco: formData.endereco || null,
      observacoes: formData.observacoes || null
    }

    try {
      const response = await fetch('/api/proprietarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ${response.status}`)
      }

      // Sucesso - redirecionar para lista
      router.push('/admin/proprietarios')
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar proprietário')
      setLoading(false)
    }
  }

  return (
    <Container
      title="➕ Novo Proprietário"
      subtitle="Cadastre um novo proprietário de imóveis"
    >
      <div className="bg-white rounded-xl shadow-sm border p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Pessoa */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Tipo de Pessoa <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  value="PF"
                  checked={formData.tipo === 'PF'}
                  onChange={handleChange}
                  className="mr-2 w-4 h-4 text-purple-600"
                />
                <span className="text-sm">Pessoa Física</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  value="PJ"
                  checked={formData.tipo === 'PJ'}
                  onChange={handleChange}
                  className="mr-2 w-4 h-4 text-purple-600"
                />
                <span className="text-sm">Pessoa Jurídica</span>
              </label>
            </div>
          </div>

          {/* Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-semibold mb-2">
              Nome Completo {formData.tipo === 'PJ' && '/ Razão Social'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={formData.tipo === 'PF' ? 'João da Silva' : 'Empresa Imóveis LTDA'}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="email@exemplo.com"
            />
          </div>

          {/* Telefone */}
          <div>
            <label htmlFor="telefone" className="block text-sm font-semibold mb-2">
              Telefone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="(00) 00000-0000"
            />
          </div>

          {/* CPF ou CNPJ */}
          {formData.tipo === 'PF' ? (
            <div>
              <label htmlFor="cpf" className="block text-sm font-semibold mb-2">
                CPF <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>
          ) : (
            <div>
              <label htmlFor="cnpj" className="block text-sm font-semibold mb-2">
                CNPJ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="cnpj"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
            </div>
          )}

          {/* Endereço */}
          <div>
            <label htmlFor="endereco" className="block text-sm font-semibold mb-2">
              Endereço
            </label>
            <input
              type="text"
              id="endereco"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Rua, número, bairro, cidade - UF"
            />
          </div>

          {/* Observações */}
          <div>
            <label htmlFor="observacoes" className="block text-sm font-semibold mb-2">
              Observações
            </label>
            <textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Informações adicionais sobre o proprietário..."
            />
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : '💾 Salvar Proprietário'}
            </button>
            <Link
              href="/admin/proprietarios"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </Container>
  )
}
