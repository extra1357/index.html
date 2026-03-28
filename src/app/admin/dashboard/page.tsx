'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  
  const [stats, setStats] = useState<any>({ 
    leads: 12, 
    imoveis: 45, 
    consultas: 8, 
    analises: 5 
  });
  const [adminEmail, setAdminEmail] = useState<string>('Admin STR');
  
  useEffect(() => {
    const email = localStorage.getItem('admin-email');
    if (email) setAdminEmail(email);
    console.log('🚀 Dashboard Ativo: Rotas individuais mapeadas.');
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans antialiased text-slate-900 pb-20">
      {/* Header Fixo STR */}
      <header className="bg-slate-900 border-b-[4px] border-blue-600 px-4 sm:px-8 py-6 sticky top-0 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-600 border-[3px] border-white flex items-center justify-center text-3xl shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
              🏢
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                Painel <span className="text-blue-500">Controle</span>
              </h1>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mt-1">
                STR GENETICS v1.0
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/analise-mercado/nova" 
              className="hidden md:flex items-center gap-3 px-6 py-3 bg-blue-600 text-white text-xs font-black uppercase italic border-[3px] border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <span>🤖</span><span>Análise IA</span>
            </Link>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-3 px-6 py-3 bg-red-600 text-white text-xs font-black uppercase italic border-[3px] border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-700 transition-all"
            >
              <span>🚪</span><span className="hidden sm:inline">Sair_Sistema</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 py-12">
        
        {/* Banner de Boas-vindas STR */}
        <div className="bg-slate-900 border-[4px] border-slate-900 rounded-none p-8 md:p-12 mb-12 relative overflow-hidden shadow-[15px_15px_0px_0px_rgba(37,99,235,1)]">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="text-7xl md:text-8xl animate-bounce">👋</div>
            <div className="text-center md:text-left">
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
                BEM-VINDO, <span className="text-blue-500">{adminEmail.split('@')[0]}</span>!
              </h2>
              <p className="text-blue-400 font-black text-xs uppercase tracking-[0.5em] mt-4 opacity-80">
                Acesso de Nível Administrativo // Protocolo Independente
              </p>
            </div>
          </div>
          {/* Background Decorativo */}
          <div className="absolute top-0 right-0 p-4 text-slate-800 text-9xl font-black select-none pointer-events-none opacity-20 italic">
            STR
          </div>
        </div>

        {/* 1. Stats Grid - Estilo Industrial */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <StatCard href="/admin/leads" icon="👥" title="Leads_Captados" value={stats.leads} accent="blue" />
          <StatCard href="/admin/imoveis" icon="🏠" title="Catálogo_Ativo" value={stats.imoveis} accent="green" />
          <StatCard href="/admin/consultas" icon="📅" title="Agenda_Visitas" value={stats.consultas} accent="purple" />
          <StatCard href="/admin/analise-mercado" icon="🤖" title="Processamento_IA" value={stats.analises} accent="orange" />
        </div>

        {/* 2. Seções de Ações e IA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="bg-white border-[4px] border-slate-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <div className="bg-slate-900 px-8 py-5 flex items-center gap-4 text-white">
                <span className="text-3xl">⚡</span>
                <h2 className="text-xl font-black uppercase italic tracking-widest">Operações_Rápidas</h2>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <ActionButton href="/admin/leads/novo" icon="👥" title="Novo Lead" description="Capturar nova oportunidade" />
                <ActionButton href="/admin/imoveis/novo" icon="🏠" title="Novo Imóvel" description="Inserir unidade no banco" />
                <ActionButton href="/admin/consultas/nova" icon="📅" title="Agendar Visita" description="Sincronizar corretor e lead" />
                <ActionButton href="/admin/leads/relatorio" icon="📊" title="Relatórios" description="Extração de dados brutos" />
              </div>
            </div>
          </div>

          {/* Card IA STR */}
          <div className="bg-blue-600 border-[4px] border-slate-900 p-8 text-white flex flex-col shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
            <div className="text-6xl mb-6">🤖</div>
            <h2 className="text-3xl font-black uppercase italic leading-none mb-4">Módulo_IA</h2>
            <p className="font-bold text-blue-100 text-sm mb-10 leading-relaxed uppercase">
              Algoritmo de análise preditiva para tendências de mercado e valorização.
            </p>
            <Link 
              href="/admin/analise-mercado/nova" 
              className="mt-auto bg-slate-900 text-white py-5 px-4 font-black text-center uppercase italic tracking-widest hover:bg-white hover:text-slate-900 transition-all border-[3px] border-slate-900"
            >
              Iniciar_Análise
            </Link>
          </div>
        </div>

        {/* 3. Ferramentas de Apoio */}
        <div className="bg-white border-[4px] border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,0.05)]">
          <div className="bg-slate-100 border-b-[4px] border-slate-900 px-8 py-5 flex items-center gap-4 text-slate-900">
            <span className="text-3xl">🔗</span>
            <h3 className="text-xl font-black uppercase italic tracking-widest">Pipeline_Suporte</h3>
          </div>
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickLink href="/admin/leads/relatorio" icon="📈" title="Leads_Report" />
            <QuickLink href="/admin/imoveis" icon="🏘️" title="Catalog_Manager" />
            <QuickLink href="/admin/consultas" icon="🕒" title="Schedule_Live" />
            <QuickLink href="/admin/consultas/historico" icon="📋" title="STR_Logs" />
          </div>
        </div>
      </main>
    </div>
  );
}

// SUBCOMPONENTES COM ESTILO STR GENETICS

function StatCard({ href, icon, title, value, accent }: any) {
  const colors: any = {
    blue: 'border-blue-500 text-blue-600',
    green: 'border-green-500 text-green-600',
    purple: 'border-purple-500 text-purple-600',
    orange: 'border-orange-500 text-orange-600',
  };
  
  return (
    <Link href={href} className={`bg-white border-[4px] border-slate-900 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all">{icon}</span>
        <span className="text-5xl font-black italic tracking-tighter text-slate-900">{value}</span>
      </div>
      <div className={`text-[10px] font-black uppercase tracking-[0.2em] border-t-[2px] pt-3 ${colors[accent]}`}>
        {title}
      </div>
    </Link>
  );
}

function ActionButton({ href, icon, title, description }: any) {
  return (
    <Link href={href} className="group flex items-center gap-6 p-6 border-[3px] border-slate-100 hover:border-blue-600 hover:bg-blue-50 transition-all">
      <span className="text-4xl grayscale group-hover:grayscale-0 transition-all">{icon}</span>
      <div className="flex-1">
        <div className="font-black text-slate-900 uppercase italic text-lg group-hover:text-blue-600 leading-none mb-1 transition-colors">
          {title}
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{description}</div>
      </div>
      <span className="text-2xl font-black text-slate-200 group-hover:text-blue-600 group-hover:translate-x-2 transition-all">→</span>
    </Link>
  );
}

function QuickLink({ href, icon, title }: any) {
  return (
    <Link href={href} className="group flex items-center gap-4 p-5 bg-slate-50 border-[2px] border-transparent hover:border-slate-900 hover:bg-white transition-all">
      <span className="text-2xl">{icon}</span>
      <div className="font-black text-slate-900 uppercase italic text-xs tracking-tighter group-hover:text-blue-600">
        {title}
      </div>
    </Link>
  );
}
