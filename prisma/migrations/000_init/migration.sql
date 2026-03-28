-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'GERENTE', 'CORRETOR', 'ASSISTENTE', 'VISUALIZADOR');

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "origem" TEXT NOT NULL DEFAULT 'site',
    "status" TEXT NOT NULL DEFAULT 'novo',
    "dataCaptcha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "corretorId" TEXT,
    "dataPreferencia" TEXT,
    "imovelInteresse" TEXT,
    "mensagem" TEXT,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historicos_atendimento" (
    "id" TEXT NOT NULL,
    "detalhes" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leadId" TEXT NOT NULL,

    CONSTRAINT "historicos_atendimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imoveis" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "preco" DECIMAL(12,2) NOT NULL,
    "metragem" DECIMAL(10,2) NOT NULL,
    "descricao" TEXT,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "proprietarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imagens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "bairro" TEXT,
    "banheiros" INTEGER NOT NULL DEFAULT 0,
    "caracteristicas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cep" TEXT,
    "codigo" TEXT,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "finalidade" TEXT NOT NULL DEFAULT 'venda',
    "precoAluguel" DECIMAL(10,2),
    "quartos" INTEGER NOT NULL DEFAULT 0,
    "suites" INTEGER NOT NULL DEFAULT 0,
    "vagas" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "imoveis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proprietarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cnpj" TEXT,
    "endereco" TEXT,
    "observacoes" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'PF',

    CONSTRAINT "proprietarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corretores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "cpf" TEXT,
    "creci" TEXT NOT NULL,
    "dataAdmissao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataDemissao" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "banco" TEXT,
    "agencia" TEXT,
    "conta" TEXT,
    "tipoConta" TEXT,
    "pix" TEXT,
    "comissaoPadrao" DECIMAL(5,2) NOT NULL DEFAULT 50,
    "foto" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corretores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comissoes" (
    "id" TEXT NOT NULL,
    "corretorId" TEXT NOT NULL,
    "vendaId" TEXT,
    "aluguelId" TEXT,
    "tipo" TEXT NOT NULL,
    "valorBase" DECIMAL(12,2) NOT NULL,
    "percentual" DECIMAL(5,2) NOT NULL,
    "valorComissao" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "dataPrevista" TIMESTAMP(3),
    "dataPagamento" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comissoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendas" (
    "id" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "proprietarioId" TEXT NOT NULL,
    "corretorId" TEXT NOT NULL,
    "valorVenda" DECIMAL(12,2) NOT NULL,
    "valorEntrada" DECIMAL(12,2),
    "valorFinanciado" DECIMAL(12,2),
    "percentualComissao" DECIMAL(5,2) NOT NULL DEFAULT 6,
    "valorComissao" DECIMAL(10,2) NOT NULL,
    "dataPropostaInicial" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataAssinatura" TIMESTAMP(3),
    "dataEscritura" TIMESTAMP(3),
    "dataRegistro" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'proposta',
    "formaPagamento" TEXT,
    "bancoFinanciamento" TEXT,
    "observacoes" TEXT,
    "documentos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alugueis" (
    "id" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "inquilinoId" TEXT NOT NULL,
    "proprietarioId" TEXT NOT NULL,
    "corretorId" TEXT NOT NULL,
    "valorAluguel" DECIMAL(10,2) NOT NULL,
    "valorCondominio" DECIMAL(10,2),
    "valorIPTU" DECIMAL(10,2),
    "valorTotal" DECIMAL(10,2) NOT NULL,
    "tipoGarantia" TEXT,
    "valorGarantia" DECIMAL(10,2),
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "diaVencimento" INTEGER NOT NULL DEFAULT 10,
    "indiceReajuste" TEXT NOT NULL DEFAULT 'IGPM',
    "dataProximoReajuste" TIMESTAMP(3),
    "taxaAdministracao" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "observacoes" TEXT,
    "documentos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alugueis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos_aluguel" (
    "id" TEXT NOT NULL,
    "aluguelId" TEXT NOT NULL,
    "competencia" TEXT NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "valorAluguel" DECIMAL(10,2) NOT NULL,
    "valorCondominio" DECIMAL(10,2),
    "valorIPTU" DECIMAL(10,2),
    "valorMulta" DECIMAL(10,2),
    "valorJuros" DECIMAL(10,2),
    "valorTotal" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "formaPagamento" TEXT,
    "comprovante" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagamentos_aluguel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultas" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultado" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'visita',
    "status" TEXT NOT NULL DEFAULT 'agendada',
    "observacoes" TEXT,
    "comissao" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFechamento" TIMESTAMP(3),
    "motivoCancelamento" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "valorProposta" DECIMAL(12,2),
    "corretorId" TEXT,
    "dataAgendada" TIMESTAMP(3),

    CONSTRAINT "consultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analises_mercado" (
    "id" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'SP',
    "valorM2" DECIMAL(10,2) NOT NULL,
    "valorMinimo" DECIMAL(12,2),
    "valorMaximo" DECIMAL(12,2),
    "dataAnalise" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fonte" TEXT NOT NULL,
    "tendencia" TEXT,
    "observacoes" TEXT,

    CONSTRAINT "analises_mercado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relatorios" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "dataGeracao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodo" TEXT,
    "geradoPor" TEXT,
    "analiseId" TEXT,

    CONSTRAINT "relatorios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "atualizadoPor" TEXT,
    "bloqueadoAte" TIMESTAMP(3),
    "corretorId" TEXT,
    "criadoPor" TEXT,
    "permissoesCustom" TEXT,
    "tentativasLogin" INTEGER NOT NULL DEFAULT 0,
    "ultimoLogin" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'VISUALIZADOR',

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditorias" (
    "id" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "tabela" TEXT NOT NULL,
    "registroId" TEXT,
    "usuario" TEXT NOT NULL DEFAULT 'sistema',
    "dados" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_permissoes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "recurso" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "detalhes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_permissoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leads_email_idx" ON "leads"("email");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_origem_idx" ON "leads"("origem");

-- CreateIndex
CREATE INDEX "leads_corretorId_idx" ON "leads"("corretorId");

-- CreateIndex
CREATE INDEX "historicos_atendimento_leadId_idx" ON "historicos_atendimento"("leadId");

-- CreateIndex
CREATE INDEX "historicos_atendimento_data_idx" ON "historicos_atendimento"("data");

-- CreateIndex
CREATE UNIQUE INDEX "imoveis_codigo_key" ON "imoveis"("codigo");

-- CreateIndex
CREATE INDEX "imoveis_cidade_idx" ON "imoveis"("cidade");

-- CreateIndex
CREATE INDEX "imoveis_estado_idx" ON "imoveis"("estado");

-- CreateIndex
CREATE INDEX "imoveis_disponivel_idx" ON "imoveis"("disponivel");

-- CreateIndex
CREATE INDEX "imoveis_tipo_idx" ON "imoveis"("tipo");

-- CreateIndex
CREATE INDEX "imoveis_finalidade_idx" ON "imoveis"("finalidade");

-- CreateIndex
CREATE INDEX "imoveis_status_idx" ON "imoveis"("status");

-- CreateIndex
CREATE INDEX "imoveis_proprietarioId_idx" ON "imoveis"("proprietarioId");

-- CreateIndex
CREATE UNIQUE INDEX "proprietarios_email_key" ON "proprietarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "proprietarios_cpf_key" ON "proprietarios"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "proprietarios_cnpj_key" ON "proprietarios"("cnpj");

-- CreateIndex
CREATE INDEX "proprietarios_email_idx" ON "proprietarios"("email");

-- CreateIndex
CREATE INDEX "proprietarios_cpf_idx" ON "proprietarios"("cpf");

-- CreateIndex
CREATE INDEX "proprietarios_cnpj_idx" ON "proprietarios"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "corretores_email_key" ON "corretores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "corretores_cpf_key" ON "corretores"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "corretores_creci_key" ON "corretores"("creci");

-- CreateIndex
CREATE INDEX "corretores_email_idx" ON "corretores"("email");

-- CreateIndex
CREATE INDEX "corretores_creci_idx" ON "corretores"("creci");

-- CreateIndex
CREATE INDEX "corretores_ativo_idx" ON "corretores"("ativo");

-- CreateIndex
CREATE INDEX "comissoes_corretorId_idx" ON "comissoes"("corretorId");

-- CreateIndex
CREATE INDEX "comissoes_vendaId_idx" ON "comissoes"("vendaId");

-- CreateIndex
CREATE INDEX "comissoes_aluguelId_idx" ON "comissoes"("aluguelId");

-- CreateIndex
CREATE INDEX "comissoes_status_idx" ON "comissoes"("status");

-- CreateIndex
CREATE INDEX "comissoes_dataPrevista_idx" ON "comissoes"("dataPrevista");

-- CreateIndex
CREATE INDEX "vendas_imovelId_idx" ON "vendas"("imovelId");

-- CreateIndex
CREATE INDEX "vendas_leadId_idx" ON "vendas"("leadId");

-- CreateIndex
CREATE INDEX "vendas_corretorId_idx" ON "vendas"("corretorId");

-- CreateIndex
CREATE INDEX "vendas_status_idx" ON "vendas"("status");

-- CreateIndex
CREATE INDEX "vendas_dataAssinatura_idx" ON "vendas"("dataAssinatura");

-- CreateIndex
CREATE INDEX "alugueis_imovelId_idx" ON "alugueis"("imovelId");

-- CreateIndex
CREATE INDEX "alugueis_inquilinoId_idx" ON "alugueis"("inquilinoId");

-- CreateIndex
CREATE INDEX "alugueis_proprietarioId_idx" ON "alugueis"("proprietarioId");

-- CreateIndex
CREATE INDEX "alugueis_corretorId_idx" ON "alugueis"("corretorId");

-- CreateIndex
CREATE INDEX "alugueis_status_idx" ON "alugueis"("status");

-- CreateIndex
CREATE INDEX "alugueis_dataFim_idx" ON "alugueis"("dataFim");

-- CreateIndex
CREATE INDEX "pagamentos_aluguel_aluguelId_idx" ON "pagamentos_aluguel"("aluguelId");

-- CreateIndex
CREATE INDEX "pagamentos_aluguel_competencia_idx" ON "pagamentos_aluguel"("competencia");

-- CreateIndex
CREATE INDEX "pagamentos_aluguel_status_idx" ON "pagamentos_aluguel"("status");

-- CreateIndex
CREATE INDEX "pagamentos_aluguel_dataVencimento_idx" ON "pagamentos_aluguel"("dataVencimento");

-- CreateIndex
CREATE INDEX "consultas_data_idx" ON "consultas"("data");

-- CreateIndex
CREATE INDEX "consultas_status_idx" ON "consultas"("status");

-- CreateIndex
CREATE INDEX "consultas_leadId_idx" ON "consultas"("leadId");

-- CreateIndex
CREATE INDEX "consultas_imovelId_idx" ON "consultas"("imovelId");

-- CreateIndex
CREATE INDEX "consultas_corretorId_idx" ON "consultas"("corretorId");

-- CreateIndex
CREATE INDEX "analises_mercado_cidade_idx" ON "analises_mercado"("cidade");

-- CreateIndex
CREATE INDEX "analises_mercado_estado_idx" ON "analises_mercado"("estado");

-- CreateIndex
CREATE INDEX "analises_mercado_dataAnalise_idx" ON "analises_mercado"("dataAnalise");

-- CreateIndex
CREATE INDEX "relatorios_tipo_idx" ON "relatorios"("tipo");

-- CreateIndex
CREATE INDEX "relatorios_dataGeracao_idx" ON "relatorios"("dataGeracao");

-- CreateIndex
CREATE INDEX "relatorios_analiseId_idx" ON "relatorios"("analiseId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_corretorId_key" ON "usuarios"("corretorId");

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_role_idx" ON "usuarios"("role");

-- CreateIndex
CREATE INDEX "usuarios_ativo_idx" ON "usuarios"("ativo");

-- CreateIndex
CREATE INDEX "auditorias_acao_idx" ON "auditorias"("acao");

-- CreateIndex
CREATE INDEX "auditorias_tabela_idx" ON "auditorias"("tabela");

-- CreateIndex
CREATE INDEX "auditorias_usuario_idx" ON "auditorias"("usuario");

-- CreateIndex
CREATE INDEX "auditorias_createdAt_idx" ON "auditorias"("createdAt");

-- CreateIndex
CREATE INDEX "logs_permissoes_usuarioId_idx" ON "logs_permissoes"("usuarioId");

-- CreateIndex
CREATE INDEX "logs_permissoes_acao_idx" ON "logs_permissoes"("acao");

-- CreateIndex
CREATE INDEX "logs_permissoes_createdAt_idx" ON "logs_permissoes"("createdAt");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "corretores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historicos_atendimento" ADD CONSTRAINT "historicos_atendimento_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imoveis" ADD CONSTRAINT "imoveis_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "proprietarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comissoes" ADD CONSTRAINT "comissoes_aluguelId_fkey" FOREIGN KEY ("aluguelId") REFERENCES "alugueis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comissoes" ADD CONSTRAINT "comissoes_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "corretores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comissoes" ADD CONSTRAINT "comissoes_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "corretores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "imoveis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "proprietarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alugueis" ADD CONSTRAINT "alugueis_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "corretores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alugueis" ADD CONSTRAINT "alugueis_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "imoveis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alugueis" ADD CONSTRAINT "alugueis_inquilinoId_fkey" FOREIGN KEY ("inquilinoId") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alugueis" ADD CONSTRAINT "alugueis_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "proprietarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos_aluguel" ADD CONSTRAINT "pagamentos_aluguel_aluguelId_fkey" FOREIGN KEY ("aluguelId") REFERENCES "alugueis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "corretores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "imoveis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorios" ADD CONSTRAINT "relatorios_analiseId_fkey" FOREIGN KEY ("analiseId") REFERENCES "analises_mercado"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "corretores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

