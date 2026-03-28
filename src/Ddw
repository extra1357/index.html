export const dynamic = 'force-dynamic';

/**
 * 🛡️ MIDDLEWARE DE SEGURANÇA - STR Imobiliária
 * Atualizado com sistema completo de roles e permissões
 * 
 * ✅ CORREÇÃO: Liberado acesso público a /imoveis/[id]
 */
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'TROQUE');

// Tipos de roles do sistema
type Role = 'SUPER_ADMIN' | 'ADMIN' | 'GERENTE' | 'CORRETOR' | 'ASSISTENTE' | 'VISUALIZADOR';

// ✅ ROTAS PÚBLICAS - Qualquer pessoa pode acessar
const PUBLIC_ROUTES = [
  '/',
  '/admin/login',
  '/imoveis-publicos',
  '/imoveis',              // ← ADICIONADO: Página de detalhes públicos
  '/api/auth/login',
  '/admin/esqueci-senha',
  '/admin/redefinir-senha',
  '/api/auth/solicitar-reset',
  '/api/auth/redefinir-senha',
  '/api/imoveis/publico',
  '/api/imoveis',          // ← ADICIONADO: API pública de imóveis
  '/api/busca',
];

// 🔒 MAPA DE ROTAS E ROLES PERMITIDAS
const ROUTE_PERMISSIONS: Record<string, Role[]> = {
  // === SISTEMA E USUÁRIOS ===
  '/admin/usuarios': ['SUPER_ADMIN', 'ADMIN'],
  '/admin/usuarios/novo': ['SUPER_ADMIN', 'ADMIN'],
  '/api/usuarios': ['SUPER_ADMIN', 'ADMIN'],
  '/admin/configuracoes': ['SUPER_ADMIN'],
  '/admin/auditoria': ['SUPER_ADMIN', 'ADMIN'],
  '/api/sistema': ['SUPER_ADMIN'],
  
  // === IMÓVEIS ===
  '/admin/imoveis': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'CORRETOR', 'ASSISTENTE', 'VISUALIZADOR'],
  '/admin/imoveis/novo': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'ASSISTENTE'],
  '/api/imoveis/cadastro': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'ASSISTENTE'],
  
  // === PROPRIETÁRIOS ===
  '/admin/proprietarios': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'ASSISTENTE', 'VISUALIZADOR'],
  '/admin/proprietarios/novo': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'ASSISTENTE'],
  '/api/proprietarios': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'ASSISTENTE', 'VISUALIZADOR'],
  
  // === CORRETORES ===
  '/admin/corretores': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'VISUALIZADOR'],
  '/admin/corretores/novo': ['SUPER_ADMIN', 'ADMIN'],
  '/api/corretores': ['SUPER_ADMIN', 'ADMIN', 'GERENTE'],
  
  // === LEADS ===
  '/admin/leads': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'CORRETOR', 'ASSISTENTE', 'VISUALIZADOR'],
  '/admin/leads/novo': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'CORRETOR', 'ASSISTENTE'],
  '/api/leads': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'CORRETOR', 'ASSISTENTE', 'VISUALIZADOR'],
  
  // === VENDAS ===
  '/admin/vendas': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'CORRETOR', 'VISUALIZADOR'],
  '/admin/vendas/nova': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'CORRETOR'],
  '/api/vendas': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'CORRETOR', 'VISUALIZADOR'],
  '/api/vendas/aprovar': ['SUPER_ADMIN', 'ADMIN', 'GERENTE'],
  
  // === ALUGUÉIS ===
  '/admin/alugueis': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'CORRETOR', 'VISUALIZADOR'],
  '/admin/alugueis/novo': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'CORRETOR'],
  '/api/alugueis': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'CORRETOR', 'VISUALIZADOR'],
  
  // === COMISSÕES ===
  '/admin/comissoes': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'CORRETOR', 'VISUALIZADOR'],
  '/api/comissoes': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'CORRETOR', 'VISUALIZADOR'],
  '/api/comissoes/aprovar': ['SUPER_ADMIN', 'ADMIN'],
  '/api/comissoes/pagar': ['SUPER_ADMIN', 'ADMIN'],
  
  // === CONSULTAS ===
  '/admin/consultas': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'CORRETOR', 'ASSISTENTE'],
  '/api/consultas': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'CORRETOR', 'ASSISTENTE'],
  
  // === RELATÓRIOS ===
  '/admin/analise-mercado': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'VISUALIZADOR'],
  '/admin/relatorios': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'VISUALIZADOR'],
  '/admin/leads/relatorio': ['SUPER_ADMIN', 'ADMIN', 'GERENTE'],
  '/api/analises': ['SUPER_ADMIN', 'ADMIN', 'GERENTE'],
  '/api/analise-mercado': ['SUPER_ADMIN', 'ADMIN', 'GERENTE'],
  '/api/relatorios': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'VISUALIZADOR'],
  
  // === DASHBOARD ===
  '/admin/dashboard': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'CORRETOR', 'ASSISTENTE', 'VISUALIZADOR'],
  '/admin': ['SUPER_ADMIN', 'ADMIN', 'GERENTE', 'CORRETOR', 'ASSISTENTE', 'VISUALIZADOR'],
};

// Função para verificar se é rota pública
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    // Correspondência exata
    if (pathname === route) return true;
    
    // Para /imoveis, aceitar /imoveis/[qualquer-id]
    if (route === '/imoveis' && pathname.startsWith('/imoveis/')) return true;
    
    // Para /api/imoveis, aceitar /api/imoveis/[qualquer-coisa] (exceto /api/imoveis/cadastro que é protegida)
    if (route === '/api/imoveis' && pathname.startsWith('/api/imoveis/') && !pathname.includes('/cadastro')) return true;
    
    // Rotas que terminam com /publico
    if (route.endsWith('/publico') && pathname.startsWith(route)) return true;
    
    return false;
  });
}

// Função para verificar se usuário tem permissão na rota
function hasRoutePermission(pathname: string, userRole: Role): boolean {
  // Procura correspondência exata primeiro
  if (ROUTE_PERMISSIONS[pathname]) {
    return ROUTE_PERMISSIONS[pathname].includes(userRole);
  }
  
  // Procura por rotas que começam com o pathname (para rotas dinâmicas)
  for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      return allowedRoles.includes(userRole);
    }
  }
  
  // ✅ CORREÇÃO: Se não encontrou regra específica, apenas usuários admin+ podem acessar
  // rotas /admin/* e /api/* não mapeadas (mas /imoveis/* já foi liberado em PUBLIC_ROUTES)
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    return ['SUPER_ADMIN', 'ADMIN'].includes(userRole);
  }
  
  return false;
}

// Verificar token JWT
async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { 
      userId: string; 
      email: string; 
      role: Role;
      corretorId?: string;
      nome?: string;
    };
  } catch (error: unknown) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// MIDDLEWARE PRINCIPAL
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ===== IGNORAR ARQUIVOS ESTÁTICOS =====
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/favicon') ||
      pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // ===== ROTAS PÚBLICAS =====
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  // ===== VERIFICAR AUTENTICAÇÃO =====
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'Não autenticado', code: 'NO_TOKEN' }, 
        { status: 401 }
      );
    }
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // ===== VALIDAR TOKEN =====
  const payload = await verifyToken(token);
  
  if (!payload) {
    if (pathname.startsWith('/api')) {
      const response = NextResponse.json(
        { error: 'Token inválido ou expirado', code: 'INVALID_TOKEN' }, 
        { status: 401 }
      );
      response.cookies.delete('auth-token');
      return response;
    } else {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth-token');
      return response;
    }
  }
  
  // ===== VERIFICAR PERMISSÃO DE ACESSO =====
  const userRole = payload.role as Role;
  
  if (!hasRoutePermission(pathname, userRole)) {
    // Log para auditoria
    console.warn(`[ACCESS DENIED] User ${payload.email} (${userRole}) tried to access ${pathname}`);
    
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { 
          error: 'Acesso negado', 
          code: 'INSUFFICIENT_PERMISSIONS',
          required: 'Nível de acesso insuficiente',
          userRole 
        }, 
        { status: 403 }
      );
    }
    
    // Redirecionar para página de acesso negado
    const deniedUrl = new URL('/admin/acesso-negado', request.url);
    deniedUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(deniedUrl);
  }
  
  // ===== ADICIONAR HEADERS COM INFO DO USUÁRIO =====
  const response = NextResponse.next();
  
  // Headers úteis para as APIs e páginas
  response.headers.set('x-user-id', payload.userId);
  response.headers.set('x-user-role', userRole);
  response.headers.set('x-user-email', payload.email);
  
  if (payload.corretorId) {
    response.headers.set('x-corretor-id', payload.corretorId);
  }
  
  return response;
}

// Configuração do matcher
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
