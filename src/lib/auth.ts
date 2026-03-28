/**
 * 🔒 SISTEMA DE AUTENTICAÇÃO JWT
 */
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'TROQUE_ESTA_CHAVE'
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function generateToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as unknown as JWTPayload;
}

export function setAuthCookies(response: NextResponse, token: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24
  });
  response.cookies.set('authenticated', 'true', {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete('auth-token');
  response.cookies.delete('authenticated');
}

export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}
