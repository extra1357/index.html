import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSlug, generateCodigo } from '@/lib/generateSlug';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

// ─── Logger ──────────────────────────────────────────────────────────────────
const log = {
  info:  (msg: string, data?: unknown) => console.log (`[IMOVEL][INFO]  ${msg}`, data ?? ''),
  warn:  (msg: string, data?: unknown) => console.warn(`[IMOVEL][WARN]  ${msg}`, data ?? ''),
  error: (msg: string, data?: unknown) => console.error(`[IMOVEL][ERROR] ${msg}`, data ?? ''),
};

// ─── Tratamento de erros Prisma ───────────────────────────────────────────────
function prismaErrorMessage(error: unknown): { mensagem: string; codigo?: string; status: number } {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return { mensagem: `Campo único duplicado: ${(error.meta?.target as string[])?.join(', ')}`, codigo: error.code, status: 409 };
      case 'P2003':
        return { mensagem: `Chave estrangeira inválida: ${error.meta?.field_name ?? 'proprietarioId'}`, codigo: error.code, status: 400 };
      case 'P2025':
        return { mensagem: 'Registro relacionado não encontrado', codigo: error.code, status: 404 };
      default:
        return { mensagem: `Erro Prisma ${error.code}: ${error.message}`, codigo: error.code, status: 500 };
    }
  }
  if (error instanceof Prisma.PrismaClientValidationError) {
    return { mensagem: `Dados inválidos enviados ao banco: ${error.message}`, status: 422 };
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return { mensagem: 'Falha ao conectar no banco de dados', status: 503 };
  }
  if (error instanceof Error) {
    return { mensagem: error.message, status: 500 };
  }
  return { mensagem: 'Erro interno desconhecido', status: 500 };
}

// ─── GET — listar imóveis ─────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cidade     = searchParams.get('cidade') ?? undefined;
  const tipo       = searchParams.get('tipo') ?? undefined;
  const finalidade = searchParams.get('finalidade') ?? undefined;
  const status     = searchParams.get('status') ?? 'ATIVO';

  log.info('GET /api/imoveis/cadastro', { cidade, tipo, finalidade, status });

  try {
    const imoveis = await prisma.imovel.findMany({
      where: {
        ...(cidade     && { cidade: { contains: cidade, mode: 'insensitive' } }),
        ...(tipo       && { tipo }),
        ...(finalidade && { finalidade }),
        status,
      },
      orderBy: { createdAt: 'desc' },
      include: { proprietario: { select: { nome: true, telefone: true, email: true } } },
    });

    log.info(`GET → ${imoveis.length} registro(s)`);
    return NextResponse.json(imoveis);
  } catch (error) {
    const { mensagem, codigo, status: httpStatus } = prismaErrorMessage(error);
    log.error('GET falhou', { mensagem, codigo, raw: error });
    return NextResponse.json({ error: mensagem, codigo }, { status: httpStatus });
  }
}

// ─── POST — cadastrar imóvel ──────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  log.info('POST /api/imoveis/cadastro → iniciando');

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    log.error('Body inválido (não é JSON)');
    return NextResponse.json({ error: 'Body deve ser JSON válido' }, { status: 400 });
  }

  log.info('Body recebido', body);

  const {
    tipo, endereco, cidade, estado, preco, metragem,
    quartos, banheiros, vagas, descricao, proprietarioId,
    imagens, finalidade, bairro, cep, suites,
    caracteristicas, precoAluguel, destaque,
  } = body as Record<string, any>;

  // ── Validação dos campos obrigatórios ────────────────────────────────────────
  const camposObrigatorios = { tipo, endereco, cidade, estado, preco, metragem, proprietarioId };
  const faltando = Object.entries(camposObrigatorios)
    .filter(([, v]) => v === undefined || v === null || v === '')
    .map(([k]) => k);

  if (faltando.length > 0) {
    log.warn('Campos obrigatórios faltando', faltando);
    return NextResponse.json({ error: 'Campos obrigatórios faltando', campos: faltando }, { status: 400 });
  }

  // ── Verificar se o proprietário existe no banco ───────────────────────────────
  log.info('Verificando proprietário', { proprietarioId });
  try {
    const proprietario = await prisma.proprietario.findUnique({ where: { id: proprietarioId } });
    if (!proprietario) {
      log.warn('Proprietário não encontrado no banco', { proprietarioId });
      return NextResponse.json(
        { error: `Proprietário com ID "${proprietarioId}" não encontrado. Verifique o ID e tente novamente.` },
        { status: 400 }
      );
    }
    log.info('Proprietário encontrado', { nome: proprietario.nome });
  } catch (error) {
    const { mensagem, codigo, status: httpStatus } = prismaErrorMessage(error);
    log.error('Falha ao buscar proprietário', { mensagem, codigo, raw: error });
    return NextResponse.json({ error: mensagem, codigo }, { status: httpStatus });
  }

  // ── Geração de código e slug ──────────────────────────────────────────────────
  const codigo = generateCodigo(tipo);
  const slug   = generateSlug({
    tipo,
    cidade,
    bairro: bairro ?? endereco.split(',')[1]?.trim() ?? '',
    quartos: quartos ? parseInt(quartos) : 0,
    codigo,
  });

  log.info('Código e slug gerados', { codigo, slug });

  // ── Criar imóvel ──────────────────────────────────────────────────────────────
  try {
    const novoImovel = await prisma.imovel.create({
      data: {
        tipo,
        endereco,
        cidade,
        estado,
        preco:           parseFloat(preco),
        metragem:        parseFloat(metragem),
        quartos:         quartos     ? parseInt(quartos)     : 0,
        banheiros:       banheiros   ? parseInt(banheiros)   : 0,
        vagas:           vagas       ? parseInt(vagas)       : 0,
        suites:          suites      ? parseInt(suites)      : 0,
        descricao:       descricao   ?? null,
        bairro:          bairro      ?? null,
        cep:             cep         ?? null,
        finalidade:      finalidade  ?? 'venda',
        destaque:        destaque    ?? false,
        precoAluguel:    precoAluguel ? parseFloat(precoAluguel) : null,
        caracteristicas: Array.isArray(caracteristicas) ? caracteristicas : [],
        imagens:         Array.isArray(imagens) ? imagens : (imagens ? [imagens] : []),
        proprietarioId,
        status:          'ATIVO',
        codigo,
        slug,
      },
    });

    log.info('Imóvel criado com sucesso', { id: novoImovel.id, codigo, slug });
    return NextResponse.json(novoImovel, { status: 201 });

  } catch (error) {
    const { mensagem, codigo: errCodigo, status: httpStatus } = prismaErrorMessage(error);
    log.error('Falha ao gravar imóvel', { mensagem, errCodigo, raw: error });
    return NextResponse.json({ error: mensagem, codigo: errCodigo }, { status: httpStatus });
  }
}
