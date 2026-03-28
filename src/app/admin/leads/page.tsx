'use client';

export const dynamic = 'force-dynamic';


import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ LÓGICA DE CONEXÃO ORIGINAL PRESERVADA
  useEffect(() => {
    fetch('/api/leads')
      .then(r => {
        if (!r.ok) throw new Error('Falha na comunicação com o banco de dados STR');
        return r.json();
      })
      .then(d => {
        const dados = Array.isArray(d) ? d : (d.leads || []);
        setLeads(dados);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // ✅ ESTATÍSTICAS ORIGINAIS PRESERVADAS
  const stats = {
    total: leads.length,
    quente: leads.filter((l: any) => l.status?.toUpperCase() === 'QUENTE').length,
    morno: leads.filter((l: any) => l.status?.toUpperCase() === 'MORNO').length,
    frio: leads.filter((l: any) => l.status?.toUpperCase() === 'FRIO').length,
  };

  return (
    <div className="p-10 bg-[#f1f5f9] min-h-screen font-sans antialiased text-slate-900">
      {/* Header Estratégico STR */}
      <div className="flex justify-between items-start mb-16 border-l-[12px] border-blue-600 pl-8">
        <div>
          <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-[0.8] text-slate-900">
            Gestão de <br />
            <span className="text-blue-600">Leads</span>
          </h1>
          <p className="font-black text-slate-500 text-sm tracking-[0.3em] uppercase mt-4 italic">
            Sincronização em tempo real / Banco STR PostgreSQL
          </p>
        </div>
        <Link 
          href="/admin/leads/novo" 
          className="bg-slate-900 text-white px-12 py-5 font-black rounded-sm hover:bg-blue-600 transition-all shadow-[10px_10px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 uppercase italic tracking-tighter text-xl"
        >
          + Novo Lead
        </Link>
      </div>

      {/* Alerta de Erro Crítico */}
      {error && (
        <div className="bg-red-600 text-white p-8 mb-12 font-black uppercase tracking-[0.2em] border-[4px] border-slate-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)]">
          [CRITICAL_DATABASE_ERROR]: {error}
        </div>
      )}

      {/* Grid de Stats (Padrão STR Genetics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="bg-white border-[3px] border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,0.08)]">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-4">Total Geral</span>
          <p className="text-5xl font-black text-slate-900 italic tracking-tighter">{stats.total}</p>
        </div>

        <div className="bg-green-400 border-[3px] border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] block mb-4">Oportunidade Quente 🔥</span>
          <p className="text-5xl font-black text-slate-900 italic tracking-tighter">{stats.quente}</p>
        </div>

        <div className="bg-yellow-400 border-[3px] border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] block mb-4">Qualificação Morna ☀️</span>
          <p className="text-5xl font-black text-slate-900 italic tracking-tighter">{stats.morno}</p>
        </div>

        <div className="bg-slate-200 border-[3px] border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-4">Lead Frio ❄️</span>
          <p className="text-5xl font-black text-slate-500 italic tracking-tighter">{stats.frio}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-32 bg-white border-[3px] border-dashed border-slate-300">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-6"></div>
          <p className="text-slate-400 font-black uppercase tracking-[0.5em] italic">Acessando Tabelas PostgreSQL...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white border-[3px] border-slate-900 p-24 text-center shadow-[20px_20px_0px_0px_rgba(15,23,42,0.05)]">
          <div className="text-7xl mb-8">📭</div>
          <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase italic tracking-tighter">Nenhum Lead em Produção</h3>
          <p className="text-slate-500 font-bold mb-10 uppercase tracking-widest text-sm">O banco de dados não retornou registros de contato.</p>
          <Link href="/admin/leads/novo" className="bg-blue-600 text-white px-10 py-5 font-black uppercase italic shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] hover:shadow-none transition-all">
            Iniciar Cadastro Manual
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {leads.map((l: any) => (
            <div 
              key={l.id} 
              className="bg-white border-[3px] border-slate-900 p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,0.08)] group hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all relative overflow-hidden"
            >
              {/* Indicador de Status Neobrutalista */}
              <div className={`absolute top-0 right-0 px-4 py-1 font-black text-[10px] uppercase tracking-widest border-l-[3px] border-b-[3px] border-slate-900 ${
                l.status?.toUpperCase() === 'QUENTE' ? 'bg-green-400' :
                l.status?.toUpperCase() === 'MORNO' ? 'bg-yellow-400' : 'bg-slate-200 text-slate-500'
              }`}>
                {l.status}
              </div>

              <div className="mb-8">
                <h3 className="font-black text-2xl text-slate-900 group-hover:text-blue-600 transition-colors uppercase italic tracking-tighter leading-none mb-2">
                  {l.nome}
                </h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                  Origin: {l.origem || 'Portal Imobiliária Perto'}
                </span>
              </div>

              <div className="space-y-4 border-t-[3px] border-slate-50 pt-6 mb-8">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-600 uppercase italic">
                  <span className="text-slate-900">✉️</span> {l.email}
                </div>
                <div className="flex items-center gap-3 text-lg font-black text-slate-900 uppercase">
                  <span className="text-blue-600 text-sm">📱</span> {l.telefone}
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-4 border-[2px] border-slate-900">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                  REG: {l.createdAt ? new Date(l.createdAt).toLocaleDateString('pt-BR') : 'RECENTE'}
                </span>
                <div className="flex gap-4">
                  <a 
                    href={`https://wa.me/${l.telefone?.replace(/\D/g, '')}`} 
                    target="_blank" 
                    className="bg-green-500 text-slate-900 text-[10px] font-black uppercase px-3 py-1 border-[2px] border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                  >
                    Zap
                  </a>
                  <Link 
                    href={`/admin/leads/${l.id}`} 
                    className="bg-white text-slate-900 text-[10px] font-black uppercase px-3 py-1 border-[2px] border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                  >
                    Ficha →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer de Auditoria STR (Padrão Genetics) */}
      <div className="mt-16 p-6 bg-slate-900 border-[3px] border-slate-900 shadow-[10px_10px_0px_0px_rgba(37,99,235,1)] flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <span className="h-3 w-3 bg-green-500 rounded-full animate-ping"></span>
          <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.4em] italic">System Status: Operational / PostgreSQL_Direct_Link</span>
        </div>
        <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
          Sync_Timestamp: {new Date().toISOString().replace('T', ' ').split('.')[0]}
        </span>
      </div>
    </div>
  );
}
