export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Listar todas as vendas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = status ? { status } : {};

    const vendas = await prisma.venda.findMany({
      where,
      include: {
        imovel: true,
        lead: true,
        proprietario: true,
        corretor: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(vendas);
  } catch (error: any) {
    console.error('Erro ao buscar vendas:', error);
    return NextResponse.json({ error: 'Erro ao buscar vendas' }, { status: 500 });
  }
}

// POST - Criar nova venda
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validações
    if (!body.imovelId || !body.leadId || !body.corretorId || !body.valorVenda) {
      return NextResponse.json(
        { error: 'Imóvel, comprador, corretor e valor são obrigatórios' },
        { status: 400 }
      );
    }

    // Busca o imóvel para pegar o proprietário
    const imovel = await prisma.imovel.findUnique({
      where: { id: body.imovelId }
    });

    if (!imovel) {
      return NextResponse.json({ error: 'Imóvel não encontrado' }, { status: 404 });
    }

    const valorVenda = parseFloat(body.valorVenda);
    const percentualComissao = body.percentualComissao || 6;
    const valorComissao = (valorVenda * percentualComissao) / 100;

    const venda = await prisma.venda.create({
      data: {
        imovelId: body.imovelId,
        leadId: body.leadId,
        proprietarioId: imovel.proprietarioId,
        corretorId: body.corretorId,
        valorVenda: valorVenda,
        valorEntrada: body.valorEntrada ? parseFloat(body.valorEntrada) : null,
        valorFinanciado: body.valorFinanciado ? parseFloat(body.valorFinanciado) : null,
        percentualComissao: percentualComissao,
        valorComissao: valorComissao,
        formaPagamento: body.formaPagamento || null,
        bancoFinanciamento: body.bancoFinanciamento || null,
        observacoes: body.observacoes || null,
        status: 'proposta'
      },
      include: {
        imovel: true,
        lead: true,
        corretor: true,
      }
    });

    // Cria a comissão do corretor automaticamente
    const corretor = await prisma.corretor.findUnique({
      where: { id: body.corretorId }
    });

    if (corretor) {
      const comissaoCorretor = (valorComissao * Number(corretor.comissaoPadrao)) / 100;
      
      await prisma.comissao.create({
        data: {
          corretorId: body.corretorId,
          vendaId: venda.id,
          tipo: 'VENDA',
          valorBase: valorVenda,
          percentual: Number(corretor.comissaoPadrao),
          valorComissao: comissaoCorretor,
          status: 'pendente'
        }
      });
    }

    // Auditoria
    await prisma.auditoria.create({
      data: {
        acao: 'CREATE',
        tabela: 'Venda',
        registroId: venda.id,
        usuario: 'Sistema',
        dados: JSON.stringify({ valorVenda, imovelId: body.imovelId })
      }
    });

    return NextResponse.json(venda, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar venda:', error);
    return NextResponse.json({ error: 'Erro ao criar venda', details: error.message }, { status: 500 });
  }
}
