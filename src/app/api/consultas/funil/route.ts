export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Esta rota agora apenas serve os dados para o seu código gigante acima
export async function GET() {
  try {
    const consultas = await prisma.consulta.findMany({
      include: {
        lead: true,
        imovel: true
      }
    });

    return NextResponse.json({ data: consultas }, { status: 200 });
  } catch (error: any) {
    console.error('Erro na API de Funil:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados', details: error.message },
      { status: 500 }
    );
  }
}




