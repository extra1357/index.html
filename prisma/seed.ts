export const dynamic = 'force-dynamic';

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed completo no padrão STR Production...\n')

  // ========================================
  // LIMPAR DADOS (ordem correta - dependentes primeiro)
  // ========================================
  try {
    // Tabelas novas (podem não existir ainda)
    await prisma.pagamentoAluguel.deleteMany().catch(() => {})
    await prisma.comissao.deleteMany().catch(() => {})
    await prisma.aluguel.deleteMany().catch(() => {})
    await prisma.venda.deleteMany().catch(() => {})
    
    // Tabelas existentes
    await prisma.consulta.deleteMany()
    await prisma.historico.deleteMany()
    await prisma.lead.deleteMany()
    await prisma.imovel.deleteMany()
    await prisma.proprietario.deleteMany()
    await prisma.corretor.deleteMany().catch(() => {})
    await prisma.analiseMercado.deleteMany()
    await prisma.relatorio.deleteMany()
    await prisma.usuario.deleteMany()
    await prisma.auditoria.deleteMany()
    
    console.log('➡️  Dados antigos apagados')
  } catch (e) {
    console.log('➡️  Algumas tabelas ainda não existem (primeira execução)')
  }

  // ========================================
  // USUÁRIOS
  // ========================================
  const senhaHash = await bcrypt.hash('admin123', 10)
  await prisma.usuario.create({
    data: {
      nome: 'Administrador STR',
      email: 'admin@str.com',
      senha: senhaHash,
      role: 'ADMIN'
    }
  })
  console.log('➡️  Usuário admin criado (admin@str.com / admin123)')

  // ========================================
  // PROPRIETÁRIOS
  // ========================================
  const prop1 = await prisma.proprietario.create({
    data: { 
      nome: 'João Silva', 
      telefone: '11987654321', 
      email: 'joao@email.com', 
      cpf: '123.456.789-00',
      tipo: 'PF',
      endereco: 'Rua das Acácias, 100 - São Paulo/SP'
    }
  })
  const prop2 = await prisma.proprietario.create({
    data: { 
      nome: 'Maria Souza', 
      telefone: '11976543210', 
      email: 'maria.souza@email.com', 
      cpf: '987.654.321-00',
      tipo: 'PF',
      endereco: 'Av. Paulista, 1000 - São Paulo/SP'
    }
  })
  const prop3 = await prisma.proprietario.create({
    data: { 
      nome: 'Imobiliária Centro LTDA', 
      telefone: '11965432109', 
      email: 'contato@imobcentro.com.br', 
      cnpj: '12.345.678/0001-90',
      tipo: 'PJ',
      endereco: 'Rua do Comércio, 500 - Campinas/SP'
    }
  })
  console.log('➡️  Proprietários criados (3)')

  // ========================================
  // CORRETORES
  // ========================================
  const corretor1 = await prisma.corretor.create({
    data: {
      nome: 'Carlos Mendes',
      email: 'carlos@imobiliariaperto.com.br',
      telefone: '11999001001',
      cpf: '111.222.333-44',
      creci: 'CRECI-SP 123456',
      comissaoPadrao: 50,
      banco: 'Itaú',
      agencia: '1234',
      conta: '12345-6',
      tipoConta: 'corrente',
      pix: 'carlos@imobiliariaperto.com.br'
    }
  })
  const corretor2 = await prisma.corretor.create({
    data: {
      nome: 'Ana Paula Santos',
      email: 'ana@imobiliariaperto.com.br',
      telefone: '11999002002',
      cpf: '222.333.444-55',
      creci: 'CRECI-SP 654321',
      comissaoPadrao: 50,
      banco: 'Bradesco',
      agencia: '5678',
      conta: '67890-1',
      tipoConta: 'corrente',
      pix: '11999002002'
    }
  })
  console.log('➡️  Corretores criados (2)')

  // ========================================
  // IMÓVEIS
  // ========================================
  const imovel1 = await prisma.imovel.create({
    data: {
      codigo: 'APT-001',
      tipo: 'Apartamento',
      finalidade: 'venda',
      endereco: 'Rua das Flores, 123',
      bairro: 'Jardim Europa',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      preco: 450000,
      metragem: 80,
      quartos: 2,
      suites: 1,
      banheiros: 2,
      vagas: 1,
      descricao: 'Apartamento moderno com sala ampla, acabamento premium e automação residencial.',
      caracteristicas: ['Varanda', 'Churrasqueira', 'Ar condicionado', 'Armários embutidos'],
      status: 'ATIVO',
      disponivel: true,
      destaque: true,
      proprietarioId: prop1.id,
      imagens: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1000',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1000'
      ]
    }
  })

  await prisma.imovel.create({
    data: {
      codigo: 'CAS-002',
      tipo: 'Casa',
      finalidade: 'ambos',
      endereco: 'Av. Brasil, 500',
      bairro: 'Centro',
      cidade: 'Salto',
      estado: 'SP',
      cep: '13320-000',
      preco: 350000,
      precoAluguel: 2500,
      metragem: 120,
      quartos: 3,
      suites: 1,
      banheiros: 2,
      vagas: 2,
      descricao: 'Casa com quintal amplo, área gourmet com churrasqueira e excelente iluminação natural.',
      caracteristicas: ['Quintal', 'Churrasqueira', 'Edícula', 'Piscina'],
      status: 'ATIVO',
      disponivel: true,
      destaque: true,
      proprietarioId: prop2.id,
      imagens: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000'
      ]
    }
  })

  await prisma.imovel.create({
    data: {
      codigo: 'SOB-003',
      tipo: 'Sobrado',
      finalidade: 'venda',
      endereco: 'Rua das Palmeiras, 789',
      bairro: 'Cambuí',
      cidade: 'Campinas',
      estado: 'SP',
      cep: '13025-000',
      preco: 680000,
      metragem: 180,
      quartos: 4,
      suites: 2,
      banheiros: 4,
      vagas: 3,
      descricao: 'Sobrado novo com 4 suítes, acabamento em porcelanato e piscina privativa.',
      caracteristicas: ['Piscina', 'Sauna', 'Closet', 'Home Theater'],
      status: 'ATIVO',
      disponivel: true,
      proprietarioId: prop1.id,
      imagens: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1000',
        'https://images.unsplash.com/photo-1600607687940-4e524cb35297?q=80&w=1000'
      ]
    }
  })

  await prisma.imovel.create({
    data: {
      codigo: 'APT-004',
      tipo: 'Apartamento',
      finalidade: 'aluguel',
      endereco: 'Rua Augusta, 456',
      bairro: 'Consolação',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01304-000',
      preco: 520000,
      precoAluguel: 3500,
      metragem: 95,
      quartos: 3,
      suites: 1,
      banheiros: 2,
      vagas: 1,
      descricao: 'Apartamento para locação em excelente localização.',
      caracteristicas: ['Academia', 'Salão de festas', 'Portaria 24h'],
      status: 'ATIVO',
      disponivel: true,
      proprietarioId: prop2.id,
      imagens: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1000']
    }
  })

  await prisma.imovel.create({
    data: {
      codigo: 'APT-005',
      tipo: 'Apartamento',
      finalidade: 'venda',
      endereco: 'Rua Oscar Freire, 200',
      bairro: 'Jardins',
      cidade: 'São Paulo',
      estado: 'SP',
      preco: 890000,
      metragem: 150,
      quartos: 3,
      suites: 2,
      banheiros: 3,
      vagas: 2,
      descricao: 'Vendido em dezembro/2025',
      status: 'VENDIDO',
      disponivel: false,
      proprietarioId: prop3.id,
      imagens: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000']
    }
  })

  console.log('➡️  Imóveis criados (5)')

  // ========================================
  // LEADS
  // ========================================
  const lead1 = await prisma.lead.create({
    data: { 
      nome: 'Maria Santos', 
      email: 'maria.santos@gmail.com', 
      telefone: '11999999999', 
      origem: 'site', 
      status: 'quente',
      imovelInteresse: 'Apartamento em São Paulo',
      corretorId: corretor1.id
    }
  })
  
  await prisma.lead.create({
    data: { 
      nome: 'Pedro Costa', 
      email: 'pedro.costa@hotmail.com', 
      telefone: '11988888888', 
      origem: 'instagram', 
      status: 'morno',
      imovelInteresse: 'Casa com piscina',
      corretorId: corretor2.id
    }
  })

  await prisma.lead.create({
    data: { 
      nome: 'Fernanda Lima', 
      email: 'fernanda@empresa.com.br', 
      telefone: '11977777777', 
      origem: 'indicacao', 
      status: 'qualificado',
      mensagem: 'Procuro apartamento para alugar próximo ao metrô',
      corretorId: corretor1.id
    }
  })

  console.log('➡️  Leads criados (3)')

  // ========================================
  // HISTÓRICO
  // ========================================
  await prisma.historico.create({
    data: {
      leadId: lead1.id,
      tipo: 'WHATSAPP',
      detalhes: 'Cliente confirmou interesse na visita após ver fotos do Apartamento em SP.'
    }
  })
  console.log('➡️  Histórico criado')

  // ========================================
  // CONSULTAS
  // ========================================
  await prisma.consulta.create({
    data: {
      leadId: lead1.id,
      imovelId: imovel1.id,
      corretorId: corretor1.id,
      tipo: 'visita',
      status: 'agendada',
      observacoes: 'Cliente quer visitar no sábado às 14h'
    }
  })
  console.log('➡️  Consulta criada')

  // ========================================
  // ANÁLISE DE MERCADO
  // ========================================
  await prisma.analiseMercado.create({
    data: {
      cidade: 'São Paulo',
      estado: 'SP',
      valorM2: 12500,
      valorMinimo: 8000,
      valorMaximo: 25000,
      fonte: 'FipeZap',
      tendencia: 'alta'
    }
  })
  console.log('➡️  Análise de mercado criada')

  // ========================================
  // AUDITORIA
  // ========================================
  await prisma.auditoria.create({
    data: {
      acao: 'SEED',
      tabela: 'sistema',
      usuario: 'Sistema',
      dados: JSON.stringify({ mensagem: 'Seed executado com sucesso' })
    }
  })

  console.log('\n' + '='.repeat(50))
  console.log('🎉 SEED FINALIZADO COM SUCESSO!')
  console.log('='.repeat(50))
  console.log('\n📊 Dados criados:')
  console.log('   • 1 Usuário admin (admin@str.com / admin123)')
  console.log('   • 3 Proprietários')
  console.log('   • 2 Corretores')
  console.log('   • 5 Imóveis')
  console.log('   • 3 Leads')
  console.log('\n🔗 Acesse: http://localhost:3000/admin/login')
  console.log('   Email: admin@str.com')
  console.log('   Senha: admin123\n')
}

main()
  .catch(e => { console.error('❌ Erro no seed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
