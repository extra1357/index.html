export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET - Buscar um usuário
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: params.id },
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
      }
    });

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, usuario });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Editar usuário
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    console.log('✏️ Editando usuário:', params.id, body);

    // Verificar se usuário existe
    const existente = await prisma.usuario.findUnique({
      where: { id: params.id }
    });

    if (!existente) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Preparar dados para atualização
    const updateData: any = {
      nome: body.nome,
      email: body.email,
      role: body.role,
      ativo: body.ativo,
      corretorId: body.corretorId || null
    };

    // Se enviou nova senha, fazer hash
    if (body.senha) {
      updateData.senha = await bcrypt.hash(body.senha, 10);
    }

    // Atualizar
    const usuario = await prisma.usuario.update({
      where: { id: params.id },
      data: updateData,
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

    console.log('✅ Usuário atualizado:', usuario.id);

    return NextResponse.json({
      success: true,
      usuario,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error: any) {
    console.error('❌ Erro ao atualizar:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Desativar usuário (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Apenas desativa, não deleta
    const usuario = await prisma.usuario.update({
      where: { id: params.id },
      data: { ativo: false }
    });

    console.log('🗑️ Usuário desativado:', usuario.id);

    return NextResponse.json({
      success: true,
      message: 'Usuário desativado com sucesso'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
