export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar lead por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: { 
        consultas: {
          include: { imovel: true }
        }, 
        historicos: true 
      }
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error: any) {
    console.error('Erro ao buscar lead:', error);
    return NextResponse.json({ error: 'Erro ao buscar lead' }, { status: 500 });
  }
}

// PUT - Atualizar lead
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        nome: body.nome,
        email: body.email,
        telefone: body.telefone,
        origem: body.origem,
        status: body.status,
        imovelInteresse: body.imovelInteresse,
        mensagem: body.mensagem,
        corretorId: body.corretorId || null,
      }
    });

    return NextResponse.json(lead);
  } catch (error: any) {
    console.error('Erro ao atualizar lead:', error);
    return NextResponse.json({ error: 'Erro ao atualizar lead' }, { status: 500 });
  }
}

// DELETE - Deletar lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.lead.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Lead deletado com sucesso' });
  } catch (error: any) {
    console.error('Erro ao deletar lead:', error);
    return NextResponse.json({ error: 'Erro ao deletar lead' }, { status: 500 });
  }
}
