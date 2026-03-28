-- Adiciona corretorId na tabela imoveis
ALTER TABLE imoveis ADD COLUMN IF NOT EXISTS "corretorId" TEXT REFERENCES corretores(id);
CREATE INDEX IF NOT EXISTS "imoveis_corretorId_idx" ON imoveis("corretorId");
