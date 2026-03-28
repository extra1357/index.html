export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Status que tornam o imóvel indisponível automaticamente
const STATUS_INDISPONIVEL = ['VENDIDO', 'ALUGADO', 'INATIVO', 'EM_NEGOCIACAO', 'TEMPORARIAMENTE_INDISPONIVEL'];

// GET - Buscar imóvel por ID com vendas e proprietário
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const imovel = await prisma.imovel.findUnique({
      where: { id: params.id },
      include: {
        proprietario: true,
        vendas: {
          include: {
            lead: { select: { nome: true, email: true, telefone: true } },
            corretor: { select: { nome: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        alugueis: {
          include: {
            inquilino: { select: { nome: true, email: true } },
            corretor: { select: { nome: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!imovel) {
      return NextResponse.json({ error: 'Imóvel não encontrado' }, { status: 404 });
    }

    return NextResponse.json(imovel);
  } catch (error: any) {
    console.error('❌ Erro ao buscar imóvel:', error);
    return NextResponse.json({ error: 'Erro interno', detalhes: error.message }, { status: 500 });
  }
}

// PUT - Atualizar imóvel
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Lógica automática de disponibilidade baseada no status
    let disponivel = body.disponivel;
    if (STATUS_INDISPONIVEL.includes(body.status)) {
      disponivel = false;
    } else if (body.status === 'ATIVO') {
      disponivel = true;
    }

    const atualizado = await prisma.imovel.update({
      where: { id: params.id },
      data: {
        tipo: body.tipo,
        endereco: body.endereco,
        bairro: body.bairro || null,
        cidade: body.cidade,
        estado: body.estado,
        cep: body.cep || null,
        preco: body.preco,
        precoAluguel: body.precoAluguel || null,
        metragem: body.metragem,
        quartos: body.quartos,
        banheiros: body.banheiros,
        suites: body.suites,
        vagas: body.vagas,
        descricao: body.descricao || null,
        status: body.status,
        disponivel,
        finalidade: body.finalidade,
        destaque: body.destaque,
        proprietarioId: body.proprietarioId,
        imagens: body.imagens || [],
        caracteristicas: body.caracteristicas || [],
        codigo: body.codigo || null,
        slug: body.slug || null,
      },
      include: {
        proprietario: true,
        vendas: {
          include: {
            lead: { select: { nome: true } },
            corretor: { select: { nome: true } },
          },
        },
      },
    });

    // Registra auditoria
    await prisma.auditoria.create({
      data: {
        acao: 'UPDATE',
        tabela: 'imoveis',
        registroId: params.id,
        usuario: 'admin',
        dados: JSON.stringify({
          status: body.status,
          disponivel,
          tipo: body.tipo,
          cidade: body.cidade,
        }),
      },
    });

    return NextResponse.json(atualizado);
  } catch (error: any) {
    console.error('❌ Erro ao atualizar imóvel:', error);
    return NextResponse.json({ error: 'Erro ao atualizar', detalhes: error.message }, { status: 500 });
  }
}

// DELETE - Remover imóvel
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.imovel.delete({ where: { id: params.id } });

    await prisma.auditoria.create({
      data: {
        acao: 'DELETE',
        tabela: 'imoveis',
        registroId: params.id,
        usuario: 'admin',
      },
    });

    return NextResponse.json({ mensagem: 'Imóvel removido com sucesso' });
  } catch (error: any) {
    console.error('❌ Erro ao deletar imóvel:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
