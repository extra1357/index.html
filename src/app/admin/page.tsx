'use client';

export const dynamic = 'force-dynamic';


import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AdminPageHeader,
  AdminCard,
  AdminStatCard,
  AdminButton,
  AdminIcons,
} from '@/components/admin';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ imoveis: 0, leads: 0, vendas: 0, alugueis: 0 });
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('Admin');

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
            imoveis: data.estatisticas?.total_imoveis_cadastrados || 0
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

  // Ícones
  const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
  const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>;
  const DollarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
  const KeyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/></svg>;

  return (
    <div className="space-y-8">
      {/* Banner de Boas-vindas */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 lg:p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="text-6xl lg:text-7xl">👋</div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl lg:text-4xl font-bold text-white">
              Bem-vindo, <span className="text-violet-400">{adminEmail}</span>!
            </h1>
            <p className="text-slate-400 mt-2">
              Painel Administrativo STR Imóveis
            </p>
          </div>
        </div>
        {/* Decoração */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard
          title="Imóveis"
          value={loading ? '...' : stats.imoveis}
          subtitle="Cadastrados"
          icon={<HomeIcon />}
          variant="info"
        />
        <AdminStatCard
          title="Leads"
          value={stats.leads}
          subtitle="Este mês"
          icon={<UsersIcon />}
          variant="success"
        />
        <AdminStatCard
          title="Vendas"
          value={stats.vendas}
          subtitle="Realizadas"
          icon={<DollarIcon />}
          variant="warning"
        />
        <AdminStatCard
          title="Aluguéis"
          value={stats.alugueis}
          subtitle="Ativos"
          icon={<KeyIcon />}
          variant="default"
        />
      </div>

      {/* Ações Rápidas */}
      <AdminCard>
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          ⚡ Ações Rápidas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <ActionButton href="/admin/imoveis/novo" icon="🏠" label="Novo Imóvel" />
          <ActionButton href="/admin/leads/novo" icon="📋" label="Novo Lead" />
          <ActionButton href="/admin/vendas/nova" icon="💰" label="Nova Venda" />
          <ActionButton href="/admin/alugueis/novo" icon="🔑" label="Novo Aluguel" />
          <ActionButton href="/admin/consultas/nova" icon="📅" label="Agendar Visita" />
          <ActionButton href="/admin/corretores/novo" icon="👤" label="Novo Corretor" />
        </div>
      </AdminCard>

      {/* Comissões */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          💵 Comissões
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminCard className="border-l-4 border-amber-500">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Pendentes</p>
            <p className="text-2xl font-bold text-amber-600 mt-2">R$ 0,00</p>
          </AdminCard>
          <AdminCard className="border-l-4 border-blue-500">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Aprovadas</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">R$ 0,00</p>
          </AdminCard>
          <AdminCard className="border-l-4 border-emerald-500">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Pagas (Mês)</p>
            <p className="text-2xl font-bold text-emerald-600 mt-2">R$ 0,00</p>
          </AdminCard>
        </div>
      </div>

      {/* Status do Sistema */}
      <AdminCard className="bg-gradient-to-r from-slate-900 to-slate-800 border-none">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-xs font-medium text-violet-400 uppercase tracking-wider">Status do Sistema</p>
            <p className="text-2xl font-bold text-white mt-1">Online</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm text-slate-400">PostgreSQL Conectado</span>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}

// Componente de Botão de Ação
function ActionButton({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-300 rounded-xl transition-all duration-200 group"
    >
      <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-xs font-semibold text-slate-600 group-hover:text-violet-600 text-center">{label}</span>
    </Link>
  );
}
