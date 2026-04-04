#!/usr/bin/env python3
"""
============================================================
  VIBECARROS — Suite de Testes de Infraestrutura e API
  Rode com: python vibecarros_test.py
  Requisitos: pip install requests psycopg2-binary python-dotenv
============================================================
"""

import os
import sys
import json
import time
import importlib
import subprocess
from datetime import datetime

# ── cores no terminal ────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
BLUE   = "\033[94m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

PASS = f"{GREEN}✔ PASS{RESET}"
FAIL = f"{RED}✖ FAIL{RESET}"
SKIP = f"{YELLOW}⚠ INEXISTENTE{RESET}"

results = []

def header(title):
    print(f"\n{BOLD}{BLUE}{'═'*60}{RESET}")
    print(f"{BOLD}{BLUE}  {title}{RESET}")
    print(f"{BOLD}{BLUE}{'═'*60}{RESET}")

def log(status, name, detail=""):
    symbol = {"pass": PASS, "fail": FAIL, "skip": SKIP}[status]
    detail_str = f"  {YELLOW}→ {detail}{RESET}" if detail else ""
    print(f"  {symbol}  {name}{detail_str}")
    results.append({"status": status, "name": name, "detail": detail})

def check_pip(package):
    """Verifica se um pacote Python está instalado."""
    try:
        importlib.import_module(package.replace("-", "_").split(">=")[0])
        return True
    except ImportError:
        return False

# ════════════════════════════════════════════════════════════
# 1. DEPENDÊNCIAS PYTHON
# ════════════════════════════════════════════════════════════
header("1. DEPENDÊNCIAS PYTHON")

python_deps = {
    "requests":        "HTTP calls para testar as API routes",
    "psycopg2":        "Conexão direta com PostgreSQL/Neon",
    "dotenv":          "Leitura do .env.local",
}

for pkg, desc in python_deps.items():
    mod = "psycopg2" if pkg == "psycopg2" else ("dotenv" if pkg == "dotenv" else pkg)
    try:
        importlib.import_module(mod)
        log("pass", f"{pkg} instalado")
    except ImportError:
        log("fail", f"{pkg} NÃO instalado", f"pip install {pkg} — necessário para: {desc}")

# Importa o que conseguir
try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

try:
    from dotenv import load_dotenv
    HAS_DOTENV = True
except ImportError:
    HAS_DOTENV = False

try:
    import psycopg2
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False

# ════════════════════════════════════════════════════════════
# 2. VARIÁVEIS DE AMBIENTE
# ════════════════════════════════════════════════════════════
header("2. VARIÁVEIS DE AMBIENTE")

# Tenta carregar .env.local do diretório atual ou do pai
env_file = None
for candidate in [".env.local", ".env", "../.env.local", "../.env"]:
    if os.path.exists(candidate):
        env_file = candidate
        break

if HAS_DOTENV and env_file:
    load_dotenv(env_file)
    log("pass", f"Arquivo de env carregado: {env_file}")
else:
    log("skip", ".env.local / .env não encontrado no diretório atual",
        "Execute este script dentro de C:\\Users\\cotaw\\vibecarros\\vibecarros")

required_envs = {
    "DATABASE_URL":                    "Conexão com Neon (pooled) — OBRIGATÓRIO",
    "DIRECT_URL":                      "Conexão direta com Neon para Prisma CLI — OBRIGATÓRIO",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": "Clerk — autenticação pública — OBRIGATÓRIO",
    "CLERK_SECRET_KEY":                "Clerk — autenticação server-side — OBRIGATÓRIO",
    "STRIPE_SECRET_KEY":               "Stripe — pagamentos — OBRIGATÓRIO",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY": "Stripe — chave pública — OBRIGATÓRIO",
    "BLOB_READ_WRITE_TOKEN":           "Vercel Blob — upload de fotos — OBRIGATÓRIO",
    "STRIPE_WEBHOOK_SECRET":           "Stripe Webhook — confirmar pagamentos — RECOMENDADO",
}

for key, desc in required_envs.items():
    val = os.environ.get(key)
    if val:
        masked = val[:12] + "..." if len(val) > 12 else val
        log("pass", f"{key} = {masked}")
    else:
        severity = "fail" if "OBRIGATÓRIO" in desc else "skip"
        log(severity, f"{key} não definida", desc)

# ════════════════════════════════════════════════════════════
# 3. CONEXÃO COM O BANCO (NEON)
# ════════════════════════════════════════════════════════════
header("3. CONEXÃO COM O BANCO (NEON / POSTGRESQL)")

database_url = os.environ.get("DATABASE_URL") or os.environ.get("DIRECT_URL")

if not HAS_PSYCOPG2:
    log("skip", "psycopg2 não instalado — pulando testes de banco",
        "pip install psycopg2-binary")
elif not database_url:
    log("skip", "DATABASE_URL não definida — pulando testes de banco")
else:
    # Conexão básica
    try:
        conn = psycopg2.connect(database_url, connect_timeout=10)
        conn.autocommit = True
        cur = conn.cursor()
        log("pass", "Conexão com Neon estabelecida")

        # Tabelas existentes
        cur.execute("""
            SELECT tablename FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename;
        """)
        tables = [r[0] for r in cur.fetchall()]
        log("pass", f"Tabelas encontradas: {tables}" if tables else "Nenhuma tabela encontrada")

        # Verifica tabelas esperadas
        expected_tables = {
            "User":    "Usuários autenticados via Clerk",
            "Anuncio": "Anúncios de veículos",
            "Foto":    "Fotos dos anúncios",
        }
        # Normaliza para lowercase para comparar
        tables_lower = [t.lower() for t in tables]
        for tbl, desc in expected_tables.items():
            if tbl.lower() in tables_lower or tbl in tables:
                log("pass", f"Tabela '{tbl}' existe")
            else:
                log("skip", f"Tabela '{tbl}' NÃO existe", f"Função: {desc} — rode: npx prisma db push")

        # Conta registros
        for tbl in ["User", "Anuncio", "Foto"]:
            real_tbl = next((t for t in tables if t.lower() == tbl.lower()), None)
            if real_tbl:
                try:
                    cur.execute(f'SELECT COUNT(*) FROM "{real_tbl}";')
                    count = cur.fetchone()[0]
                    log("pass", f"Tabela '{real_tbl}': {count} registros")
                except Exception as e:
                    log("fail", f"Erro ao contar '{real_tbl}'", str(e))

        # Verifica índices importantes
        cur.execute("""
            SELECT indexname FROM pg_indexes
            WHERE schemaname = 'public'
            ORDER BY indexname;
        """)
        indexes = [r[0] for r in cur.fetchall()]
        log("pass", f"{len(indexes)} índices encontrados no banco")

        cur.close()
        conn.close()

    except Exception as e:
        log("fail", "Falha na conexão com Neon", str(e))

# ════════════════════════════════════════════════════════════
# 4. ESTRUTURA DE ARQUIVOS DO PROJETO
# ════════════════════════════════════════════════════════════
header("4. ESTRUTURA DE ARQUIVOS DO PROJETO NEXT.JS")

# Detecta raiz do projeto
project_root = "."
for candidate in [".", "..", "vibecarros"]:
    if os.path.exists(os.path.join(candidate, "package.json")):
        project_root = candidate
        break

required_files = {
    # Core
    "package.json":                          "Configuração npm — OBRIGATÓRIO",
    "next.config.ts":                        "Configuração Next.js — OBRIGATÓRIO",
    "tsconfig.json":                         "Configuração TypeScript — OBRIGATÓRIO",
    "prisma/schema.prisma":                  "Schema do banco — OBRIGATÓRIO",
    "prisma.config.ts":                      "Config Prisma 7 — OBRIGATÓRIO",
    # App
    "app/layout.tsx":                        "Layout raiz Next.js — OBRIGATÓRIO",
    "app/page.tsx":                          "Página inicial — OBRIGATÓRIO",
    "app/globals.css":                       "CSS global — OBRIGATÓRIO",
    # Componentes
    "app/components/Navbar.tsx":             "Barra de navegação",
    "app/components/Hero.tsx":               "Seção hero/banner",
    "app/components/SearchPanel.tsx":        "Painel de busca de veículos",
    "app/components/Listings.tsx":           "Listagem de anúncios",
    "app/components/Footer.tsx":             "Rodapé",
    # Lib
    "lib/prisma.ts":                         "Singleton Prisma Client — OBRIGATÓRIO",
    # API Routes
    "app/api/anuncios/route.ts":             "GET/POST anúncios — OBRIGATÓRIO",
    "app/api/fotos/route.ts":                "Upload de fotos (Vercel Blob)",
    "app/api/stripe/checkout/route.ts":      "Criar sessão de pagamento Stripe",
    "app/api/stripe/webhook/route.ts":       "Webhook Stripe para confirmar pagamento",
    "app/api/user/route.ts":                 "Sync usuário Clerk → banco",
    # Auth
    "middleware.ts":                         "Proteção de rotas via Clerk",
    # SEO
    "public/robots.txt":                     "SEO — robots.txt",
    "public/sitemap.xml":                    "SEO — sitemap",
    # Env
    ".env":                                  "Variáveis de ambiente",
    ".env.local":                            "Variáveis de ambiente locais",
}

for filepath, desc in required_files.items():
    full_path = os.path.join(project_root, filepath)
    if os.path.exists(full_path):
        size = os.path.getsize(full_path)
        if size < 10:
            log("fail", filepath, f"Arquivo existe mas está vazio ({size} bytes)")
        else:
            log("pass", filepath)
    else:
        severity = "fail" if "OBRIGATÓRIO" in desc else "skip"
        log(severity, filepath, f"INEXISTENTE — {desc}")

# ════════════════════════════════════════════════════════════
# 5. API ROUTES (servidor deve estar rodando)
# ════════════════════════════════════════════════════════════
header("5. API ROUTES (requer npm run dev rodando em localhost:3000)")

BASE_URL = "http://localhost:3000"

if not HAS_REQUESTS:
    log("skip", "requests não instalado — pulando testes HTTP",
        "pip install requests")
else:
    def test_endpoint(method, path, expected_status, body=None, description=""):
        url = BASE_URL + path
        try:
            start = time.time()
            if method == "GET":
                r = requests.get(url, timeout=10)
            elif method == "POST":
                r = requests.post(url, json=body, timeout=10)
            elapsed = (time.time() - start) * 1000

            if r.status_code == expected_status:
                log("pass", f"{method} {path}", f"{r.status_code} em {elapsed:.0f}ms")
            else:
                log("fail", f"{method} {path}",
                    f"esperado {expected_status}, recebeu {r.status_code} em {elapsed:.0f}ms")
            return r
        except requests.exceptions.ConnectionError:
            log("skip", f"{method} {path}",
                "Servidor não está rodando — inicie com: npm run dev")
            return None
        except Exception as e:
            log("fail", f"{method} {path}", str(e))
            return None

    # Página principal
    r = test_endpoint("GET", "/", 200, description="Página inicial")
    if r and r.elapsed.total_seconds() > 3:
        log("fail", "Performance da página inicial",
            f"Carregou em {r.elapsed.total_seconds():.1f}s — Google penaliza acima de 3s")
    elif r:
        log("pass", f"Performance OK: {r.elapsed.total_seconds():.2f}s")

    # API de anúncios
    test_endpoint("GET", "/api/anuncios", 200, description="Listar anúncios")
    test_endpoint("GET", "/api/anuncios?marca=Toyota", 200, description="Filtro por marca")
    test_endpoint("GET", "/api/anuncios?categoria=Carros", 200, description="Filtro por categoria")
    test_endpoint("GET", "/api/anuncios?precoMin=50000&precoMax=200000", 200, description="Filtro por preço")
    test_endpoint("GET", "/api/anuncios?combustivel=Flex", 200, description="Filtro por combustível")

    # API de usuário (deve retornar 401 sem auth)
    r = test_endpoint("GET", "/api/user", 401, description="Rota protegida sem auth")
    if r and r.status_code == 200:
        log("skip", "GET /api/user retornou 200 sem auth",
            "ATENÇÃO: rota não está protegida pelo Clerk — configure middleware.ts")

    # Stripe
    test_endpoint("POST", "/api/stripe/checkout", 401,
                  description="Checkout Stripe sem auth")

    # Webhook Stripe
    test_endpoint("POST", "/api/stripe/webhook", 400,
                  description="Webhook sem assinatura (deve rejeitar)")

    # Upload de fotos
    test_endpoint("POST", "/api/fotos", 401,
                  description="Upload sem auth")

    # SEO
    r_robots = test_endpoint("GET", "/robots.txt", 200, description="robots.txt acessível")
    r_sitemap = test_endpoint("GET", "/sitemap.xml", 200, description="sitemap.xml acessível")

    if r_robots and "Disallow" not in r_robots.text:
        log("skip", "robots.txt sem Disallow",
            "Adicione Disallow: /api/ para não indexar as rotas internas")

# ════════════════════════════════════════════════════════════
# 6. FUNCIONALIDADES DE NEGÓCIO
# ════════════════════════════════════════════════════════════
header("6. FUNCIONALIDADES DE NEGÓCIO — STATUS")

features = {
    # Implementadas
    "Listagem de anúncios na home":             ("pass",  "app/page.tsx + Listings.tsx"),
    "Busca/filtro de veículos":                 ("pass",  "SearchPanel.tsx + /api/anuncios"),
    "Navbar com links":                         ("pass",  "Navbar.tsx"),
    "Hero com estatísticas":                    ("pass",  "Hero.tsx"),
    "Footer":                                   ("pass",  "Footer.tsx"),
    "Conexão com Neon via Prisma 7":            ("pass",  "lib/prisma.ts + @prisma/adapter-pg"),
    "Mock de anúncios (fallback sem banco)":    ("pass",  "app/page.tsx — MOCK_ANUNCIOS"),
    "SEO básico (meta tags)":                   ("pass",  "app/layout.tsx"),
    "robots.txt":                               ("pass",  "public/robots.txt"),
    "sitemap.xml":                              ("pass",  "public/sitemap.xml"),
    # Pendentes
    "Autenticação com Clerk":                   ("skip",  "INEXISTENTE — configure CLERK_SECRET_KEY + middleware.ts"),
    "Página de login (/sign-in)":               ("skip",  "INEXISTENTE — crie app/sign-in/page.tsx com <SignIn />"),
    "Página de cadastro (/sign-up)":            ("skip",  "INEXISTENTE — crie app/sign-up/page.tsx com <SignUp />"),
    "Sync usuário Clerk → banco":               ("skip",  "INEXISTENTE — crie app/api/user/route.ts + webhook Clerk"),
    "Formulário de criar anúncio":              ("skip",  "INEXISTENTE — crie app/anunciar/page.tsx"),
    "Upload de até 6 fotos (Vercel Blob)":      ("skip",  "INEXISTENTE — crie app/api/fotos/route.ts"),
    "Limite de 6 fotos gratuitas":              ("skip",  "INEXISTENTE — validação no POST /api/anuncios"),
    "Pagamento Stripe (>6 fotos)":              ("skip",  "INEXISTENTE — crie app/api/stripe/checkout/route.ts"),
    "Webhook Stripe (confirmar pagamento)":     ("skip",  "INEXISTENTE — crie app/api/stripe/webhook/route.ts"),
    "Página de detalhes do anúncio":            ("skip",  "INEXISTENTE — crie app/anuncios/[id]/page.tsx"),
    "Dashboard do usuário (meus anúncios)":     ("skip",  "INEXISTENTE — crie app/dashboard/page.tsx"),
    "Tabela FIPE integrada":                    ("skip",  "INEXISTENTE — integrar API FIPE em /api/fipe"),
    "Modal de detalhes do veículo":             ("skip",  "INEXISTENTE — componente Modal.tsx"),
    "Paginação de anúncios":                    ("skip",  "INEXISTENTE — adicionar skip/take no Prisma"),
    "Schema.org / dados estruturados":          ("skip",  "INEXISTENTE — adicionar JSON-LD no layout.tsx"),
    "Open Graph / Twitter Card":                ("skip",  "INEXISTENTE — adicionar metadata no layout.tsx"),
    "Proteção de rotas (middleware.ts)":        ("skip",  "INEXISTENTE — criar middleware.ts com Clerk"),
    "Deploy na Vercel":                         ("skip",  "PENDENTE — configurar variáveis de ambiente na Vercel"),
}

for feature, (status, detail) in features.items():
    log(status, feature, detail)

# ════════════════════════════════════════════════════════════
# 7. RESUMO FINAL
# ════════════════════════════════════════════════════════════
header("7. RESUMO FINAL")

total  = len(results)
passed = sum(1 for r in results if r["status"] == "pass")
failed = sum(1 for r in results if r["status"] == "fail")
skipped= sum(1 for r in results if r["status"] == "skip")

print(f"\n  {BOLD}Total de verificações: {total}{RESET}")
print(f"  {GREEN}{BOLD}✔ Passaram:      {passed}{RESET}")
print(f"  {RED}{BOLD}✖ Falharam:      {failed}{RESET}")
print(f"  {YELLOW}{BOLD}⚠ Inexistentes:  {skipped}{RESET}")

score = int((passed / total) * 100) if total else 0
print(f"\n  {BOLD}Score de completude: {score}%{RESET}")

if failed > 0:
    print(f"\n  {RED}{BOLD}ITENS QUE PRECISAM DE ATENÇÃO IMEDIATA:{RESET}")
    for r in results:
        if r["status"] == "fail":
            print(f"    {RED}✖{RESET} {r['name']}")
            if r["detail"]:
                print(f"      → {r['detail']}")

if skipped > 0:
    print(f"\n  {YELLOW}{BOLD}FUNCIONALIDADES A IMPLEMENTAR:{RESET}")
    for r in results:
        if r["status"] == "skip":
            print(f"    {YELLOW}⚠{RESET} {r['name']}")
            if r["detail"]:
                print(f"      → {r['detail']}")

print(f"\n  Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
print(f"{BOLD}{BLUE}{'═'*60}{RESET}\n")
