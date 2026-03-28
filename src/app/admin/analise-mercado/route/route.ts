export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error'],
});

export async function GET() {
  try {
    const analises = await prisma.analiseMercado.findMany({
      orderBy: {
        dataAnalise: 'desc',
      },
      select: {
        id: true,
        cidade: true,
        estado: true,
        valorM2: true,
        valorMinimo: true,
        valorMaximo: true,
        tendencia: true,
        fonte: true,
        observacoes: true,
        dataAnalise: true,
      },
    });

    return NextResponse.json(
      {
        status: 'success',
        data: analises,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[STR GENETICS DB ERROR]:', error);

    return NextResponse.json(
      {
        status: 'error',
        data: [],
        message: 'Erro ao consultar análises de mercado',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

