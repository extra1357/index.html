'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { name: 'Imóveis', href: '/admin/imoveis', icon: '🏠' },
  { name: 'Novo Imóvel', href: '/admin/imoveis/novo', icon: '➕' },
  { name: 'Proprietários', href: '/admin/proprietarios', icon: '👤' },
  { name: 'Configurações', href: '/admin/perfil', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-100">
          <Link href="/admin/dashboard" className="text-2xl font-bold text-blue-600">
            STR <span className="text-gray-800 font-medium text-lg">Imobiliária</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <Link href="/api/auth/logout" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
            <span>🚪</span>
            Sair do Sistema
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Painel Administrativo</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Olá, Corretor</span>
              <img src="https://api.dicebear.com/8.x/initials/svg?seed=ED" alt="Avatar" className="h-10 w-10 rounded-full border" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
