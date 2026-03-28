import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const acao = searchParams.get('acao');
    const tabela = searchParams.get('tabela');
    const usuario = searchParams.get('usuario');
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');
    const limit = parseInt(searchParams.get('limit') || '100');

    const where: any = {};
    
    if (acao) where.acao = acao;
    if (tabela) where.tabela = tabela;
    if (usuario) where.usuario = { contains: usuario, mode: 'insensitive' };
    if (dataInicio || dataFim) {
      where.createdAt = {};
      if (dataInicio) where.createdAt.gte = new Date(dataInicio);
      if (dataFim) where.createdAt.lte = new Date(dataFim + 'T23:59:59');
    }

    const auditorias = await prisma.auditoria.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Buscar opções únicas para filtros
    const acoes = await prisma.auditoria.findMany({
      select: { acao: true },
      distinct: ['acao'],
    });
    const tabelas = await prisma.auditoria.findMany({
      select: { tabela: true },
      distinct: ['tabela'],
    });

    return NextResponse.json({
      success: true,
      data: auditorias,
      filtros: {
        acoes: acoes.map(a => a.acao),
        tabelas: tabelas.map(t => t.tabela),
      }
    });
  } catch (error: any) {
    console.error('Erro ao buscar auditorias:', error);
    return NextResponse.json({ error: 'Erro ao buscar auditorias' }, { status: 500 });
  }
}
