export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET - Listar todos os usuários
export async function GET(request: NextRequest) {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        ultimoLogin: true,
        createdAt: true,
        corretor: {
          select: {
            id: true,
            nome: true,
            creci: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, usuarios });
  } catch (error: any) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Criar novo usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📝 Criando usuário:', body);

    // Validações
    if (!body.nome || !body.email || !body.senha) {
      return NextResponse.json(
        { success: false, error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const existente = await prisma.usuario.findUnique({
      where: { email: body.email }
    });

    if (existente) {
      return NextResponse.json(
        { success: false, error: 'Email já cadastrado' },
        { status: 400 }
      );
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(body.senha, 10);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome: body.nome,
        email: body.email,
        senha: senhaHash,
        role: body.role || 'VISUALIZADOR',
        ativo: body.ativo !== undefined ? body.ativo : true,
        corretorId: body.corretorId || null
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        ultimoLogin: true,
        corretor: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    console.log('✅ Usuário criado:', usuario.id);

    return NextResponse.json({
      success: true,
      usuario,
      message: 'Usuário cadastrado com sucesso'
    });
  } catch (error: any) {
    console.error('❌ Erro ao criar usuário:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
