// src/lib/permissions.ts

// ================================
// ROLES
// ================================
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  GERENTE = 'GERENTE',
  CORRETOR = 'CORRETOR',
  ASSISTENTE = 'ASSISTENTE',
  VISUALIZADOR = 'VISUALIZADOR',
}

// ================================
// PERMISSIONS
// ================================
export type Permission =
  | 'ADMIN_ACCESS'
  | 'USER_CREATE'
  | 'USER_EDIT'
  | 'USER_DELETE'
  | 'IMOVEL_CREATE'
  | 'IMOVEL_EDIT'
  | 'IMOVEL_DELETE'
  | 'VENDA_CREATE'
  | 'VENDA_EDIT'
  | 'VENDA_DELETE'
  | 'RELATORIO_VIEW';

// ================================
// PERMISSÕES POR ROLE (RBAC)
// ================================
const rolePermissions: Record<Role, Permission[]> = {
  SUPER_ADMIN: ['ADMIN_ACCESS'],
  ADMIN: ['ADMIN_ACCESS'],
  GERENTE: [
    'IMOVEL_CREATE',
    'IMOVEL_EDIT',
    'VENDA_CREATE',
    'VENDA_EDIT',
    'RELATORIO_VIEW',
  ],
  CORRETOR: ['VENDA_CREATE'],
  ASSISTENTE: ['IMOVEL_CREATE'],
  VISUALIZADOR: [],
};

// ================================
// HELPERS INTERNOS
// ================================
function normalizePermissions(
  role: Role,
  userPermissions?: Permission[]
): Permission[] {
  const basePermissions = rolePermissions[role] ?? [];

  // SUPER_ADMIN ignora tudo
  if (basePermissions.includes('ADMIN_ACCESS')) {
    return ['ADMIN_ACCESS'];
  }

  return Array.from(
    new Set([
      ...basePermissions,
      ...(userPermissions ?? []),
    ])
  );
}

// ================================
// API PÚBLICA (USADA PELO HOOK)
// ================================
export function hasPermission(
  role: Role,
  permission: Permission,
  userPermissions?: Permission[]
): boolean {
  const permissions = normalizePermissions(role, userPermissions);

  return (
    permissions.includes(permission) ||
    permissions.includes('ADMIN_ACCESS')
  );
}

export function hasAllPermissions(
  role: Role,
  permissionsToCheck: Permission[],
  userPermissions?: Permission[]
): boolean {
  const permissions = normalizePermissions(role, userPermissions);

  return permissionsToCheck.every(
    (p) =>
      permissions.includes(p) ||
      permissions.includes('ADMIN_ACCESS')
  );
}

export function hasAnyPermission(
  role: Role,
  permissionsToCheck: Permission[],
  userPermissions?: Permission[]
): boolean {
  const permissions = normalizePermissions(role, userPermissions);

  return permissionsToCheck.some(
    (p) =>
      permissions.includes(p) ||
      permissions.includes('ADMIN_ACCESS')
  );
}

export function canManageUser(
  currentRole: Role,
  targetRole: Role
): boolean {
  if (currentRole === Role.SUPER_ADMIN) return true;

  if (currentRole === Role.ADMIN) {
    return targetRole !== Role.SUPER_ADMIN;
  }

  return false;
}

