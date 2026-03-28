# ImobiliáriaPerto — Sistema STR

Plataforma imobiliária completa com painel administrativo, agente de IA (Sofia) e SEO local, construída do zero como produto SaaS para o mercado brasileiro.

---

## Visão geral

O projeto nasceu da necessidade de oferecer às imobiliárias de pequeno e médio porte uma solução moderna e acessível — algo entre a simplicidade de um site institucional e a robustez de um CRM completo. A arquitetura foi pensada para ser modular: o cliente pode contratar só o site, só o agente de IA, ou os dois juntos.

O sistema hoje está em produção em `www.imobiliariaperto.com.br` e serve como vitrine e prova de conceito do produto STR.

---

## Arquitetura

O projeto é dividido em dois repositórios independentes com deploy separado:

```
imobiliaria-str/          ← Site + Admin (Next.js)
  ├── prisma/             ← Schema e migrations (Neon PostgreSQL)
  ├── public/             ← Assets estáticos, sitemap, robots.txt
  └── src/
      ├── app/
      │   ├── admin/      ← Painel administrativo completo
      │   ├── api/        ← Endpoints REST (autenticação, imóveis, leads)
      │   ├── imoveis/    ← Páginas públicas de imóveis (SSR + slug)
      │   └── imoveis-*/  ← Landing pages SEO por cidade
      ├── components/     ← Componentes reutilizáveis
      ├── lib/            ← Utilitários (buscarImovelPorId, formatação)
      └── middleware.ts   ← Proteção de rotas com JWT

imobiliaria-agente/       ← Agente Sofia (Python + FastAPI)
  ├── api.py              ← Servidor principal com Groq + memória
  ├── tools/              ← Ferramentas do agente (busca, leads, análise)
  └── web/
      └── index.html      ← Interface de chat (deploy Vercel)
```

### Stack

| Camada | Tecnologia |
|---|---|
| Frontend / Admin | Next.js 14, TypeScript, TailwindCSS |
| ORM | Prisma |
| Banco de dados | Neon PostgreSQL |
| Autenticação | JWT (cookie httpOnly) |
| Agente de IA | Python 3, FastAPI, Groq (llama3-70b) |
| Deploy site | Vercel |
| Deploy agente | Railway (API) + Vercel (frontend) |

---

## Funcionalidades

### Site público

- Listagem de imóveis com filtros por cidade, tipo e faixa de preço
- Páginas individuais de imóvel com slug amigável para SEO
- Landing pages por cidade (Salto, Itu, Campinas, Sorocaba, Indaiatuba, Porto Feliz)
- Sitemap automático gerado a partir do banco de dados
- Schema markup (RealEstateAgent, BreadcrumbList, FAQPage)
- Widget da Sofia integrado em todas as páginas

### Painel administrativo

- Login com JWT e proteção de rotas via middleware
- CRUD completo de imóveis (criar, editar, excluir, upload de fotos)
- Gerenciamento de leads com classificação (Frio / Morno / Quente)
- Cadastro de corretores e proprietários
- Agenda de visitas e funil de vendas
- Controle de comissões e relatórios de performance
- Análise de mercado por cidade com precificação por m²
- Auditoria completa de ações

### Agente Sofia (IA)

- Conversa em linguagem natural via chat estilo WhatsApp
- Fluxo guiado: cidade → finalidade → bairro → faixa de preço → resultado
- Busca de imóveis no banco em tempo real com retorno em cards visuais
- Captura e registro automático de leads no CRM
- Memória de sessão (últimas 20 mensagens)
- Busca de similares em cidades próximas quando não há resultados
- Links dos cards com slug direto para o imóvel

---

## Instalação e execução local

### Pré-requisitos

- Node.js 18+
- Python 3.10+
- Conta no [Neon](https://neon.tech) (PostgreSQL serverless)
- Conta no [Groq](https://console.groq.com) (para o agente)

### Site (Next.js)

```bash
git clone https://github.com/extra1357/imobiliaria-str.git
cd imobiliaria-str
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com DATABASE_URL e JWT_SECRET

# Aplique o schema no banco
npx prisma migrate deploy
npx prisma generate

# Inicie em desenvolvimento
npm run dev
```

Acesse em `http://localhost:3000`

O painel administrativo está em `/admin/login`.

### Agente Sofia (Python)

```bash
git clone https://github.com/extra1357/imobiliaria-agente.git
cd imobiliaria-agente
pip install -r requirements.txt

# Configure as variáveis de ambiente
export DATABASE_URL="sua_url_neon"
export GROQ_API_KEY="sua_chave_groq"

# Inicie o servidor
uvicorn api:app --reload --port 8000
```

A interface de chat pode ser servida abrindo `web/index.html` localmente ou fazendo deploy na Vercel.

---

## Variáveis de ambiente

### Site (`.env`)

```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
JWT_SECRET="sua-chave-secreta-minimo-32-chars"
NODE_ENV="production"
```

### Agente

```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
GROQ_API_KEY="gsk_..."
```

---

## Deploy

### Site → Vercel

```bash
vercel --prod
```

Configure as variáveis de ambiente no painel da Vercel. O `robots.txt` e o `sitemap.xml` são servidos automaticamente via `/public` e rota dinâmica respectivamente.

### Agente API → Railway

Conecte o repositório `imobiliaria-agente` ao Railway e configure as variáveis `DATABASE_URL` e `GROQ_API_KEY` no painel.

### Agente Frontend → Vercel

```bash
cd web
vercel --prod
```

---

## SEO

O projeto implementa uma estratégia de SEO local focada em cidades do interior paulista:

- URLs com slug legível: `/imoveis/casa-salto-centro-3q-cas-001`
- Sitemap dinâmico gerado a partir do banco (apenas imóveis com `status: ATIVO`)
- `robots.txt` bloqueando rotas `/api/` para evitar erros 4xx no Search Console
- Meta descriptions e canonical por página
- Schema markup para imobiliária, breadcrumb e FAQ
- Verificação do Google Search Console via arquivo HTML em `/public`

---

## Planos comerciais

O sistema STR é comercializado em quatro planos:

| Plano | Perfil | Mensalidade |
|---|---|---|
| Starter | Corretor autônomo | R$ 197 |
| Professional | Imobiliária pequena/média | R$ 497 |
| Enterprise | Imobiliária grande | R$ 1.497 |
| Franchise | Rede / white-label | Sob consulta |

Cada plano inclui acesso ao painel administrativo. O agente Sofia (IA) é um diferencial do plano Professional para cima.

---

## Estrutura de branches

```
main          ← produção (deploy automático Vercel)
develop       ← desenvolvimento
feature/*     ← novas funcionalidades
fix/*         ← correções pontuais
```

---

## Licença

Projeto proprietário. Todos os direitos reservados.

Para licenciamento comercial: contato@sistemstr.com.br
