export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Listar todos os corretores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ativo = searchParams.get('ativo');

    const where = ativo !== null ? { ativo: ativo === 'true' } : {};

    const corretores = await prisma.corretor.findMany({
      where,
      include: {
        _count: {
          select: {
            leads: true,
            vendas: true,
            alugueis: true,
            comissoes: true,
          }
        }
      },
      orderBy: { nome: 'asc' }
    });

    return NextResponse.json(corretores);
  } catch (error: any) {
    console.error('Erro ao buscar corretores:', error);
    return NextResponse.json({ error: 'Erro ao buscar corretores' }, { status: 500 });
  }
}

// POST - Criar novo corretor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.nome || !body.email || !body.telefone || !body.creci) {
      return NextResponse.json(
        { error: 'Nome, email, telefone e CRECI são obrigatórios' },
        { status: 400 }
      );
    }

    const emailExiste = await prisma.corretor.findUnique({
      where: { email: body.email }
    });
    if (emailExiste) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 });
    }

    const creciExiste = await prisma.corretor.findUnique({
      where: { creci: body.creci }
    });
    if (creciExiste) {
      return NextResponse.json({ error: 'CRECI já cadastrado' }, { status: 409 });
    }

    const corretor = await prisma.corretor.create({
      data: {
        nome: body.nome,
        email: body.email,
        telefone: body.telefone,
        cpf: body.cpf || null,
        creci: body.creci,
        banco: body.banco || null,
        agencia: body.agencia || null,
        conta: body.conta || null,
        tipoConta: body.tipoConta || null,
        pix: body.pix || null,
        comissaoPadrao: body.comissaoPadrao || 50,
        observacoes: body.observacoes || null,
      }
    });

    await prisma.auditoria.create({
      data: {
        acao: 'CREATE',
        tabela: 'Corretor',
        registroId: corretor.id,
        usuario: 'Sistema',
        dados: JSON.stringify({ nome: corretor.nome, creci: corretor.creci })
      }
    });

    return NextResponse.json(corretor, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar corretor:', error);
    return NextResponse.json({ error: 'Erro ao criar corretor', details: error.message }, { status: 500 });
  }
}
