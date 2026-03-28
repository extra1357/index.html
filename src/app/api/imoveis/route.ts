import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSlug, generateCodigo } from '@/lib/generateSlug';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

// ─── Logger ──────────────────────────────────────────────────────────────────
const log = {
  info:  (msg: string, data?: unknown) => console.log (`[IMOVEIS][INFO]  ${msg}`, data ?? ''),
  warn:  (msg: string, data?: unknown) => console.warn(`[IMOVEIS][WARN]  ${msg}`, data ?? ''),
  error: (msg: string, data?: unknown) => console.error(`[IMOVEIS][ERROR] ${msg}`, data ?? ''),
};

// ─── Traduz erros Prisma em HTTP legível ─────────────────────────────────────
function prismaErrorMessage(error: unknown): {
  mensagem: string;
  codigo?: string;
  status: number;
} {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return { mensagem: `Campo único duplicado: ${(error.meta?.target as string[])?.join(', ')}`, codigo: error.code, status: 409 };
      case 'P2003':
        return { mensagem: `Chave estrangeira inválida: ${error.meta?.field_name}`, codigo: error.code, status: 400 };
      case 'P2025':
        return { mensagem: 'Registro relacionado não encontrado', codigo: error.code, status: 404 };
      default:
        return { mensagem: `Erro Prisma (${error.code}): ${error.message}`, codigo: error.code, status: 500 };
    }
  }
  if (error instanceof Prisma.PrismaClientValidationError)
    return { mensagem: `Dados inválidos: ${error.message}`, status: 422 };
  if (error instanceof Prisma.PrismaClientInitializationError)
    return { mensagem: 'Falha ao conectar no banco (Neon/Prisma init)', status: 503 };
  if (error instanceof Error)
    return { mensagem: error.message, status: 500 };
  return { mensagem: 'Erro interno desconhecido', status: 500 };
}

// ─── GET — listar imóveis ────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cidade     = searchParams.get('cidade')     ?? undefined;
  const tipo       = searchParams.get('tipo')       ?? undefined;
  const finalidade = searchParams.get('finalidade') ?? undefined;
  const status     = searchParams.get('status')     ?? 'ATIVO';

  log.info('GET /api/imoveis', { cidade, tipo, finalidade, status });

  try {
    const imoveis = await prisma.imovel.findMany({
      where: {
        ...(cidade     && { cidade: { contains: cidade, mode: 'insensitive' } }),
        ...(tipo       && { tipo }),
        ...(finalidade && { finalidade }),
        status,
      },
      include: { proprietario: true },
      orderBy: { createdAt: 'desc' },
    });

    log.info(`GET /api/imoveis → ${imoveis.length} registro(s)`);
    return NextResponse.json(imoveis);
  } catch (error) {
    const { mensagem, codigo, status: httpStatus } = prismaErrorMessage(error);
    log.error('GET /api/imoveis falhou', { mensagem, codigo, raw: error });
    return NextResponse.json({ error: mensagem, codigo }, { status: httpStatus });
  }
}

// ─── POST — cadastrar imóvel ─────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  log.info('POST /api/imoveis → iniciando');

  let body: Record<string, any>;
  try {
    body = await request.json();
    log.info('POST /api/imoveis → body recebido', body);
  } catch {
    log.error('POST /api/imoveis → body não é JSON válido');
    return NextResponse.json({ error: 'Body deve ser JSON válido' }, { status: 400 });
  }

  const {
    tipo, endereco, cidade, estado, preco, metragem,
    quartos, banheiros, vagas, suites, descricao,
    proprietarioId, imagens, finalidade, bairro,
    cep, caracteristicas, precoAluguel, destaque,
  } = body;

  // ── Validação ──────────────────────────────────────────────────────────────
  const faltando = Object.entries({ tipo, endereco, cidade, estado, preco, metragem, proprietarioId })
    .filter(([, v]) => v === undefined || v === null || v === '')
    .map(([k]) => k);

  if (faltando.length > 0) {
    log.warn('POST /api/imoveis → campos obrigatórios ausentes', faltando);
    return NextResponse.json({ error: 'Campos obrigatórios faltando', campos: faltando }, { status: 400 });
  }

  const bairroFinal = bairro ?? endereco.split(',')[1]?.trim() ?? '';
  const codigo      = body.codigo || generateCodigo(tipo);
  const slug        = generateSlug({
    tipo, cidade,
    bairro: bairroFinal,
    quartos: quartos ? parseInt(quartos) : 0,
    codigo,
  });

  log.info('POST /api/imoveis → slug/código gerados', { codigo, slug });

  try {
    const novoImovel = await prisma.imovel.create({
      data: {
        tipo, endereco, cidade, estado,
        preco:           parseFloat(preco),
        metragem:        parseFloat(metragem),
        quartos:         quartos     ? parseInt(quartos)     : 0,
        banheiros:       banheiros   ? parseInt(banheiros)   : 0,
        vagas:           vagas       ? parseInt(vagas)       : 0,
        suites:          suites      ? parseInt(suites)      : 0,
        descricao:       descricao   ?? null,
        bairro:          bairroFinal || null,
        cep:             cep         ?? null,
        finalidade:      finalidade  ?? 'venda',
        destaque:        destaque    ?? false,
        precoAluguel:    precoAluguel ? parseFloat(precoAluguel) : null,
        caracteristicas: Array.isArray(caracteristicas) ? caracteristicas : [],
        imagens:         Array.isArray(imagens) ? imagens : (imagens ? [imagens] : []),
        proprietarioId,
        status:          'ATIVO',
        disponivel:      true,
        codigo,
        slug,
      },
    });

    log.info('POST /api/imoveis → imóvel criado', { id: novoImovel.id, codigo, slug });
    return NextResponse.json(novoImovel, { status: 201 });
  } catch (error) {
    const { mensagem, codigo: errCodigo, status: httpStatus } = prismaErrorMessage(error);
    log.error('POST /api/imoveis → falha ao gravar', { mensagem, errCodigo, body, raw: error });
    return NextResponse.json({ error: mensagem, codigo: errCodigo }, { status: httpStatus });
  }
}

// ─── DELETE — remover imóvel ─────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  log.info('DELETE /api/imoveis', { id });

  if (!id) {
    log.warn('DELETE /api/imoveis → id não fornecido');
    return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
  }

  try {
    await prisma.imovel.delete({ where: { id } });
    log.info('DELETE /api/imoveis → removido', { id });
    return NextResponse.json({ mensagem: 'Imóvel removido com sucesso' });
  } catch (error) {
    const { mensagem, codigo, status: httpStatus } = prismaErrorMessage(error);
    log.error('DELETE /api/imoveis falhou', { mensagem, codigo, id, raw: error });
    return NextResponse.json({ error: mensagem, codigo }, { status: httpStatus });
  }
}
