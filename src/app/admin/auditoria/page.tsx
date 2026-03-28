'use client';

export const dynamic = 'force-dynamic';


import { useState, useEffect, useRef } from 'react';
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminTable,
  AdminSearchBar,
  AdminIcons,
} from '@/components/admin';

interface Auditoria {
  id: string;
  acao: string;
  tabela: string;
  registroId: string | null;
  usuario: string;
  dados: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export default function AuditoriaPage() {
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ acoes: [] as string[], tabelas: [] as string[] });
  
  // Filtros
  const [acao, setAcao] = useState('');
  const [tabela, setTabela] = useState('');
  const [usuario, setUsuario] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAuditorias();
  }, []);

  const fetchAuditorias = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (acao) params.append('acao', acao);
      if (tabela) params.append('tabela', tabela);
      if (usuario) params.append('usuario', usuario);
      if (dataInicio) params.append('dataInicio', dataInicio);
      if (dataFim) params.append('dataFim', dataFim);

      const res = await fetch(`/api/auditorias?${params}`);
      const data = await res.json();

      if (data.success) {
        setAuditorias(data.data);
        setFiltros(data.filtros);
      }
    } catch (error: any) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    fetchAuditorias();
  };

  const limparFiltros = () => {
    setAcao('');
    setTabela('');
    setUsuario('');
    setDataInicio('');
    setDataFim('');
    setTimeout(fetchAuditorias, 100);
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleExportarExcel = () => {
    const headers = ['Data/Hora', 'Ação', 'Tabela', 'Usuário', 'Registro ID', 'IP'];
    const rows = auditorias.map(a => [
      new Date(a.createdAt).toLocaleString('pt-BR'),
      a.acao,
      a.tabela,
      a.usuario,
      a.registroId || '-',
      a.ip || '-'
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(r => r.join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const getAcaoBadge = (acao: string) => {
    const variants: Record<string, 'success' | 'danger' | 'warning' | 'info' | 'default'> = {
      CREATE: 'success',
      UPDATE: 'warning',
      DELETE: 'danger',
      LOGIN: 'info',
      LOGOUT: 'default',
    };
    return variants[acao] || 'default';
  };

  const columns = [
    {
      key: 'createdAt',
      header: 'Data/Hora',
      render: (item: Auditoria) => (
        <span className="text-sm text-slate-600">{formatDate(item.createdAt)}</span>
      )
    },
    {
      key: 'acao',
      header: 'Ação',
      render: (item: Auditoria) => (
        <AdminBadge variant={getAcaoBadge(item.acao)}>{item.acao}</AdminBadge>
      )
    },
    {
      key: 'tabela',
      header: 'Tabela',
      render: (item: Auditoria) => (
        <span className="font-medium text-slate-800">{item.tabela}</span>
      )
    },
    {
      key: 'usuario',
      header: 'Usuário',
      render: (item: Auditoria) => (
        <span className="text-slate-600">{item.usuario}</span>
      )
    },
    {
      key: 'registroId',
      header: 'Registro',
      render: (item: Auditoria) => (
        <span className="text-xs font-mono text-slate-500">
          {item.registroId ? item.registroId.substring(0, 8) + '...' : '-'}
        </span>
      )
    },
    {
      key: 'ip',
      header: 'IP',
      render: (item: Auditoria) => (
        <span className="text-xs text-slate-500">{item.ip || '-'}</span>
      )
    },
    {
      key: 'dados',
      header: 'Dados',
      render: (item: Auditoria) => (
        item.dados ? (
          <button
            onClick={() => alert(JSON.stringify(JSON.parse(item.dados!), null, 2))}
            className="text-violet-600 hover:text-violet-800 text-sm font-medium"
          >
            Ver detalhes
          </button>
        ) : (
          <span className="text-slate-400">-</span>
        )
      )
    },
  ];

  // Ícone
  const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    </svg>
  );

  const PrintIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>
    </svg>
  );

  const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
    </svg>
  );

  return (
    <>
      {/* Estilos para impressão */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="space-y-6">
        <AdminPageHeader
          title="Auditoria do Sistema"
          subtitle="Histórico de ações e alterações"
          icon={<ShieldIcon />}
          actions={
            <div className="flex gap-2 no-print">
              <AdminButton variant="secondary" onClick={handleImprimir} icon={<PrintIcon />}>
                Imprimir
              </AdminButton>
              <AdminButton variant="success" onClick={handleExportarExcel} icon={<DownloadIcon />}>
                Exportar Excel
              </AdminButton>
            </div>
          }
        />

        {/* Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 no-print">
          <AdminCard className="text-center">
            <p className="text-3xl font-bold text-slate-800">{auditorias.length}</p>
            <p className="text-sm text-slate-500">Total de Registros</p>
          </AdminCard>
          <AdminCard className="text-center">
            <p className="text-3xl font-bold text-emerald-600">
              {auditorias.filter(a => a.acao === 'CREATE').length}
            </p>
            <p className="text-sm text-slate-500">Criações</p>
          </AdminCard>
          <AdminCard className="text-center">
            <p className="text-3xl font-bold text-amber-600">
              {auditorias.filter(a => a.acao === 'UPDATE').length}
            </p>
            <p className="text-sm text-slate-500">Atualizações</p>
          </AdminCard>
          <AdminCard className="text-center">
            <p className="text-3xl font-bold text-red-600">
              {auditorias.filter(a => a.acao === 'DELETE').length}
            </p>
            <p className="text-sm text-slate-500">Exclusões</p>
          </AdminCard>
        </div>

        {/* Filtros */}
        <AdminCard className="no-print">
          <h3 className="font-semibold text-slate-800 mb-4">🔍 Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ação</label>
              <select
                value={acao}
                onChange={(e: any) => setAcao(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="">Todas</option>
                {filtros.acoes.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tabela</label>
              <select
                value={tabela}
                onChange={(e: any) => setTabela(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="">Todas</option>
                {filtros.tabelas.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Usuário</label>
              <input
                type="text"
                value={usuario}
                onChange={(e: any) => setUsuario(e.target.value)}
                placeholder="Nome do usuário"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data Início</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e: any) => setDataInicio(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data Fim</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e: any) => setDataFim(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
            <div className="flex items-end gap-2">
              <AdminButton onClick={aplicarFiltros} className="flex-1">
                Filtrar
              </AdminButton>
              <AdminButton variant="ghost" onClick={limparFiltros}>
                Limpar
              </AdminButton>
            </div>
          </div>
        </AdminCard>

        {/* Tabela */}
        <div ref={tableRef} className="print-area">
          <AdminTable
            columns={columns}
            data={auditorias}
            loading={loading}
            emptyMessage="Nenhum registro de auditoria encontrado"
          />
        </div>
      </div>
    </>
  );
}
