'use client';

export const dynamic = 'force-dynamic';


import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ imoveis: 0, leads: 0, vendas: 0, alugueis: 0 });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('Admin STR');

  useEffect(() => {
    const email = localStorage.getItem('admin-email');
    if (email) setAdminEmail(email.split('@')[0]);

    async function fetchStats() {
      try {
        const res = await fetch('/api/teste-conexao');
        const data = await res.json();
        if (data.status === "CONECTADO") {
          setStats(prev => ({ 
            ...prev, 
            imoveis: data.estatisticas.total_imoveis_cadastrados 
          }));
        }
      } catch (e: any) { 
        console.error("Erro ao carregar estatísticas"); 
      } finally { 
        setLoading(false); 
      }
    }
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] font-sans antialiased text-slate-900">
      
      {/* 📱 OVERLAY MOBILE */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 🎨 SIDEBAR RESPONSIVA STR GENETICS */}
      <aside className={`
        fixed lg:sticky top-0 h-screen
        w-[280px] bg-slate-900 text-white
        flex flex-col border-r-[6px] border-blue-600
        transition-transform duration-300 z-50
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Header Sidebar */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tighter italic uppercase text-blue-500 leading-none">
              STR <br /> <span className="text-white">MANAGER</span>
            </h2>
            <p className="text-[9px] font-black tracking-[0.3em] uppercase mt-2 text-slate-500">
              v2.0 Production
            </p>
          </div>
          {/* Botão Fechar Mobile */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white text-2xl"
          >
            ✕
          </button>
        </div>
        
        {/* 📋 MENU COM SCROLL */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          
          {/* Principal */}
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2 mt-2 mb-1">
            Principal
          </p>
          <NavLink href="/admin" icon="📊" label="Dashboard" active />
          
          {/* Cadastros */}
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2 mt-4 mb-1">
            Cadastros
          </p>
          <NavLink href="/admin/imoveis" icon="🏠" label="Imóveis" />
          <NavLink href="/admin/imoveis/alugados" icon="🏘️" label="Alugados" />
          <NavLink href="/admin/imoveis/vendidos" icon="💰" label="Vendidos" />
          <NavLink href="/admin/leads" icon="📋" label="Leads" />
          <NavLink href="/admin/proprietarios" icon="👤" label="Proprietários" />
          <NavLink href="/admin/corretores" icon="👥" label="Corretores" />
          
          {/* Negócios */}
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2 mt-4 mb-1">
            Negócios
          </p>
          <NavLink href="/admin/vendas" icon="💰" label="Vendas" />
          <NavLink href="/admin/alugueis" icon="🏘️" label="Aluguéis" />
          <NavLink href="/admin/comissoes" icon="💵" label="Comissões" />
          
          {/* Ferramentas */}
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2 mt-4 mb-1">
            Ferramentas
          </p>
          <NavLink href="/admin/consultas" icon="📅" label="Consultas" />
          <NavLink href="/admin/analise-mercado" icon="🤖" label="Análise IA" />
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link 
            href="/" 
            className="block text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors text-center py-2"
          >
            ← Site Público
          </Link>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 px-4 text-[10px] font-black uppercase rounded hover:bg-red-700 transition-all"
          >
            🚪 Sair
          </button>
        </div>
      </aside>

      {/* 📄 CONTEÚDO PRINCIPAL */}
      <main className="flex-1 w-full lg:w-auto">
        
        {/* 📱 HEADER MOBILE */}
        <header className="lg:hidden sticky top-0 z-30 bg-slate-900 border-b-[4px] border-blue-600 px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="text-white text-2xl"
          >
            ☰
          </button>
          <h1 className="text-xl font-black text-white uppercase italic">
            STR <span className="text-blue-500">Manager</span>
          </h1>
          <div className="w-8" /> {/* Spacer */}
        </header>

        {/* CONTEÚDO */}
        <div className="p-4 lg:p-12">
          
          {/* 🎉 BANNER BEM-VINDO */}
          <div className="bg-slate-900 border-[4px] border-slate-900 rounded-none p-6 lg:p-12 mb-8 lg:mb-12 relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(37,99,235,1)]">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="text-5xl lg:text-7xl">👋</div>
              <div className="text-center md:text-left">
                <h2 className="text-3xl lg:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                  BEM-VINDO, <span className="text-blue-500">{adminEmail}</span>!
                </h2>
                <p className="text-blue-400 font-black text-[9px] lg:text-xs uppercase tracking-[0.3em] lg:tracking-[0.5em] mt-3 opacity-80">
                  Painel Administrativo STR Genetics
                </p>
              </div>
            </div>
          </div>

          {/* 📊 STATS GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
            <StatCard 
              icon="🏠" 
              title="Imóveis" 
              value={loading ? '...' : stats.imoveis} 
              color="blue"
              href="/admin/imoveis"
            />
            <StatCard 
              icon="📋" 
              title="Leads" 
              value={stats.leads} 
              color="purple"
              href="/admin/leads"
            />
            <StatCard 
              icon="💰" 
              title="Vendas" 
              value={stats.vendas} 
              color="green"
              href="/admin/vendas"
            />
            <StatCard 
              icon="🏘️" 
              title="Aluguéis" 
              value={stats.alugueis} 
              color="orange"
              href="/admin/alugueis"
            />
          </div>

          {/* ⚡ AÇÕES RÁPIDAS */}
          <section className="mb-8 lg:mb-12">
            <div className="flex items-center gap-4 mb-6">
              <h3 className="font-black uppercase italic tracking-tighter text-lg lg:text-xl">
                ⚡ Ações Rápidas
              </h3>
              <div className="flex-1 h-[3px] bg-slate-200"></div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <ActionCard href="/admin/imoveis/novo" icon="🏠" label="Novo Imóvel" />
              <ActionCard href="/admin/imoveis/alugados" icon="🏘️" label="Ver Alugados" />
              <ActionCard href="/admin/imoveis/vendidos" icon="💰" label="Ver Vendidos" />
              <ActionCard href="/admin/leads/novo" icon="📋" label="Novo Lead" />
              <ActionCard href="/admin/vendas/nova" icon="💰" label="Nova Venda" />
              <ActionCard href="/admin/consultas/nova" icon="📅" label="Agendar Visita" />
            </div>
          </section>

          {/* 💵 COMISSÕES */}
          <section className="mb-8 lg:mb-12">
            <div className="flex items-center gap-4 mb-6">
              <h3 className="font-black uppercase italic tracking-tighter text-lg lg:text-xl">
                💵 Comissões
              </h3>
              <div className="flex-1 h-[3px] bg-slate-200"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-yellow-50 border-2 border-yellow-400 p-4 lg:p-6 rounded-lg">
                <p className="text-[9px] font-black text-yellow-600 uppercase tracking-widest">
                  Pendentes
                </p>
                <p className="text-2xl lg:text-3xl font-black text-yellow-600 mt-2">
                  R$ 0,00
                </p>
              </div>
              <div className="bg-blue-50 border-2 border-blue-400 p-4 lg:p-6 rounded-lg">
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">
                  Aprovadas
                </p>
                <p className="text-2xl lg:text-3xl font-black text-blue-600 mt-2">
                  R$ 0,00
                </p>
              </div>
              <div className="bg-green-50 border-2 border-green-400 p-4 lg:p-6 rounded-lg">
                <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">
                  Pagas (Mês)
                </p>
                <p className="text-2xl lg:text-3xl font-black text-green-600 mt-2">
                  R$ 0,00
                </p>
              </div>
            </div>
          </section>

          {/* 🟢 STATUS SISTEMA */}
          <section>
            <div className="bg-slate-900 p-6 lg:p-8 border-[3px] border-slate-900 shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] rounded-lg">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                <div>
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">
                    Status do Sistema
                  </span>
                  <div className="text-2xl lg:text-3xl font-black text-white mt-2 italic tracking-tighter uppercase">
                    Online
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    PostgreSQL Conectado
                  </span>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

// 🎨 COMPONENTES OTIMIZADOS

function NavLink({ href, icon, label, active = false }: any) {
  return (
    <Link 
      href={href}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded
        font-bold text-sm uppercase italic tracking-wide
        transition-all
        ${active 
          ? 'bg-blue-600 text-white shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]' 
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }
      `}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function StatCard({ icon, title, value, color, href }: any) {
  const colors: any = {
    blue: 'border-blue-500 text-blue-600 hover:shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]',
    purple: 'border-purple-500 text-purple-600 hover:shadow-[4px_4px_0px_0px_rgba(147,51,234,1)]',
    green: 'border-green-500 text-green-600 hover:shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]',
    orange: 'border-orange-500 text-orange-600 hover:shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]',
  };

  return (
    <Link 
      href={href}
      className={`
        bg-white border-[3px] border-slate-900 p-4 lg:p-6
        shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]
        hover:shadow-none hover:translate-x-1 hover:translate-y-1
        transition-all group
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-3xl lg:text-4xl filter grayscale group-hover:grayscale-0 transition-all">
          {icon}
        </span>
        <span className="text-3xl lg:text-4xl font-black italic tracking-tighter text-slate-900">
          {value}
        </span>
      </div>
      <div className={`text-[10px] font-black uppercase tracking-[0.2em] border-t-[2px] pt-2 ${colors[color]}`}>
        {title}
      </div>
    </Link>
  );
}

function ActionCard({ href, icon, label }: any) {
  return (
    <Link 
      href={href}
      className="bg-white border-2 border-slate-200 p-4 lg:p-6 text-center hover:border-blue-600 hover:bg-blue-50 transition-all rounded-lg group"
    >
      <span className="text-3xl lg:text-4xl block mb-2 filter grayscale group-hover:grayscale-0 transition-all">
        {icon}
      </span>
      <p className="font-bold text-xs lg:text-sm text-slate-700 group-hover:text-blue-600 uppercase">
        {label}
      </p>
    </Link>
  );
}
