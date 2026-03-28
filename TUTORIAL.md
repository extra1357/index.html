# Tutorial: Como o sistema STR foi construído

Este documento conta a história técnica do projeto — do zero à produção — com as decisões que foram tomadas, os problemas que apareceram e como foram resolvidos. É um registro de aprendizado, não uma documentação formal.

---

## Parte 1: A ideia e a escolha da stack

A proposta era simples: uma imobiliária de pequeno porte em Salto/SP precisava de um site profissional com painel para gerenciar imóveis, sem depender de plataformas genéricas como WordPress ou sistemas legados caros.

A decisão pela stack veio naturalmente:

**Next.js 14** foi escolhido por resolver dois problemas ao mesmo tempo — serve como frontend com React e como backend com as API Routes. Não precisamos de um servidor separado para o site.

**Prisma + Neon PostgreSQL** porque o Neon oferece PostgreSQL serverless com plano gratuito generoso, e o Prisma elimina a necessidade de escrever SQL manual, mantendo o schema versionado no repositório.

**TailwindCSS** para velocidade de estilização. O painel administrativo foi construído do zero com Tailwind sem nenhum componente de UI externo, o que deu total controle sobre o design.

**JWT em cookie httpOnly** para autenticação. A decisão de usar cookie em vez de localStorage foi deliberada — é mais seguro contra ataques XSS e o middleware do Next.js consegue ler cookies para proteger rotas.

---

## Parte 2: O banco de dados

O schema do Prisma evoluiu em seis migrations ao longo do projeto. As principais entidades são:

```
Imovel         ← Imóvel cadastrado (tipo, endereço, valor, status, slug, fotos)
Lead           ← Contato capturado (nome, telefone, email, origem, status)
Proprietario   ← Dono do imóvel
Corretor       ← Profissional responsável
Consulta       ← Visita agendada
Proposta       ← Oferta formal
Venda          ← Negócio fechado
AnalisesMercado ← Histórico de análises por cidade
AuditLog       ← Registro de todas as ações no sistema
```

**Decisão importante:** o campo `slug` foi adicionado ao modelo `Imovel` numa migration posterior. Antes disso, as URLs usavam o UUID. Isso causou um problema de SEO — o Google estava indexando URLs com UUID e quando migramos para slug, as páginas antigas ficaram quebradas. A solução foi fazer `buscarImovelPorId` aceitar tanto o slug quanto o UUID:

```typescript
const imovel = await prisma.imovel.findFirst({
  where: {
    OR: [{ id }, { slug: id }]
  }
});
```

O sitemap também precisou ser corrigido. Estava buscando `status: 'disponivel'` (lowercase) mas o enum no banco era `ATIVO`. Isso fez o sitemap ficar vazio por semanas sem ninguém perceber.

---

## Parte 3: Autenticação

A autenticação foi o ponto que deu mais trabalho. O fluxo é:

1. Usuário faz POST em `/api/auth/login` com email e senha
2. A API valida com bcrypt e assina um JWT com `JWT_SECRET`
3. O token é colocado num cookie httpOnly com `sameSite: lax`
4. O middleware lê o cookie em todas as rotas `/admin/*` e redireciona para `/admin/login` se inválido

**Problema 1 — JWT_SECRET inconsistente:** O middleware usava `'TROQUE_AQUI'` como fallback e a API usava `'TROQUE'`. Os tokens eram assinados com uma chave e verificados com outra. Solução: definir `JWT_SECRET` real no `.env` da Neon e remover todos os fallbacks.

**Problema 2 — `router.push` não recarregava o middleware:** Depois do login, chamávamos `router.push('/admin/dashboard')` mas o middleware não era re-executado pelo Next.js nesse cenário. A solução foi substituir por `window.location.href = '/admin/dashboard'`, que força um reload completo da página e faz o middleware rodar.

**Problema 3 — Logout não limpava o cookie:** A rota de logout existia mas não tinha os campos `secure`, `sameSite` e `maxAge: 0`. O browser mantinha o cookie antigo. A correção foi:

```typescript
response.cookies.set('token', '', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  expires: new Date(0),
  maxAge: 0,
  path: '/',
});
```

E no frontend, substituir `router.push` por `window.location.href` no logout também.

---

## Parte 4: Painel administrativo

O painel foi construído como um layout `AdminLayout` que envolve todas as páginas de `/admin/*`. O layout tem sidebar com menu, header com breadcrumb e dropdown de usuário, e footer.

A lista de páginas implementadas:

- Dashboard com métricas e gráficos
- Imóveis (listagem, novo, editar, excluir)
- Leads (listagem com kanban, novo, relatório)
- Corretores e Proprietários (CRUD)
- Visitas / Consultas com funil
- Vendas e Aluguéis
- Comissões
- Análise de Mercado com IA
- Performance
- Usuários
- Auditoria

**Formatação de preços:** Houve um bug persistente onde `toLocaleString('pt-BR')` exibia `2,7` em vez de `2.700.000,00`. A causa era que em alguns ambientes de servidor o locale `pt-BR` não estava disponível. A solução foi usar `Intl.NumberFormat` diretamente:

```typescript
new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(valor)
```

---

## Parte 5: SEO e páginas públicas

A estratégia de SEO local foi construída em torno das cidades da região de Salto/SP onde a imobiliária atua: Salto, Itu, Campinas, Sorocaba, Indaiatuba, Porto Feliz.

Para cada cidade foi criada uma landing page em `/imoveis-[cidade]` com:

- H1 otimizado para a busca local
- Seções por bairro com conteúdo real
- Cards dos imóveis disponíveis naquela cidade
- Schema markup específico com endereço e área de atuação
- FAQ com perguntas reais de quem busca imóvel naquela cidade

**Sitemap dinâmico:** O arquivo `src/app/sitemap.ts` busca todos os imóveis ativos no banco e gera as URLs. As URLs das landing pages por cidade são inseridas estaticamente.

**robots.txt:** Foi necessário bloquear `/api/` porque o Google estava tentando indexar as rotas de API e recebendo erros 4xx, o que prejudicava o Search Console:

```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://www.imobiliariaperto.com.br/sitemap.xml
```

**Hydration error no LeadWidget:** O componente tinha um bloco `<style>` com aspas duplas embutidas na string JSX, o que causava mismatch entre o HTML gerado no servidor e no cliente. A solução foi usar `dangerouslySetInnerHTML={{ __html: estilos }}`.

---

## Parte 6: O agente Sofia

A Sofia é um agente de IA conversacional que ajuda o usuário a encontrar imóveis. Ela roda como um serviço separado do site principal — essa foi uma decisão arquitetural deliberada.

**Por que separado?** Porque o agente usa Python e FastAPI, que têm ecossistema de IA muito mais maduro do que Node.js. Além disso, o agente pode ser vendido como módulo separado para outros clientes que não usam o site STR.

### Como a Sofia funciona

O agente usa o modelo `llama3-groq-70b-8192-tool-use-preview` da Groq, que suporta function calling nativamente. O fluxo é:

1. Usuário abre o chat e diz o que procura
2. Sofia identifica a intenção e faz perguntas guiadas: cidade → finalidade → bairros → faixa de preço
3. Com os parâmetros coletados, chama a tool `buscar_imoveis` que consulta o banco diretamente
4. Os resultados voltam em JSON estruturado que o frontend renderiza como cards visuais
5. Se o usuário demonstrar interesse, Sofia pergunta nome e telefone e registra o lead no CRM

### Ferramentas implementadas

```python
tools = [
  buscar_imoveis_avancado,    # Busca com filtros no banco
  buscar_bairros_disponiveis, # Lista bairros por cidade
  buscar_similares,           # Imóveis em cidades próximas
  capturar_lead,              # Salva lead no CRM
  analisar_mercado,           # Análise de preços por cidade
  agendar_visita,             # Registra consulta
  informacoes_corretor,       # Dados de contato
]
```

### Memória de sessão

Cada sessão tem um `session_id` único. As últimas 20 mensagens são mantidas em memória no servidor. Isso permite que a Sofia lembre do que foi dito anteriormente na conversa sem perguntar de novo.

### Interface de chat

A interface foi construída como HTML/CSS/JS puro — sem framework — para facilitar o deploy na Vercel como arquivo estático. O estilo é inspirado no WhatsApp: bolhas de mensagem, indicador de digitação, avatares, timestamp.

O frontend parseia o JSON retornado pelo agente e renderiza cards de imóvel com foto, preço formatado e link direto para a página do imóvel no site.

---

## Parte 7: Deploy e infraestrutura

### Site na Vercel

O site está conectado ao repositório GitHub e faz deploy automático em cada push para `main`. As variáveis de ambiente são configuradas no painel da Vercel.

Um ponto importante: a Vercel não mantém estado entre requests (é serverless), então toda a autenticação tem que ser stateless — daí o JWT em cookie, que viaja em cada request.

### Agente na Railway

O servidor FastAPI fica na Railway, que mantém o processo rodando continuamente. A variável `GROQ_API_KEY` é configurada no painel da Railway.

O frontend do chat (HTML estático) fica na Vercel, num projeto separado chamado `imobiliaria-agente2`. Os deploys do frontend precisam ser feitos manualmente:

```bash
cd ~/agentes
vercel --prod
```

### Banco de dados no Neon

O Neon fornece PostgreSQL serverless com branching de banco de dados. Usamos uma única branch `main` em produção. A string de conexão inclui `?sslmode=require` obrigatoriamente.

---

## Parte 8: Resultados e próximos passos

Após três meses em produção (início em dezembro/2024), os dados do Google Search Console mostram:

- 6 cliques orgânicos totais
- 75 impressões
- CTR médio de 8%
- Posição média de 12.5

A palavra-chave "imobiliaria perto" já aparece na posição 4 com CTR de 28%, o que é excelente para um site novo. A meta agora é subir "imobiliária salto" da posição 41 para a primeira página.

### O que falta implementar

- Upload de fotos direto pelo painel (hoje as fotos são inseridas via URL externa)
- Notificações por email quando um lead é capturado
- Integração com WhatsApp Business API para notificar o corretor em tempo real
- App mobile (React Native) para os corretores
- Integração com portais como ZapImóveis e VivaReal

---

## Lições aprendidas

**Separe a autenticação do estado do cliente.** O `router.push` do Next.js não re-executa o middleware. Para ações de segurança (login, logout), use sempre `window.location.href`.

**Teste o sitemap antes de esperar pelo Google.** O sitemap ficou gerando URLs quebradas por semanas por causa de um enum errado. Valide com `curl https://seusite.com/sitemap.xml` antes de submeter.

**Slugs desde o início.** Adicionar slug depois de ter URLs com UUID é trabalhoso e pode prejudicar o SEO de páginas já indexadas.

**Bloqueie `/api/` no robots.txt.** Rotas de API retornam JSON, não HTML. O Google vai tentar indexar e vai receber erros, o que polui o Search Console.

**Separe o agente de IA do site principal.** Tecnologias diferentes, escalabilidade diferente, ciclos de deploy diferentes. A separação facilita vender os dois como produtos independentes.
