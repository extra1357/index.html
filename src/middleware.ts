export const runtime = 'experimental-edge';

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = process.env.JWT_SECRET || 'TROQUE_AQUI'
const JWT_SECRET = new TextEncoder().encode(secret)

type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'GERENTE'
  | 'CORRETOR'
  | 'ASSISTENTE'
  | 'VISUALIZADOR'

const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 6,
  ADMIN: 5,
  GERENTE: 4,
  CORRETOR: 3,
  ASSISTENTE: 2,
  VISUALIZADOR: 1,
}

function hasMinRole(userRole: Role, minRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole]
}

// ─── Rotas de página públicas ────────────────────────────────────────────────
const PUBLIC_ROUTES = [
  '/',
  '/admin/login',
  '/admin/esqueci-senha',
  '/admin/redefinir-senha',
  '/imoveis',
  '/imoveis-publicos',
  '/imoveis-salto',
  '/imoveis-campinas',
  '/imoveis-indaiatuba',
  '/imoveis-itu',
  '/imoveis-porto-feliz',
  '/imoveis-sorocaba',
]

// ─── APIs públicas (sem token) ───────────────────────────────────────────────
const PUBLIC_APIS = [
  '/api/auth/login',
  '/api/auth/logout',          // ← logout liberado (RSC faz GET aqui)
  '/api/auth/redefinir-senha',
  '/api/auth/solicitar-reset',
  '/api/imoveis/publico',      // ← listagem pública de imóveis
  '/api/busca',                // ← busca pública
]

// ─── Rotas protegidas por role mínima ────────────────────────────────────────
const PROTECTED_ROUTES: { pattern: string; minRole: Role }[] = [
  { pattern: '/admin/usuarios',          minRole: 'ADMIN' },
  { pattern: '/admin/configuracoes',     minRole: 'ADMIN' },
  { pattern: '/admin/relatorios',        minRole: 'GERENTE' },
  { pattern: '/api/admin/usuarios',      minRole: 'ADMIN' },
  { pattern: '/api/admin/configuracoes', minRole: 'SUPER_ADMIN' },
]

function isPublicRoute(path: string) {
  return PUBLIC_ROUTES.some(route =>
    path === route || path.startsWith(route + '/')
  )
}

function isPublicApi(path: string) {
  return PUBLIC_APIS.some(route => path.startsWith(route))
}

function getRequiredRole(path: string): Role | null {
  const match = PROTECTED_ROUTES.find(r => path.startsWith(r.pattern))
  return match ? match.minRole : null
}

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { userId: string; email: string; role: Role }
  } catch {
    return null
  }
}

function unauthorizedApiResponse(message: string, status: 401 | 403, deleteCookie = false) {
  const res = NextResponse.json({ error: message }, { status })
  if (deleteCookie) res.cookies.delete('auth-token')
  return res
}

function redirectToLogin(request: NextRequest, pathname: string, deleteCookie = false) {
  const loginUrl = new URL('/admin/login', request.url)
  loginUrl.searchParams.set('redirect', pathname)
  const res = NextResponse.redirect(loginUrl)
  if (deleteCookie) res.cookies.delete('auth-token')
  return res
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignora arquivos estáticos e internos do Next
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Rotas e APIs públicas passam direto
  if (isPublicRoute(pathname) || isPublicApi(pathname)) {
    return NextResponse.next()
  }

  // Verifica token
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    if (pathname.startsWith('/api')) {
      return unauthorizedApiResponse('Nao autenticado', 401)
    }
    return redirectToLogin(request, pathname)
  }

  const payload = await verifyToken(token)

  if (!payload) {
    if (pathname.startsWith('/api')) {
      return unauthorizedApiResponse('Token invalido ou expirado', 401, true)
    }
    return redirectToLogin(request, pathname, true)
  }

  // Verifica role mínima para rotas restritas
  const requiredRole = getRequiredRole(pathname)

  if (requiredRole && !hasMinRole(payload.role, requiredRole)) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'Sem permissao para acessar este recurso' },
        { status: 403 }
      )
    }
    return NextResponse.redirect(new URL('/admin/sem-permissao', request.url))
  }

  // Injeta dados do usuário nos headers para as rotas consumirem
  const response = NextResponse.next()
  response.headers.set('x-user-id', payload.userId)
  response.headers.set('x-user-role', payload.role)
  response.headers.set('x-user-email', payload.email)

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
}
