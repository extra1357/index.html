"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const Icons: Record<string, () => JSX.Element> = {
  Menu: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Building: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>,
  Users: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Handshake: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/></svg>,
  Key: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/></svg>,
  DollarSign: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Wallet: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>,
  Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>,
  BarChart: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>,
  TrendingUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  UserCog: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="15" r="3"/><circle cx="9" cy="7" r="4"/><path d="M10 15H6a4 4 0 0 0-4 4v2"/><path d="m21.7 16.4-.9-.3"/><path d="m15.2 13.9-.9-.3"/><path d="m16.6 18.7.3-.9"/><path d="m19.1 12.2.3-.9"/><path d="m19.6 18.7-.4-1"/><path d="m16.8 12.3-.4-1"/><path d="m14.3 16.6 1-.4"/><path d="m20.7 13.8 1-.4"/></svg>,
  LogOut: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  User: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Bell: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  ChevronDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>,
  ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
};

type MenuItem = { label: string; href?: string; icon: string; badge?: number; children?: { label: string; href: string }[] };
const menuItems: MenuItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "Home" },
  { label: "Imóveis", icon: "Building", children: [{ label: "Todos", href: "/admin/imoveis" }, { label: "Disponíveis", href: "/admin/imoveis/disponiveis" }, { label: "Vendidos", href: "/admin/imoveis/vendidos" }, { label: "Alugados", href: "/admin/imoveis/alugados" }, { label: "Novo", href: "/admin/imoveis/novo" }] },
  { label: "Leads", icon: "Users", children: [{ label: "Todos", href: "/admin/leads" }, { label: "Novo", href: "/admin/leads/novo" }, { label: "Relatório", href: "/admin/leads/relatorio" }] },
  { label: "Corretores", icon: "Handshake", children: [{ label: "Todos", href: "/admin/corretores" }, { label: "Novo", href: "/admin/corretores/novo" }] },
  { label: "Proprietários", icon: "UserCog", children: [{ label: "Todos", href: "/admin/proprietarios" }, { label: "Novo", href: "/admin/proprietarios/novo" }] },
  { label: "Vendas", icon: "DollarSign", children: [{ label: "Todas", href: "/admin/vendas" }, { label: "Nova", href: "/admin/vendas/nova" }] },
  { label: "Aluguéis", icon: "Key", children: [{ label: "Todos", href: "/admin/alugueis" }, { label: "Novo", href: "/admin/alugueis/novo" }] },
  { label: "Comissões", href: "/admin/comissoes", icon: "Wallet" },
  { label: "Consultas", icon: "Calendar", children: [{ label: "Agendadas", href: "/admin/consultas" }, { label: "Nova", href: "/admin/consultas/nova" }, { label: "Histórico", href: "/admin/consultas/historico" }, { label: "Funil", href: "/admin/consultas/funil" }] },
  { label: "Análise Mercado", icon: "TrendingUp", children: [{ label: "Dashboard", href: "/admin/analise-mercado" }, { label: "Nova", href: "/admin/analise-mercado/nova" }, { label: "Relatórios", href: "/admin/analise-mercado/relatorios" }] },
  { label: "Performance", href: "/admin/performance", icon: "BarChart" },
  { label: "Usuários", href: "/admin/usuarios", icon: "Users" },
];

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string[]>([]);
  const toggle = (l: string) => setExpanded((p) => (p.includes(l) ? p.filter((x: any) => x !== l) : [...p, l]));
  const active = (h?: string, c?: { href: string }[]) => (h && pathname === h) || (c && c.some((x) => pathname === x.href));

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 transform transition-transform duration-300 lg:translate-x-0 lg:static ${isOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col shadow-2xl`}>
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 text-white"><Icons.Building /></div>
            <div><h1 className="text-lg font-bold text-white">STR Imóveis</h1><p className="text-[10px] text-slate-400 uppercase tracking-widest">Painel Admin</p></div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white"><Icons.X /></button>
        </div>
        <div className="p-4"><div className="relative"><div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Icons.Search /></div><input placeholder="Buscar..." className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50" /></div></div>
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {menuItems.map((item: any) => {
            const Icon = Icons[item.icon];
            const isActive = active(item.href, item.children);
            const isExpanded = expanded.includes(item.label);
            if (item.children) {
              return (
                <div key={item.label}>
                  <button onClick={() => toggle(item.label)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${isActive ? "bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"}`}>
                    <div className="flex items-center gap-3"><div className={`${isActive ? "text-violet-400" : "text-slate-500 group-hover:text-violet-400"}`}><Icon /></div><span className="font-medium text-sm">{item.label}</span>{item.badge && <span className="px-2 py-0.5 text-xs font-bold bg-violet-500 text-white rounded-full">{item.badge}</span>}</div>
                    <div className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}><Icons.ChevronDown /></div>
                  </button>
                  <div className={`overflow-hidden transition-all ${isExpanded ? "max-h-96" : "max-h-0"}`}>
                    <div className="ml-4 pl-4 border-l border-slate-700/50 mt-1 space-y-1">
                      {item.children.map((c: any) => <Link key={c.href} href={c.href} onClick={onClose} className={`block px-4 py-2.5 rounded-lg text-sm ${pathname === c.href ? "bg-violet-500/10 text-violet-400 font-medium" : "text-slate-500 hover:text-white hover:bg-slate-800/30"}`}>{c.label}</Link>)}
                    </div>
                  </div>
                </div>
              );
            }
            return <Link key={item.label} href={item.href!} onClick={onClose} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive ? "bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"}`}><div className={`${isActive ? "text-violet-400" : "text-slate-500 group-hover:text-violet-400"}`}><Icon /></div><span className="font-medium text-sm">{item.label}</span></Link>;
          })}
        </nav>
        <div className="p-4 border-t border-slate-700/50">
          <Link href="/admin/perfil" className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-sm font-bold">AD</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">Admin</p><p className="text-xs text-slate-500 truncate">admin@str.com</p></div>
            <Icons.ChevronRight />
          </Link>
        </div>
      </aside>
    </>
  );
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const crumbs = pathname.split("/").filter(Boolean).map((p, i, a) => ({ label: p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " "), href: "/" + a.slice(0, i + 1).join("/"), isLast: i === a.length - 1 }));
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/admin/login"); };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"><Icons.Menu /></button>
          <nav className="hidden sm:flex items-center gap-2 text-sm">{crumbs.map((c: any, i: number) => <React.Fragment key={c.href}>{i > 0 && <Icons.ChevronRight />}{c.isLast ? <span className="font-semibold text-slate-900">{c.label}</span> : <Link href={c.href} className="text-slate-500 hover:text-slate-700">{c.label}</Link>}</React.Fragment>)}</nav>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl"><Icons.Bell /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" /></button>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-xl">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-violet-500/20">AD</div>
              <div className="hidden md:block text-left"><p className="text-sm font-semibold text-slate-900">Admin</p><p className="text-xs text-slate-500">Super Admin</p></div>
              <Icons.ChevronDown />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/50 py-2 z-50">
                  <Link href="/admin/perfil" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><Icons.User />Meu Perfil</Link>
                  <Link href="/admin/trocar-senha" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><Icons.Settings />Configurações</Link>
                  <div className="border-t border-slate-100 my-2" />
                  <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"><Icons.LogOut />Sair</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const noLayout = ["/admin/login", "/admin/esqueci-senha", "/admin/redefinir-senha"];
  if (noLayout.some((p) => pathname.startsWith(p))) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-violet-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl" />
      </div>
      <div className="relative flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 lg:p-8">{children}</main>
          <footer className="border-t border-slate-200/50 bg-white/50 backdrop-blur-sm px-4 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-slate-500">
              <p>© 2025 STR Imóveis</p><p>v2.0.0</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
