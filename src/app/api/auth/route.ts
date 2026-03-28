export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Instância local do Prisma para garantir que o build não quebre por imports externos
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    // Busca o usuário no banco de dados (sem senha na string de conexão, conforme sua configuração)
    const user = await prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        senha: true,
        role: true,
        ativo: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    if (!user.ativo) {
      return NextResponse.json({ error: 'Usuário inativo' }, { status: 403 });
    }

    // Validação da senha com bcrypt
    const senhaValida = await bcrypt.compare(password, user.senha);

    if (!senhaValida) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    // Removemos a senha antes de enviar para o cliente
    const { senha, ...userData } = user;

    // Criamos a resposta de sucesso
    const response = NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token: `bearer-${user.id}`,
        user: userData
      }
    });

    // RESOLVE O SPINNER: Define o cookie que o Middleware exige para permitir acesso às rotas /admin
    response.cookies.set('admin-logged', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 horas de duração
    });

    return response;

  } catch (error: any) {
    console.error('❌ Erro no login:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
