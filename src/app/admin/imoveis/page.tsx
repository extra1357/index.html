'use client';

export const dynamic = 'force-dynamic';


import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const excluirImovel = async (id: string, tipo: string) => {
    if (!confirm(`Tem certeza que deseja excluir este ${tipo}? Esta ação não pode ser desfeita.`)) return;
    try {
      const res = await fetch(`/api/imoveis/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir');
      setImoveis(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      alert('Erro ao excluir imóvel. Tente novamente.');
    }
  };

  const buscarImoveis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/imoveis');
      if (!res.ok) throw new Error('STR_DATABASE_SYNC_CRITICAL_FAILURE');
      
      const dados = await res.json();
      setImoveis(Array.isArray(dados) ? dados : (dados.data || []));
    } catch (err: any) {
      setError('FALHA_NA_SINCRONIZACAO_POSTGRES');
      console.error('Erro de Produção:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarImoveis();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-blue-500 font-black tracking-[0.7em] uppercase italic animate-pulse">Acessando Tabelas STR</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 bg-[#f1f5f9] min-h-screen font-sans antialiased text-slate-900">
      {/* Header Estratégico STR */}
      <div className="flex justify-between items-start mb-16 border-l-[12px] border-blue-600 pl-8">
        <div>
          <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-[0.8]">
            Gestão de <br />
            <span className="text-blue-600">Imóveis</span>
          </h1>
          <p className="font-black text-slate-500 text-sm tracking-[0.3em] uppercase mt-4">
            Ambiente de Produção / Portfólio PostgreSQL v1.0
          </p>
        </div>
        <Link 
          href="/admin/imoveis/novo" 
          className="bg-slate-900 text-white px-12 py-5 font-black rounded-sm hover:bg-blue-600 transition-all shadow-[10px_10px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 uppercase italic tracking-tighter text-xl"
        >
          + Novo Imóvel
        </Link>
      </div>

      {/* Alerta de Erro Crítico */}
      {error && (
        <div className="bg-red-600 text-white p-8 mb-12 font-black uppercase tracking-[0.2em] text-center shadow-[10px_10px_0px_0px_rgba(0,0,0,0.2)] animate-pulse border-4 border-white">
          SYSTEM_CRITICAL_ERROR: {error}
        </div>
      )}

      {/* Listagem de Imóveis */}
      {imoveis.length === 0 ? (
        <div className="p-32 border-[6px] border-dashed border-slate-200 text-center bg-white shadow-[20px_20px_0px_0px_rgba(15,23,42,0.05)]">
          <div className="text-6xl mb-6">🏚️</div>
          <h3 className="text-3xl font-black text-slate-300 uppercase tracking-[0.5em] italic">DATABASE_EMPTY</h3>
          <p className="text-slate-400 font-bold mt-4 uppercase tracking-widest">Nenhum registro detectado no PostgreSQL</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {imoveis.map((i: any, index: number) => (
            <div 
              key={i.id} 
              className="bg-white border-[3px] border-slate-900 overflow-hidden shadow-[15px_15px_0px_0px_rgba(15,23,42,0.08)] group hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              <div className="flex flex-col md:flex-row">
                {/* Thumbnail STR Style */}
                <div className="w-full md:w-64 h-64 bg-slate-100 border-b-[3px] md:border-b-0 md:border-r-[3px] border-slate-900 flex items-center justify-center overflow-hidden">
                  {i.imagens && i.imagens[0] ? (
                    <img src={i.imagens[0]} alt={i.tipo} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <span className="text-7xl opacity-20 group-hover:scale-110 transition-transform">🏠</span>
                  )}
                </div>

                {/* Informações Principais */}
                <div className="flex-1 p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-slate-900 text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest">
                        ID: {i.id.slice(-8).toUpperCase()}
                      </div>
                      <div className={`px-4 py-1 border-[2px] border-slate-900 font-black text-[10px] uppercase tracking-widest ${
                        i.disponivel ? 'bg-green-400' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {i.disponivel ? 'Disponível' : 'Indisponível'}
                      </div>
                    </div>

                    <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-2">
                      {i.tipo}
                    </h2>
                    <p className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 italic">
                      📍 {i.cidade} / {i.estado} — {i.metragem} m²
                    </p>
                    <p className="text-slate-500 font-bold text-sm uppercase mb-6 flex items-center gap-2">
                      <span className="w-4 h-[2px] bg-slate-300 text-slate-400"></span> {i.endereco}
                    </p>
                  </div>

                  {/* Proprietário Node */}
                  {i.proprietario && (
                    <div className="flex gap-6 border-t-[3px] border-slate-50 pt-6">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Proprietário</span>
                        <span className="text-xs font-black uppercase">{i.proprietario.nome}</span>
                      </div>
                      {i.proprietario.telefone && (
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Contato</span>
                          <span className="text-xs font-black uppercase">{i.proprietario.telefone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Preço e Ações */}
                <div className="w-full md:w-72 p-8 bg-slate-50 border-t-[3px] md:border-t-0 md:border-l-[3px] border-slate-900 flex flex-col justify-between items-end">
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-2">Valor de Mercado</span>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter group-hover:text-blue-600 transition-colors">
                      R$ {Number(i.preco).toLocaleString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex gap-4 w-full">
                    <Link 
                      href={`/admin/imoveis/editar/${i.id}`} 
                      className="flex-1 bg-white border-[3px] border-slate-900 text-center py-3 font-black text-[11px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] hover:shadow-none"
                    >
                      Editar
                    </Link>
                    <button 
                      onClick={() => excluirImovel(i.id, i.tipo)}
                      className="flex-1 bg-red-500 border-[3px] border-slate-900 text-white text-center py-3 font-black text-[11px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] hover:shadow-none"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rodapé de Status Técnico */}
      <footer className="mt-16 py-8 border-t-[6px] border-slate-900 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
          <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em]">PostgreSQL Pipeline Active</span>
        </div>
        <button 
          onClick={buscarImoveis} 
          className="bg-slate-900 text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all italic shadow-[5px_5px_0px_0px_rgba(37,99,235,1)] hover:shadow-none"
        >
          Sincronizar Agora
        </button>
      </footer>
    </div>
  );
}
