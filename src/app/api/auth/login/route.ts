// REMOVIDO: export const runtime = 'experimental-edge'
// O edge runtime pode ter problemas ao setar cookies com Prisma/bcrypt.
// Node.js runtime é o correto para rotas com banco de dados.
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'TROQUE');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { email, password, senha } = body;
    const senhaFinal = password || senha;

    console.log('📧 Email:', email);
    console.log('🔑 Senha recebida:', senhaFinal ? 'SIM' : 'NÃO');

    if (!email || !senhaFinal) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        corretor: {
          select: { id: true, nome: true, creci: true }
        }
      }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    if (!usuario.ativo) {
      return NextResponse.json(
        { error: 'Usuário desativado' },
        { status: 403 }
      );
    }

    if (usuario.bloqueadoAte && usuario.bloqueadoAte > new Date()) {
      const minutosRestantes = Math.ceil(
        (usuario.bloqueadoAte.getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        {
          error: `Usuário bloqueado. Tente em ${minutosRestantes} minutos.`,
          bloqueadoAte: usuario.bloqueadoAte
        },
        { status: 423 }
      );
    }

    const senhaValida = await bcrypt.compare(senhaFinal, usuario.senha);

    if (!senhaValida) {
      const tentativas = (usuario.tentativasLogin || 0) + 1;
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          tentativasLogin: tentativas,
          bloqueadoAte: tentativas >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null
        }
      });
      return NextResponse.json(
        { error: 'Credenciais inválidas', tentativasRestantes: Math.max(0, 5 - tentativas) },
        { status: 401 }
      );
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        tentativasLogin: 0,
        bloqueadoAte: null,
        ultimoLogin: new Date()
      }
    });

    const token = await new SignJWT({
      userId: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      role: usuario.role,
      corretorId: usuario.corretorId || undefined,
      corretorNome: usuario.corretor?.nome || undefined
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    await prisma.auditoria.create({
      data: {
        usuario: usuario.id,
        acao: 'LOGIN',
        tabela: 'usuarios',
        registroId: usuario.id,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    }).catch(() => {});

    const response = NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        corretor: usuario.corretor
      }
    });

    // Cookie com configurações explícitas e compatíveis com o middleware
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24h
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('💥 ERRO:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logout realizado' });
  response.cookies.delete('auth-token');
  return response;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    const { jwtVerify } = await import('jose');
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.userId as string },
      include: { corretor: true }
    });
    if (!usuario || !usuario.ativo) {
      return NextResponse.json({ error: 'Usuário inválido' }, { status: 401 });
    }
    return NextResponse.json({
      authenticated: true,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        corretor: usuario.corretor
      }
    });
  } catch {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}
