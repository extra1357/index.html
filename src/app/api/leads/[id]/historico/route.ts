export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: Adiciona um novo ponto na timeline do lead
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { detalhes, tipo } = await request.json();
    const novoRegistro = await prisma.historico.create({
      data: {
        detalhes,
        tipo,
        leadId: params.id
      }
    });
    return NextResponse.json(novoRegistro, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Falha ao registrar histórico STR" }, { status: 500 });
  }
}
