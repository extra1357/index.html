'use client'

export const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminTable,
  AdminSearchBar,
  AdminIcons,
} from '@/components/admin'

interface Corretor {
  id: string
  nome: string
  email: string
  telefone: string
  creci: string
  ativo: boolean
  comissaoPadrao: string
  _count?: {
    vendas: number
    comissoes: number
    leads: number
    alugueis: number
  }
}

export default function CorretoresPage() {
  const [corretores, setCorretores] = useState<Corretor[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')

  useEffect(() => {
    fetchCorretores()
  }, [])

  const fetchCorretores = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/corretores')
      const data = await res.json()
      
      // Aceita ambos formatos: array direto OU {success, data}
      if (Array.isArray(data)) {
        setCorretores(data)
      } else if (data.success && data.data) {
        setCorretores(data.data)
      } else if (Array.isArray(data.corretores)) {
        setCorretores(data.corretores)
      } else {
        console.error('Formato inesperado:', data)
        setCorretores([])
      }
    } catch (error: any) {
      console.error('Erro:', error)
      setCorretores([])
    } finally {
      setLoading(false)
    }
  }

  const corretoresFiltrados = corretores.filter(corretor => {
    const matchStatus = filtroStatus === 'todos' || 
      (filtroStatus === 'ativo' && corretor.ativo) ||
      (filtroStatus === 'inativo' && !corretor.ativo)
    
    const matchBusca = busca === '' ||
      corretor.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      corretor.email?.toLowerCase().includes(busca.toLowerCase()) ||
      corretor.creci?.toLowerCase().includes(busca.toLowerCase())
    
    return matchStatus && matchBusca
  })

  const stats = {
    total: corretores.length,
    ativos: corretores.filter(c => c.ativo).length,
    vendas: corretores.reduce((acc: any, c: any) => acc + (c._count?.vendas || 0), 0),
    comissoes: corretores.reduce((acc: any, c: any) => acc + (c._count?.comissoes || 0), 0)
  }

  const formatPhone = (phone: string) => {
    return phone?.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') || phone
  }

  const columns = [
    {
      key: 'nome',
      header: 'Corretor',
      render: (corretor: Corretor) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {corretor.nome?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{corretor.nome}</p>
            <p className="text-sm text-slate-500">{corretor.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'creci',
      header: 'CRECI',
      render: (corretor: Corretor) => (
        <span className="font-semibold text-violet-600">{corretor.creci}</span>
      )
    },
    {
      key: 'telefone',
      header: 'Contato',
      render: (corretor: Corretor) => (
        <span className="text-slate-600">{formatPhone(corretor.telefone)}</span>
      )
    },
    {
      key: 'comissao',
      header: 'Comissão',
      render: (corretor: Corretor) => (
        <span className="font-semibold text-emerald-600">
          {parseFloat(corretor.comissaoPadrao || '0')}%
        </span>
      )
    },
    {
      key: 'performance',
      header: 'Performance',
      render: (corretor: Corretor) => (
        <div className="flex gap-4 text-sm">
          <span><strong className="text-violet-600">{corretor._count?.vendas || 0}</strong> vendas</span>
          <span><strong className="text-emerald-600">{corretor._count?.leads || 0}</strong> leads</span>
        </div>
      )
    },
    {
      key: 'ativo',
      header: 'Status',
      render: (corretor: Corretor) => (
        <AdminBadge variant={corretor.ativo ? 'success' : 'danger'}>
          {corretor.ativo ? '✓ Ativo' : '✗ Inativo'}
        </AdminBadge>
      )
    },
    {
      key: 'acoes',
      header: 'Ações',
      className: 'text-right',
      render: (corretor: Corretor) => (
        <Link href={`/admin/corretores/${corretor.id}`}>
          <AdminButton variant="ghost" size="sm" icon={<AdminIcons.Eye />}>
            Detalhes
          </AdminButton>
        </Link>
      )
    },
  ]

  // Ícone
  const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Corretores"
        subtitle="Gerenciamento da equipe de vendas"
        icon={<UsersIcon />}
        actions={
          <Link href="/admin/corretores/novo">
            <AdminButton icon={<AdminIcons.Plus />}>
              Novo Corretor
            </AdminButton>
          </Link>
        }
      />

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard className="text-center">
          <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-sm text-slate-500">Total</p>
        </AdminCard>
        <AdminCard className="text-center">
          <p className="text-3xl font-bold text-emerald-600">{stats.ativos}</p>
          <p className="text-sm text-slate-500">Ativos</p>
        </AdminCard>
        <AdminCard className="text-center">
          <p className="text-3xl font-bold text-violet-600">{stats.vendas}</p>
          <p className="text-sm text-slate-500">Vendas</p>
        </AdminCard>
        <AdminCard className="text-center">
          <p className="text-3xl font-bold text-amber-600">{stats.comissoes}</p>
          <p className="text-sm text-slate-500">Comissões</p>
        </AdminCard>
      </div>

      {/* Filtros */}
      <AdminCard>
        <div className="flex flex-col sm:flex-row gap-4">
          <AdminSearchBar
            value={busca}
            onChange={setBusca}
            placeholder="Buscar por nome, email ou CRECI..."
            className="flex-1"
          />
          <select
            value={filtroStatus}
            onChange={(e: any) => setFiltroStatus(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value="todos">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>
      </AdminCard>

      {/* Tabela */}
      <AdminTable
        columns={columns}
        data={corretoresFiltrados}
        loading={loading}
        emptyMessage="Nenhum corretor encontrado"
      />
    </div>
  )
}
