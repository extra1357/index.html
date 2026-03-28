export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Listar todos os aluguéis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = status ? { status } : {};

    const alugueis = await prisma.aluguel.findMany({
      where,
      include: {
        imovel: true,
        inquilino: true,
        proprietario: true,
        corretor: true,
        pagamentos: {
          orderBy: { dataVencimento: 'desc' },
          take: 3
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(alugueis);
  } catch (error: any) {
    console.error('Erro ao buscar aluguéis:', error);
    return NextResponse.json({ error: 'Erro ao buscar aluguéis' }, { status: 500 });
  }
}

// POST - Criar novo aluguel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validações
    if (!body.imovelId || !body.inquilinoId || !body.corretorId || !body.valorAluguel || !body.dataInicio || !body.dataFim) {
      return NextResponse.json(
        { error: 'Imóvel, inquilino, corretor, valor, data início e fim são obrigatórios' },
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

    const valorAluguel = parseFloat(body.valorAluguel);
    const valorCondominio = body.valorCondominio ? parseFloat(body.valorCondominio) : 0;
    const valorIPTU = body.valorIPTU ? parseFloat(body.valorIPTU) : 0;
    const valorTotal = valorAluguel + valorCondominio + valorIPTU;

    const aluguel = await prisma.aluguel.create({
      data: {
        imovelId: body.imovelId,
        inquilinoId: body.inquilinoId,
        proprietarioId: imovel.proprietarioId,
        corretorId: body.corretorId,
        valorAluguel: valorAluguel,
        valorCondominio: valorCondominio || null,
        valorIPTU: valorIPTU || null,
        valorTotal: valorTotal,
        tipoGarantia: body.tipoGarantia || null,
        valorGarantia: body.valorGarantia ? parseFloat(body.valorGarantia) : null,
        dataInicio: new Date(body.dataInicio),
        dataFim: new Date(body.dataFim),
        diaVencimento: body.diaVencimento || 10,
        indiceReajuste: body.indiceReajuste || 'IGPM',
        taxaAdministracao: body.taxaAdministracao || 10,
        observacoes: body.observacoes || null,
        status: 'ativo'
      },
      include: {
        imovel: true,
        inquilino: true,
        corretor: true,
      }
    });

    // Atualiza status do imóvel
    await prisma.imovel.update({
      where: { id: body.imovelId },
      data: { status: 'ALUGADO', disponivel: false }
    });

    // Cria a comissão do corretor (geralmente 1 aluguel)
    const corretor = await prisma.corretor.findUnique({
      where: { id: body.corretorId }
    });

    if (corretor) {
      await prisma.comissao.create({
        data: {
          corretorId: body.corretorId,
          aluguelId: aluguel.id,
          tipo: 'ALUGUEL',
          valorBase: valorAluguel,
          percentual: 100, // 100% do primeiro aluguel
          valorComissao: valorAluguel,
          status: 'pendente'
        }
      });
    }

    // Gera os pagamentos mensais
    const dataInicio = new Date(body.dataInicio);
    const dataFim = new Date(body.dataFim);
    const pagamentos = [];

    let dataAtual = new Date(dataInicio);
    while (dataAtual <= dataFim) {
      const competencia = `${String(dataAtual.getMonth() + 1).padStart(2, '0')}/${dataAtual.getFullYear()}`;
      const dataVencimento = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), body.diaVencimento || 10);

      pagamentos.push({
        aluguelId: aluguel.id,
        competencia,
        dataVencimento,
        valorAluguel,
        valorCondominio: valorCondominio || null,
        valorIPTU: valorIPTU || null,
        valorTotal,
        status: 'pendente'
      });

      dataAtual.setMonth(dataAtual.getMonth() + 1);
    }

    await prisma.pagamentoAluguel.createMany({
      data: pagamentos
    });

    // Auditoria
    await prisma.auditoria.create({
      data: {
        acao: 'CREATE',
        tabela: 'Aluguel',
        registroId: aluguel.id,
        usuario: 'Sistema',
        dados: JSON.stringify({ valorAluguel, imovelId: body.imovelId })
      }
    });

    return NextResponse.json(aluguel, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar aluguel:', error);
    return NextResponse.json({ error: 'Erro ao criar aluguel', details: error.message }, { status: 500 });
  }
}
