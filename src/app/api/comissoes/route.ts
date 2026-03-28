export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Listar todas as comissões
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const corretorId = searchParams.get('corretorId');

    const where: any = {};
    if (status) where.status = status;
    if (corretorId) where.corretorId = corretorId;

    const comissoes = await prisma.comissao.findMany({
      where,
      include: {
        corretor: true,
        venda: {
          include: { imovel: true }
        },
        aluguel: {
          include: { imovel: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calcula totais
    const totais = {
      pendente: 0,
      aprovada: 0,
      paga: 0
    };

    comissoes.forEach((c: any) => {
      if (c.status === 'pendente') totais.pendente += Number(c.valorComissao);
      if (c.status === 'aprovada') totais.aprovada += Number(c.valorComissao);
      if (c.status === 'paga') totais.paga += Number(c.valorComissao);
    });

    return NextResponse.json({ comissoes, totais });
  } catch (error: any) {
    console.error('Erro ao buscar comissões:', error);
    return NextResponse.json({ error: 'Erro ao buscar comissões' }, { status: 500 });
  }
}

// POST - Criar comissão manual (bônus, captação, etc)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.corretorId || !body.tipo || !body.valorComissao) {
      return NextResponse.json(
        { error: 'Corretor, tipo e valor são obrigatórios' },
        { status: 400 }
      );
    }

    const comissao = await prisma.comissao.create({
      data: {
        corretorId: body.corretorId,
        tipo: body.tipo,
        valorBase: body.valorBase || body.valorComissao,
        percentual: body.percentual || 100,
        valorComissao: parseFloat(body.valorComissao),
        status: 'pendente',
        dataPrevista: body.dataPrevista ? new Date(body.dataPrevista) : null,
        observacoes: body.observacoes || null
      },
      include: {
        corretor: true
      }
    });

    return NextResponse.json(comissao, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar comissão:', error);
    return NextResponse.json({ error: 'Erro ao criar comissão', details: error.message }, { status: 500 });
  }
}

// PATCH - Atualizar status da comissão
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id || !body.status) {
      return NextResponse.json(
        { error: 'ID e status são obrigatórios' },
        { status: 400 }
      );
    }

    const updateData: any = { status: body.status };
    
    if (body.status === 'paga') {
      updateData.dataPagamento = new Date();
    }

    const comissao = await prisma.comissao.update({
      where: { id: body.id },
      data: updateData,
      include: {
        corretor: true
      }
    });

    // Auditoria
    await prisma.auditoria.create({
      data: {
        acao: 'UPDATE',
        tabela: 'Comissao',
        registroId: comissao.id,
        usuario: 'Sistema',
        dados: JSON.stringify({ status: body.status })
      }
    });

    return NextResponse.json(comissao);
  } catch (error: any) {
    console.error('Erro ao atualizar comissão:', error);
    return NextResponse.json({ error: 'Erro ao atualizar comissão', details: error.message }, { status: 500 });
  }
}
