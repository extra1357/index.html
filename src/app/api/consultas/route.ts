export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const text = await request.text();
    if (!text) {
      return NextResponse.json({ message: 'Corpo da requisição vazio' }, { status: 400 });
    }

    const body: any = JSON.parse(text);

    // Validação: Para uma consulta, precisamos do Lead e do Imóvel
    if (!body.leadId || !body.imovelId) {
      return NextResponse.json({ message: 'Lead e Imóvel são obrigatórios' }, { status: 400 });
    }

    const consulta = await prisma.consulta.create({
      data: {
        leadId: body.leadId,
        imovelId: body.imovelId,
        data: new Date(body.data || new Date()),
        status: body.status || 'ABERTA',
        observacoes: body.observacoes || '',
        valorProposta: body.valorProposta ? parseFloat(body.valorProposta) : null
      },
      include: {
        lead: true,
        imovel: true
      }
    });

    return NextResponse.json(consulta, { status: 201 });
  } catch (error: any) {
    console.error("❌ Erro ao salvar consulta:", error);
    return NextResponse.json({ message: error.message || 'Erro interno' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    const consultas = await prisma.consulta.findMany({
      include: {
        lead: true,
        imovel: true
      },
      orderBy: { data: 'desc' }
    });
    return NextResponse.json(consultas);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
