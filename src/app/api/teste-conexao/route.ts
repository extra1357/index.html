export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Tenta fazer uma consulta ultra simples (contar registros)
    const totalImoveis = await prisma.imovel.count();
    
    // 2. Tenta buscar o primeiro registro para validar a estrutura
    const primeiroImovel = await prisma.imovel.findFirst();

    return NextResponse.json({
      status: "CONECTADO",
      database: "PostgreSQL",
      mensagem: "STR System: Conexão estabelecida com sucesso.",
      estatisticas: {
        total_imoveis_cadastrados: totalImoveis
      },
      debug: {
        timestamp: new Date().toISOString(),
        primeiro_registro: primeiroImovel ? "Encontrado" : "Tabela vazia (mas conectada)"
      }
    });
  } catch (error: any) {
    // Retorna o erro técnico detalhado para diagnóstico
    return NextResponse.json({
      status: "ERRO DE CONEXAO",
      mensagem: "Não foi possível conectar ao banco de dados.",
      erro_tecnico: error.message,
      codigo: error.code // Ex: P2002, P1001 (ajuda a identificar se é senha, host ou porta)
    }, { status: 500 });
  }
}
