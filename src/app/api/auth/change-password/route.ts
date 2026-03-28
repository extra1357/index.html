export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    const { senhaAtual, novaSenha } = await req.json();
    
    if (!senhaAtual || !novaSenha) {
      return NextResponse.json({ error: 'Preencha todos os campos' }, { status: 400 });
    }
    
    if (novaSenha.length < 8) {
      return NextResponse.json({ error: 'Nova senha deve ter no mínimo 8 caracteres' }, { status: 400 });
    }
    
    const usuario = await prisma.usuario.findUnique({
      where: { id: user.userId }
    });
    
    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    
    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
    
    if (!senhaValida) {
      return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 401 });
    }
    
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    
    await prisma.usuario.update({
      where: { id: user.userId },
      data: { senha: novaSenhaHash }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Senha alterada com sucesso!' 
    });
    
  } catch (error: any) {
    console.error('Erro ao trocar senha:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
