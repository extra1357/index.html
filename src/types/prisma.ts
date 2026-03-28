export const dynamic = 'force-dynamic';

// types/prisma.ts
// Tipos gerados automaticamente baseados no schema.prisma

export interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  origem: string;
  status: string;
  imovelInteresse?: string | null;
  mensagem?: string | null;
  dataPreferencia?: string | null;
  dataCaptcha: Date;
  createdAt: Date;
  updatedAt: Date;
  consultas?: Consulta[];
  historicos?: Historico[];
}

export interface Historico {
  id: string;
  detalhes: string;
  tipo: string;
  data: Date;
  leadId: string;
  lead?: Lead;
}

export interface Imovel {
  id: string;
  tipo: string;
  endereco: string;
  cidade: string;
  estado: string;
  preco: number;
  metragem: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  descricao?: string | null;
  disponivel: boolean;
  proprietarioId: string;
  createdAt: Date;
  updatedAt: Date;
  imagens: string[];
  status: string;
  consultas?: Consulta[];
  proprietario?: Proprietario;
}

export interface Proprietario {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  cpf?: string | null;
  createdAt: Date;
  updatedAt: Date;
  imoveis?: Imovel[];
}

export interface Consulta {
  id: string;
  leadId: string;
  imovelId: string;
  data: Date;
  resultado?: string | null;
  tipo: string;
  status: string;
  observacoes?: string | null;
  comissao?: number | null;
  createdAt: Date;
  dataFechamento?: Date | null;
  motivoCancelamento?: string | null;
  updatedAt: Date;
  valorProposta?: number | null;
  imovel?: Imovel;
  lead?: Lead;
}

export interface AnaliseMercado {
  id: string;
  cidade: string;
  estado: string;
  valorM2: number;
  valorMinimo?: number | null;
  valorMaximo?: number | null;
  dataAnalise: Date;
  fonte: string;
  tendencia?: string | null;
  observacoes?: string | null;
  relatorios?: Relatorio[];
}

export interface Relatorio {
  id: string;
  titulo: string;
  tipo: string;
  conteudo: string;
  dataGeracao: Date;
  periodo?: string | null;
  geradoPor?: string | null;
  analiseId?: string | null;
  analise?: AnaliseMercado;
}

export interface Auditoria {
  id: string;
  acao: string;
  tabela: string;
  registroId?: string | null;
  usuario: string;
  dados?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  role: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos auxiliares para API responses
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
