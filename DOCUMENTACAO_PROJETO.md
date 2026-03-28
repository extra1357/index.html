# 📋 Documentação Técnica — ImobiliáriaPerto
**Repositório:** https://github.com/extra1357/index.html  
**Branch principal:** `principal`  
**Site em produção:** https://www.imobiliariaperto.com.br  
**Painel administrativo:** https://www.imobiliariaperto.com.br/admin  
**Data do documento:** 28 de março de 2026  
**Responsável:** extra1357

---

## 1. Visão Geral do Projeto

ImobiliáriaPerto é uma plataforma imobiliária digital desenvolvida para captação de leads, listagem e gestão de imóveis nas cidades de Salto, Itu, Indaiatuba, Sorocaba e Porto Feliz (SP).

O objetivo central é escalar a captação de clientes via SEO orgânico, atendimento automatizado por IA (Sofia) e conversão de visitantes em leads qualificados.

---

## 2. Stack Tecnológica

| Componente | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript |
| Banco de dados | PostgreSQL via Neon (neon.tech) |
| ORM | Prisma |
| Hospedagem | Vercel (plano Hobby) |
| Armazenamento de imagens | Vercel Blob |
| DNS | Cloudflare |
| E-mail transacional | Resend |
| Autenticação | JWT customizado |
| Estilização | Tailwind CSS + CSS Modules |
| Chatbot IA | Sofia (iframe externo — imobiliaria-agente2.vercel.app) |

---

## 3. Arquitetura do Projeto
```
imobiliaria-str/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Página inicial (lista de imóveis)
│   │   ├── imoveis/[id]/             # Página de detalhe do imóvel (slug amigável)
│   │   ├── admin/                    # Painel administrativo protegido por JWT
│   │   ├── api/                      # Rotas de API (Next.js Route Handlers)
│   │   └── components/
│   │       ├── ListaImoveisClient.tsx
│   │       ├── LeadWidget.tsx
│   │       └── Footer.tsx
│   ├── components/
│   │   └── admin/
│   │       ├── AdminLayout.tsx
│   │       └── FormularioImovelProfissional.tsx
│   └── lib/
│       ├── imoveis.ts
│       ├── prisma.ts
│       ├── auth.ts
│       └── generateSlug.ts
├── prisma/
│   └── schema.prisma
├── scripts/
│   └── migrar-imagens.js
└── next.config.js
```

---

## 4. Funcionalidades Implementadas

### 4.1 Área Pública
- Listagem de imóveis com filtros por tipo, cidade e preço máximo
- Paginação (8 imóveis por página)
- Páginas de cidade (SEO local): Salto, Itu, Indaiatuba, Sorocaba, Porto Feliz
- Página de detalhe com galeria de fotos e dados completos
- URLs amigáveis via slug (ex: /imoveis/casa-salto-3q-ca630396)
- Schema markup estruturado para SEO (JSON-LD)
- Sitemap dinâmico
- Widget da Sofia (IA) com botões: chat, WhatsApp e formulário de contato
- Formulário de captação de leads integrado à API

### 4.2 Painel Administrativo (/admin)
- Login seguro com JWT (cookie httpOnly)
- Dashboard com métricas
- Cadastro, edição e exclusão de imóveis
- Upload de fotos diretamente para Vercel Blob
- Gestão de proprietários, leads, corretores
- Controle de aluguéis e vendas
- Auditoria de ações

---

## 5. Banco de Dados (Prisma + Neon PostgreSQL)

### Principais tabelas:
| Tabela | Descrição |
|---|---|
| imoveis | Imóveis cadastrados com slug, código, imagens (URLs), características |
| proprietarios | Proprietários vinculados aos imóveis |
| leads | Leads captados pelo site e widget |
| usuarios | Usuários do painel admin |
| corretores | Corretores da imobiliária |
| vendas | Registro de vendas realizadas |
| alugueis | Registro de aluguéis ativos |

As imagens são armazenadas como array de URLs apontando para o Vercel Blob. Não há mais base64 no banco.

---

## 6. Variáveis de Ambiente (.env.local)

| Variável | Uso |
|---|---|
| DATABASE_URL | Conexão com banco Neon PostgreSQL |
| JWT_SECRET | Assinatura dos tokens de autenticação |
| BLOB_READ_WRITE_TOKEN | Autenticação com Vercel Blob |
| RESEND_API_KEY | Envio de e-mails transacionais |
| NEXT_PUBLIC_API_URL | URL base da API (local) |
| NEXT_PUBLIC_BASE_URL | URL pública do site |

NUNCA commitar o .env.local no repositório. Está no .gitignore.

---

## 7. Histórico de Problemas Resolvidos

### 7.1 SSL Expirado (março/2026)
**Problema:** Certificado SSL expirou após 90 dias.
**Causa:** DNS apontando para IP incorreto (216.198.79.1 em vez de 76.76.21.21 da Vercel).
**Solução:** Corrigido registro A no Cloudflare e forçada renovação na Vercel.

### 7.2 Película Transparente Bloqueando Cliques
**Problema:** Widget da Sofia criava camada invisível bloqueando cliques no site.
**Causa:** Container fixo sem pointerEvents none e elementos filhos sem pointerEvents auto.
**Solução:** Refatorado LeadWidget com pointerEvents corretos em todos os elementos.

### 7.3 Performance Crítica (nota 32 no PageSpeed)
**Problema:** Site carregando em 5-6 segundos, payload de 8.482 KiB.
**Causa:** Imagens em base64 armazenadas diretamente no banco PostgreSQL.

**Soluções aplicadas:**
1. Migração de imagens de base64 para Vercel Blob
2. Script migrar-imagens.js executado — 9 imóveis migrados (~100 fotos)
3. buscarImoveis() alterada para retornar apenas a primeira imagem na listagem
4. next.config.js com formats WebP/AVIF para imagens otimizadas
5. ListaImoveisClient.tsx com width/height explícitos e aspect-ratio para eliminar CLS
6. Primeiros 4 cards com priority true para melhorar LCP

**Resultado:**

| Métrica | Antes | Depois |
|---|---|---|
| Nota Desktop | 32 | 74 |
| Nota Celular | 31 | 52 |
| FCP Desktop | 5,2s | 0,3s |
| LCP Desktop | 6,7s | 1,1s |
| Payload | 8.482 KiB | normal |

---

## 8. Pendências e Próximos Passos

### Alta prioridade
- [ ] Resolver CLS 0.936 no celular
- [ ] Melhorar LCP celular (atualmente 6,5s — meta abaixo de 2,5s)
- [ ] Corrigir imagens sem width/height na página de detalhe

### Média prioridade
- [ ] Reduzir JavaScript não usado (192 KiB)
- [ ] Reduzir CSS não usado (11 KiB)
- [ ] Corrigir contraste de cores (acessibilidade)
- [ ] Adicionar labels nos selects

### Escalabilidade
- [ ] Implementar ISR nas páginas de imóveis
- [ ] Adicionar cache para consultas frequentes
- [ ] Criar página de blog para SEO de conteúdo

---

## 9. Fluxo de Deploy
```
1. Fazer alterações no código
2. git add .
3. git commit -m "descricao da mudanca"
4. git push
A Vercel detecta automaticamente e faz deploy em producao em 2-3 minutos.
```

---

## 10. Responsabilidades

| Responsabilidade | Detentor |
|---|---|
| Código-fonte e versionamento | extra1357 (GitHub) |
| Hospedagem e CI/CD | Vercel |
| Banco de dados | Neon PostgreSQL |
| Armazenamento de imagens | Vercel Blob |
| DNS e proteção | Cloudflare |
| Domínio | Registro.br |
| Manutenção e evolução | extra1357 com suporte de IA (Claude — Anthropic) |

---

## 11. Compromisso de Manutenção

Este documento registra o estado do projeto em 28/03/2026 e serve como base para onboarding, rastreabilidade de decisões técnicas e planejamento de melhorias.

Sistema construído com foco em geração de leads via SEO orgânico e widget de IA, escalabilidade e baixo custo operacional.

*Documento gerado com assistência de Claude (Anthropic) — Sessão de desenvolvimento de 28/03/2026*
