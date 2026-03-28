export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Listar todos os leads
export async function GET(request: NextRequest) {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        corretor: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });
    
    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    console.error('Erro ao listar leads:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}

// POST - Criar novo lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📝 Dados recebidos:', body);
    
    // Validação básica
    if (!body.nome || !body.email || !body.telefone) {
      return NextResponse.json(
        { success: false, error: 'Nome, email e telefone são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Criar lead
    const novoLead = await prisma.lead.create({
      data: {
        nome: body.nome,
        email: body.email,
        telefone: body.telefone,
        origem: body.origem || 'site',
        status: body.status || 'novo',
        imovelInteresse: body.imovelInteresse || body.imovel,
        mensagem: body.mensagem,
        dataPreferencia: body.dataPreferencia || body.data_contato,
        corretorId: body.corretorId || null
      }
    });
    
    console.log('✅ Lead criado:', novoLead.id);
    
    return NextResponse.json({ 
      success: true, 
      lead: novoLead,
      message: 'Lead cadastrado com sucesso' 
    });
    
  } catch (error: any) {
    console.error('❌ Erro ao criar lead:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}
