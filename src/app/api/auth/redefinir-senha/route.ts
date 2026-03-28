export const dynamic = 'force-dynamic';

// app/api/auth/redefinir-senha/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { token, novaSenha } = await request.json();

    if (!token || !novaSenha) {
      return NextResponse.json(
        { error: 'Token e nova senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar senha
    if (novaSenha.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      );
    }

    // Buscar usuário com o token
    const usuario = await prisma.usuario.findFirst({
      where: {
        resetToken: token,
        resetTokenExpira: {
          gte: new Date() // Token ainda não expirou
        }
      }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado. Solicite um novo reset de senha.' },
        { status: 400 }
      );
    }

    // Verificar se usuário está ativo
    if (!usuario.ativo) {
      return NextResponse.json(
        { error: 'Usuário inativo. Contate o administrador.' },
        { status: 403 }
      );
    }

    // Criptografar nova senha
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualizar senha e limpar token
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        senha: senhaHash,
        resetToken: null,
        resetTokenExpira: null
      }
    });

    // Log de auditoria
    await prisma.auditoria.create({
      data: {
        usuario: usuario.id,
        acao: 'REDEFINIR_SENHA',
        tabela: 'usuarios',
        registroId: usuario.id,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    }).catch(err => console.error('Erro ao registrar auditoria:', err));

    return NextResponse.json({
      success: true,
      message: 'Senha redefinida com sucesso! Você já pode fazer login.'
    });

  } catch (error: any) {
    console.error('Erro ao redefinir senha:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
}

// Endpoint para validar token (opcional - para verificar antes de mostrar formulário)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findFirst({
      where: {
        resetToken: token,
        resetTokenExpira: {
          gte: new Date()
        }
      },
      select: {
        id: true,
        nome: true,
        email: true
      }
    });

    if (!usuario) {
      return NextResponse.json(
        { valid: false, error: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      usuario: {
        nome: usuario.nome,
        email: usuario.email
      }
    });

  } catch (error: any) {
    console.error('Erro ao validar token:', error);
    return NextResponse.json(
      { error: 'Erro ao validar token' },
      { status: 500 }
    );
  }
}
