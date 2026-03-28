'use client'

export const dynamic = 'force-dynamic';


import { useEffect, useState } from 'react'
import Link from 'next/link'
import Container from '@/components/ui/Container'

export default function ProprietariosPage() {
  const [props, setProps] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetch('/api/proprietarios')
      .then(r => {
        if (!r.ok) throw new Error(`Erro ${r.status}`)
        return r.json()
      })
      .then((data: any) => {
        setProps(Array.isArray(data) ? data : (data.proprietarios || []))
        setLoading(false)
      })
      .catch(err => {
        setError('Erro ao carregar proprietários')
        setLoading(false)
      })
  }, [])

  return (
    <Container
      title="👤 Proprietários"
      subtitle="Gerencie os proprietários de imóveis"
      action={
        <Link href="/admin/proprietarios/novo" className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-md">
          + Novo Proprietário
        </Link>
      }
    >
      {loading && <div className="text-center py-12"><div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"><p className="text-red-600">{error}</p></div>}
      {!loading && !error && props.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold mb-2">Nenhum proprietário cadastrado</h3>
          <Link href="/admin/proprietarios/novo" className="inline-flex px-6 py-3 bg-purple-600 text-white rounded-lg">Cadastrar Primeiro</Link>
        </div>
      )}
      {!loading && !error && props.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {props.map((p: any) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl mr-4">👤</div>
                <div>
                  <h3 className="font-bold text-lg">{p.nome}</h3>
                  {p.cpf && <p className="text-xs text-gray-500">CPF: {p.cpf}</p>}
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center"><span className="mr-3">✉️</span><span className="truncate">{p.email}</span></div>
                <div className="flex items-center"><span className="mr-3">📱</span><span>{p.telefone}</span></div>
                <div className="flex items-center"><span className="mr-3">🏠</span><span>{p._count?.imoveis || 0} imóveis</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  )
}
