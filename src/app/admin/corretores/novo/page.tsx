'use client'

export const dynamic = 'force-dynamic';


import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CadastrarCorretor() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    creci: '',
    dataAdmissao: new Date().toISOString().split('T')[0],
    ativo: true,
    banco: '',
    agencia: '',
    conta: '',
    tipoConta: 'corrente',
    pix: '',
    comissaoPadrao: '5',
    observacoes: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    
    // Validação básica
    if (!formData.nome || !formData.email || !formData.telefone || !formData.creci) {
      setErro('Preencha todos os campos obrigatórios!')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/corretores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      // Verificar se a resposta tem conteúdo
      const text = await response.text()
      
      if (!text) {
        throw new Error('Resposta vazia do servidor')
      }

      const data: any = JSON.parse(text)

      if (data.success) {
        alert('✅ Corretor cadastrado com sucesso!')
        router.push('/admin/corretores')
      } else {
        setErro(data.error || 'Erro ao cadastrar corretor')
      }

    } catch (error: any) {
      console.error('Erro:', error)
      setErro('Erro ao cadastrar corretor: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-12">
      {/* HEADER */}
      <div className="mb-12 bg-gradient-to-r from-yellow-400 to-pink-500 p-1">
        <div className="bg-black p-8">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter">
                NOVO CORRETOR
              </h1>
              <p className="text-yellow-400 font-black text-lg uppercase tracking-widest mt-2">
                Cadastro de corretor
              </p>
            </div>
            <Link 
              href="/admin/corretores"
              className="bg-yellow-400 text-black px-8 py-4 font-black uppercase hover:bg-yellow-300 transition-all text-xl"
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

      {/* FORMULÁRIO */}
      <form onSubmit={handleSubmit} className="bg-white text-black p-8">
        {/* DADOS PESSOAIS */}
        <div className="mb-8">
          <h2 className="text-3xl font-black uppercase mb-6 border-b-4 border-yellow-400 pb-4">
            📋 DADOS PESSOAIS
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InputField
              label="Nome Completo *"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
            
            <InputField
              label="E-mail *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <InputField
              label="Telefone *"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              required
            />
            
            <InputField
              label="CPF"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
            />
            
            <InputField
              label="CRECI *"
              name="creci"
              value={formData.creci}
              onChange={handleChange}
              required
            />
            
            <InputField
              label="Data de Admissão *"
              name="dataAdmissao"
              type="date"
              value={formData.dataAdmissao}
              onChange={handleChange}
              required
            />
            
            <InputField
              label="Comissão Padrão (%)"
              name="comissaoPadrao"
              type="number"
              value={formData.comissaoPadrao}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
            />

            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="ativo"
                  checked={formData.ativo}
                  onChange={handleChange}
                  className="w-6 h-6"
                />
                <span className="font-black uppercase text-sm">Corretor Ativo</span>
              </label>
            </div>
          </div>
        </div>

        {/* DADOS BANCÁRIOS */}
        <div className="mb-8">
          <h2 className="text-3xl font-black uppercase mb-6 border-b-4 border-blue-400 pb-4">
            🏦 DADOS BANCÁRIOS
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InputField
              label="Banco"
              name="banco"
              value={formData.banco}
              onChange={handleChange}
              placeholder="Ex: Bradesco"
            />
            
            <InputField
              label="Agência"
              name="agencia"
              value={formData.agencia}
              onChange={handleChange}
              placeholder="Ex: 1234"
            />
            
            <InputField
              label="Conta"
              name="conta"
              value={formData.conta}
              onChange={handleChange}
              placeholder="Ex: 12345-6"
            />
            
            <div>
              <label className="block font-black text-xs uppercase mb-2">
                Tipo de Conta
              </label>
              <select
                name="tipoConta"
                value={formData.tipoConta}
                onChange={handleChange}
                className="w-full border-4 border-black p-4 font-bold uppercase text-sm"
              >
                <option value="corrente">Corrente</option>
                <option value="poupanca">Poupança</option>
              </select>
            </div>
            
            <InputField
              label="Chave PIX"
              name="pix"
              value={formData.pix}
              onChange={handleChange}
              placeholder="CPF, E-mail, Celular ou Chave Aleatória"
              className="lg:col-span-2"
            />
          </div>
        </div>

        {/* OBSERVAÇÕES */}
        <div className="mb-8">
          <h2 className="text-3xl font-black uppercase mb-6 border-b-4 border-pink-400 pb-4">
            📝 OBSERVAÇÕES
          </h2>
          
          <textarea
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            rows={4}
            className="w-full border-4 border-black p-4 font-bold"
            placeholder="Observações gerais sobre o corretor..."
          />
        </div>

        {/* BOTÕES */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-yellow-400 to-pink-500 text-black px-8 py-6 font-black text-xl uppercase hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? '⏳ CADASTRANDO...' : '✓ CADASTRAR CORRETOR'}
          </button>
          
          <Link
            href="/admin/corretores"
            className="bg-gray-800 text-white px-8 py-6 font-black text-xl uppercase hover:bg-gray-700 transition-all"
          >
            ✗ CANCELAR
          </Link>
        </div>
      </form>
    </div>
  )
}

// COMPONENTE DE INPUT
function InputField({ 
  label, 
  className = '',
  ...props 
}: { 
  label: string
  className?: string
  [key: string]: any 
}) {
  return (
    <div className={className}>
      <label className="block font-black text-xs uppercase mb-2">
        {label}
      </label>
      <input
        {...props}
        className="w-full border-4 border-black p-4 font-bold uppercase text-sm placeholder:text-gray-400"
      />
    </div>
  )
}
