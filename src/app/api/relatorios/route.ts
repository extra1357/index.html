export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Busca volumétrica total
    const totalLeads = await prisma.lead.count();
    const totalConsultas = await prisma.consulta.count();
    
    // 2. Leads por Temperatura (Genética STR)
    const leadsPorStatus = await prisma.lead.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // 3. Funil de Vendas: Consultas por Status
    const statusConsultas = await prisma.consulta.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // 4. Performance de Origem (Onde os leads estão vindo)
    const performanceOrigem = await prisma.lead.groupBy({
      by: ['origem'],
      _count: { id: true },
    });

    // 5. Cálculo de Conversão (Leads que viraram Consulta)
    // Buscamos leads que possuem pelo menos uma consulta vinculada
    const leadsConvertidos = await prisma.lead.count({
      where: {
        consultas: { some: {} }
      }
    });

    const taxaConversao = totalLeads > 0 ? ((leadsConvertidos / totalLeads) * 100).toFixed(2) : 0;

    // 6. Volume Financeiro em Propostas (Soma das propostas no banco)
    const volumeFinanceiro = await prisma.consulta.aggregate({
      _sum: {
        valorProposta: true
      },
      where: {
        status: 'agendada' // Ou o status que define negociação ativa no seu sistema
      }
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      funil: {
        totalLeads,
        leadsConvertidos,
        taxaConversao: `${taxaConversao}%`,
        totalConsultas
      },
      distribuicao: {
        leadsPorStatus,
        statusConsultas,
        performanceOrigem
      },
      financeiro: {
        valorEmNegociacao: volumeFinanceiro._sum.valorProposta || 0
      }
    });
  } catch (error: any) {
    console.error("ERRO CRÍTICO RELATÓRIO STR:", error);
    return NextResponse.json({ error: "Erro ao processar métricas de conversão" }, { status: 500 });
  }
}
