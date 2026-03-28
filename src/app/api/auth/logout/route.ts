import { NextResponse } from 'next/server';

// GET — RSC prefetch / navegação direta: redireciona para login sem erro 405
export async function GET() {
  return NextResponse.redirect(
    new URL('/login', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')
  );
}

// POST — logout real: limpa o cookie de sessão
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    maxAge: 0,
    path: '/',
  });
  return response;
}
