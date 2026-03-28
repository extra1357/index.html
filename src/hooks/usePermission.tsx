export const dynamic = 'force-dynamic';

// hooks/usePermission.ts
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipos
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'GERENTE' | 'CORRETOR' | 'ASSISTENTE' | 'VISUALIZADOR';

export type Permission = 
  | 'usuarios.criar' | 'usuarios.editar' | 'usuarios.deletar' | 'usuarios.visualizar' | 'usuarios.gerenciar_permissoes'
  | 'imoveis.criar' | 'imoveis.editar' | 'imoveis.deletar' | 'imoveis.visualizar'
  | 'proprietarios.criar' | 'proprietarios.editar' | 'proprietarios.visualizar'
  | 'corretores.criar' | 'corretores.editar' | 'corretores.visualizar'
  | 'leads.criar' | 'leads.editar' | 'leads.visualizar' | 'leads.visualizar_todos' | 'leads.atribuir'
  | 'vendas.criar' | 'vendas.visualizar' | 'vendas.visualizar_todas' | 'vendas.aprovar'
  | 'alugueis.criar' | 'alugueis.visualizar' | 'alugueis.aprovar'
  | 'comissoes.visualizar' | 'comissoes.aprovar' | 'comissoes.pagar'
  | 'consultas.criar' | 'consultas.visualizar'
  | 'relatorios.visualizar' | 'relatorios.gerar' | 'relatorios.financeiros'
  | 'sistema.configuracoes';

interface User {
  id: string;
  nome: string;
  email: string;
  role: Role;
  corretorId?: string | null;
}

// Hierarquia de roles
const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  GERENTE: 60,
  CORRETOR: 40,
  ASSISTENTE: 20,
  VISUALIZADOR: 10
};

// Permissões por role
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    'usuarios.criar', 'usuarios.editar', 'usuarios.deletar', 'usuarios.visualizar', 'usuarios.gerenciar_permissoes',
    'imoveis.criar', 'imoveis.editar', 'imoveis.deletar', 'imoveis.visualizar',
    'proprietarios.criar', 'proprietarios.editar', 'proprietarios.visualizar',
    'corretores.criar', 'corretores.editar', 'corretores.visualizar',
    'leads.criar', 'leads.editar', 'leads.visualizar', 'leads.visualizar_todos', 'leads.atribuir',
    'vendas.criar', 'vendas.visualizar', 'vendas.visualizar_todas', 'vendas.aprovar',
    'alugueis.criar', 'alugueis.visualizar', 'alugueis.aprovar',
    'comissoes.visualizar', 'comissoes.aprovar', 'comissoes.pagar',
    'consultas.criar', 'consultas.visualizar',
    'relatorios.visualizar', 'relatorios.gerar', 'relatorios.financeiros',
    'sistema.configuracoes'
  ],
  ADMIN: [
    'usuarios.criar', 'usuarios.editar', 'usuarios.visualizar',
    'imoveis.criar', 'imoveis.editar', 'imoveis.visualizar',
    'proprietarios.criar', 'proprietarios.editar', 'proprietarios.visualizar',
    'corretores.criar', 'corretores.editar', 'corretores.visualizar',
    'leads.criar', 'leads.editar', 'leads.visualizar', 'leads.visualizar_todos', 'leads.atribuir',
    'vendas.criar', 'vendas.visualizar', 'vendas.visualizar_todas', 'vendas.aprovar',
    'alugueis.criar', 'alugueis.visualizar', 'alugueis.aprovar',
    'comissoes.visualizar', 'comissoes.aprovar',
    'consultas.criar', 'consultas.visualizar',
    'relatorios.visualizar', 'relatorios.gerar', 'relatorios.financeiros'
  ],
  GERENTE: [
    'imoveis.visualizar',
    'proprietarios.visualizar',
    'corretores.visualizar',
    'leads.criar', 'leads.editar', 'leads.visualizar', 'leads.visualizar_todos', 'leads.atribuir',
    'vendas.criar', 'vendas.visualizar', 'vendas.visualizar_todas',
    'alugueis.criar', 'alugueis.visualizar',
    'comissoes.visualizar',
    'consultas.criar', 'consultas.visualizar',
    'relatorios.visualizar', 'relatorios.gerar'
  ],
  CORRETOR: [
    'imoveis.visualizar',
    'leads.criar', 'leads.editar', 'leads.visualizar',
    'vendas.criar', 'vendas.visualizar',
    'alugueis.criar', 'alugueis.visualizar',
    'comissoes.visualizar',
    'consultas.criar', 'consultas.visualizar'
  ],
  ASSISTENTE: [
    'imoveis.criar', 'imoveis.editar', 'imoveis.visualizar',
    'proprietarios.criar', 'proprietarios.visualizar',
    'leads.criar', 'leads.visualizar',
    'consultas.criar', 'consultas.visualizar'
  ],
  VISUALIZADOR: [
    'imoveis.visualizar',
    'proprietarios.visualizar',
    'leads.visualizar',
    'relatorios.visualizar'
  ]
};

// Funções de verificação
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

export function canManageUser(managerRole: Role, targetRole: Role): boolean {
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
}

// Hook principal
export function usePermission() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Buscar dados do usuário do cookie/localStorage ou API
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error: any) {
        console.error('Erro ao carregar usuário:', error);
      }
    }
    loadUser();
  }, []);

  const userRole: Role = user?.role || 'VISUALIZADOR';
  const userId = user?.id;
  const corretorId = user?.corretorId;

  return {
    // Dados do usuário
    user,
    userRole,
    userId,
    corretorId,
    isLoading: user === null,
    
    // Verificação de permissão única
    can: (permission: Permission) => hasPermission(userRole, permission),
    
    // Verificação de múltiplas permissões (AND)
    canAll: (permissions: Permission[]) => hasAllPermissions(userRole, permissions),
    
    // Verificação de múltiplas permissões (OR)
    canAny: (permissions: Permission[]) => hasAnyPermission(userRole, permissions),
    
    // Verificação se pode gerenciar outro usuário
    canManage: (targetRole: Role) => canManageUser(userRole, targetRole),
    
    // Helpers específicos
    isAdmin: userRole === 'SUPER_ADMIN' || userRole === 'ADMIN',
    isSuperAdmin: userRole === 'SUPER_ADMIN',
    isGerente: userRole === 'GERENTE',
    isCorretor: userRole === 'CORRETOR',
    
    // Verificação para ver apenas seus próprios registros
    canViewOwn: (resourceOwnerId: string) => {
      if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'GERENTE') {
        return true;
      }
      if (userRole === 'CORRETOR') {
        return corretorId === resourceOwnerId;
      }
      return false;
    },
    
    // Filtrar dados baseado no nível de acesso
    filterByAccess: <T extends { corretorId?: string | null }>(items: T[]): T[] => {
      if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'GERENTE') {
        return items;
      }
      if (userRole === 'CORRETOR' && corretorId) {
        return items.filter(item => item.corretorId === corretorId);
      }
      return [];
    }
  };
}

// Componente de acesso negado
function AccessDenied() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white border-4 border-red-600 rounded-lg shadow-2xl max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-3xl font-black uppercase italic text-slate-900 mb-2">
          Acesso Negado
        </h1>
        <p className="text-slate-600 mb-6">
          Você não tem permissão para acessar este recurso.
        </p>
        <a 
          href="/admin"
          className="inline-block bg-blue-600 text-white px-6 py-3 font-bold rounded hover:bg-blue-700 transition-colors uppercase"
        >
          ← Voltar ao Painel
        </a>
      </div>
    </div>
  );
}

// Componente de proteção de rota
export function ProtectedRoute({ 
  children, 
  permission,
  permissions,
  requireAll = true,
  fallback
}: {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}) {
  const { can, canAll, canAny, isLoading } = usePermission();
  
  if (isLoading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }
  
  let hasAccess = false;
  
  if (permission) {
    hasAccess = can(permission);
  } else if (permissions) {
    hasAccess = requireAll ? canAll(permissions) : canAny(permissions);
  } else {
    hasAccess = true; // Se não especificar permissão, permite
  }
  
  if (!hasAccess) {
    return <>{fallback || <AccessDenied />}</>;
  }
  
  return <>{children}</>;
}

// Hook para verificar permissões em tempo real
export function useRequirePermission(permission: Permission | Permission[], requireAll = true): boolean {
  const { can, canAll, canAny } = usePermission();
  
  const hasAccess = Array.isArray(permission)
    ? (requireAll ? canAll(permission) : canAny(permission))
    : can(permission);
  
  if (!hasAccess) {
    console.warn(`Permission denied: ${permission}`);
  }
  
  return hasAccess;
}
