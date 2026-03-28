import React from 'react';
import Link from 'next/link';

export default function AcessoNegadoPage({ searchParams }: { searchParams: { from?: string } }) {
  const tentouAcessar = searchParams?.from || 'recurso desconhecido';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 font-sans">
      {/* Container Principal */}
      <div className="max-w-2xl w-full">
        {/* Card de Erro */}
        <div className="bg-white border-[6px] border-red-600 rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-red-600 p-8 text-center border-b-[6px] border-red-700">
            <div className="text-8xl mb-4 animate-bounce">🚫</div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white leading-none">
              Acesso <br />
              <span className="text-red-200">Negado</span>
            </h1>
          </div>

          {/* Corpo */}
          <div className="p-8 space-y-6">
            {/* Mensagem Principal */}
            <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded">
              <p className="text-lg font-bold text-slate-900 mb-2">
                ⚠️ Você não tem permissão para acessar este recurso
              </p>
              <p className="text-sm text-slate-600">
                Seu nível de acesso atual não permite visualizar ou executar esta ação.
              </p>
            </div>

            {/* Rota Tentada */}
            <div className="bg-slate-100 p-4 rounded border-2 border-slate-300">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Recurso Solicitado
              </p>
              <code className="text-sm font-mono text-slate-900 break-all">
                {tentouAcessar}
              </code>
            </div>

            {/* Possíveis Razões */}
            <div className="space-y-3">
              <h3 className="font-black uppercase italic text-sm text-slate-700">
                Possíveis Razões:
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Seu nível de acesso não inclui esta funcionalidade</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Você está tentando acessar dados de outro usuário</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Esta área é restrita a administradores</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Suas permissões foram alteradas recentemente</span>
                </li>
              </ul>
            </div>

            {/* Hierarquia Rápida */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
              <h4 className="font-black uppercase text-xs text-slate-500 mb-3 tracking-wider">
                📊 Hierarquia de Acesso
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-purple-100 rounded">
                  <span className="text-lg">👑</span>
                  <span className="font-bold">SUPER_ADMIN</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-red-100 rounded">
                  <span className="text-lg">⚡</span>
                  <span className="font-bold">ADMIN</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-blue-100 rounded">
                  <span className="text-lg">📊</span>
                  <span className="font-bold">GERENTE</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-100 rounded">
                  <span className="text-lg">🤝</span>
                  <span className="font-bold">CORRETOR</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-yellow-100 rounded">
                  <span className="text-lg">📝</span>
                  <span className="font-bold">ASSISTENTE</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                  <span className="text-lg">👁️</span>
                  <span className="font-bold">VISUALIZADOR</span>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link 
                href="/admin"
                className="flex-1 px-6 py-4 bg-slate-900 text-white text-center font-black rounded-sm hover:bg-blue-600 transition-all shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 uppercase italic tracking-tighter text-sm"
              >
                ← Voltar ao Dashboard
              </Link>
              <Link 
                href="/admin/perfil"
                className="flex-1 px-6 py-4 bg-white border-2 border-slate-300 text-center font-bold rounded-sm hover:bg-slate-100 transition-all uppercase text-sm"
              >
                Ver Meu Perfil
              </Link>
            </div>

            {/* Contato Suporte */}
            <div className="text-center pt-4 border-t-2 border-slate-200">
              <p className="text-xs text-slate-500 mb-2">
                Precisa de mais permissões?
              </p>
              <p className="text-sm font-bold text-slate-700">
                Entre em contato com seu administrador
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-900 p-4 text-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              STR Manager • Sistema de Controle de Acesso
            </p>
          </div>
        </div>

        {/* Info Adicional */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Código do Erro: 403 FORBIDDEN
          </p>
        </div>
      </div>
    </div>
  );
}
