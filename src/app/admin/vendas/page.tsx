'use client';

export const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function VendasPage() {
  const [vendas, setVendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vendas')
      .then((res: any) => res.json())
      .then((data: any) => {
        setVendas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const statusColors: Record<string, string> = {
    proposta: 'bg-yellow-100 text-yellow-800',
    documentacao: 'bg-blue-100 text-blue-800',
    assinatura: 'bg-purple-100 text-purple-800',
    registro: 'bg-indigo-100 text-indigo-800',
    concluida: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800'
  };

  const statusLabels: Record<string, string> = {
    proposta: 'Proposta',
    documentacao: 'Documentação',
    assinatura: 'Assinatura',
    registro: 'Registro',
    concluida: 'Concluída',
    cancelada: 'Cancelada'
  };

  const totalVendas = vendas.reduce((acc: any, v: any) => acc + Number(v.valorVenda || 0), 0);
  const totalComissoes = vendas.reduce((acc: any, v: any) => acc + Number(v.valorComissao || 0), 0);
  const vendasConcluidas = vendas.filter(v => v.status === 'concluida').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Vendas</h1>
            <p className="text-gray-600">Controle de vendas de imóveis</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              ← Voltar
            </Link>
            <Link
              href="/admin/vendas/nova"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              + Nova Venda
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Total em Vendas</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalVendas)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Comissões Geradas</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalComissoes)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Vendas em Andamento</p>
            <p className="text-3xl font-bold text-yellow-600">
              {vendas.filter(v => !['concluida', 'cancelada'].includes(v.status)).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Vendas Concluídas</p>
            <p className="text-3xl font-bold text-green-600">{vendasConcluidas}</p>
          </div>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imóvel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comprador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Corretor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comissão</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vendas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Nenhuma venda registrada ainda.
                    <Link href="/admin/vendas/nova" className="text-green-600 hover:underline ml-2">
                      Registrar primeira venda
                    </Link>
                  </td>
                </tr>
              ) : (
                vendas.map((venda: any) => (
                  <tr key={venda.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{venda.imovel?.tipo}</p>
                        <p className="text-sm text-gray-500">{venda.imovel?.endereco}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{venda.lead?.nome}</p>
                      <p className="text-sm text-gray-500">{venda.lead?.telefone}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{venda.corretor?.nome}</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">
                      {formatCurrency(Number(venda.valorVenda))}
                    </td>
                    <td className="px-6 py-4 text-green-600 font-semibold">
                      {formatCurrency(Number(venda.valorComissao))}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[venda.status] || 'bg-gray-100'}`}>
                        {statusLabels[venda.status] || venda.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(venda.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
