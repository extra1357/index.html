'use client';

export const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AlugueisPage() {
  const [alugueis, setAlugueis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/alugueis')
      .then((res: any) => res.json())
      .then((data: any) => {
        setAlugueis(Array.isArray(data) ? data : []);
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
    ativo: 'bg-green-100 text-green-800',
    encerrado: 'bg-gray-100 text-gray-800',
    inadimplente: 'bg-red-100 text-red-800',
    renovacao: 'bg-yellow-100 text-yellow-800'
  };

  const totalMensal = alugueis
    .filter(a => a.status === 'ativo')
    .reduce((acc: any, a: any) => acc + Number(a.valorTotal || 0), 0);

  const taxaAdmMensal = alugueis
    .filter(a => a.status === 'ativo')
    .reduce((acc: any, a: any) => acc + (Number(a.valorAluguel || 0) * Number(a.taxaAdministracao || 10) / 100), 0);

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
            <h1 className="text-3xl font-bold text-gray-800">Aluguéis</h1>
            <p className="text-gray-600">Controle de contratos de aluguel</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              ← Voltar
            </Link>
            <Link
              href="/admin/alugueis/novo"
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
            >
              + Novo Contrato
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Contratos Ativos</p>
            <p className="text-3xl font-bold text-green-600">
              {alugueis.filter(a => a.status === 'ativo').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Receita Mensal</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalMensal)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Taxa Adm. Mensal</p>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(taxaAdmMensal)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-sm">Inadimplentes</p>
            <p className="text-3xl font-bold text-red-600">
              {alugueis.filter(a => a.status === 'inadimplente').length}
            </p>
          </div>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imóvel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inquilino</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigência</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {alugueis.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Nenhum contrato de aluguel cadastrado.
                    <Link href="/admin/alugueis/novo" className="text-orange-600 hover:underline ml-2">
                      Cadastrar primeiro contrato
                    </Link>
                  </td>
                </tr>
              ) : (
                alugueis.map((aluguel: any) => (
                  <tr key={aluguel.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{aluguel.imovel?.tipo}</p>
                        <p className="text-sm text-gray-500">{aluguel.imovel?.endereco}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{aluguel.inquilino?.nome}</p>
                      <p className="text-sm text-gray-500">{aluguel.inquilino?.telefone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(Number(aluguel.valorTotal))}
                      </p>
                      <p className="text-xs text-gray-500">
                        Aluguel: {formatCurrency(Number(aluguel.valorAluguel))}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      Dia {aluguel.diaVencimento}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(aluguel.dataInicio)} a {formatDate(aluguel.dataFim)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[aluguel.status] || 'bg-gray-100'}`}>
                        {aluguel.status === 'ativo' ? 'Ativo' : 
                         aluguel.status === 'inadimplente' ? 'Inadimplente' :
                         aluguel.status === 'encerrado' ? 'Encerrado' : aluguel.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/admin/alugueis/${aluguel.id}`}
                        className="text-orange-600 hover:underline"
                      >
                        Ver detalhes
                      </Link>
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
