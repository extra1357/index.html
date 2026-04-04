import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUsuarioDoRequest } from "@/lib/auth"
import { put, del } from "@vercel/blob"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const marca       = searchParams.get("marca")
    const categoria   = searchParams.get("categoria")
    const combustivel = searchParams.get("combustivel")
    const cambio      = searchParams.get("cambio")
    const precoMin    = searchParams.get("precoMin")
    const precoMax    = searchParams.get("precoMax")
    const page        = Number(searchParams.get("page") ?? "1")
    const limit       = Number(searchParams.get("limit") ?? "20")

    const anuncios = await prisma.anuncio.findMany({
      where: {
        ativo: true,
        ...(marca       && { marca }),
        ...(categoria   && { categoria }),
        ...(combustivel && { combustivel }),
        ...(cambio      && { cambio }),
        ...((precoMin || precoMax) && {
          preco: {
            ...(precoMin && { gte: Number(precoMin) }),
            ...(precoMax && { lte: Number(precoMax) }),
          },
        }),
      },
      include: {
        fotos: true,
        user: { select: { nome: true, whatsapp: true } },
      },
      orderBy: [{ destaque: "desc" }, { criadoEm: "desc" }],
      skip:  (page - 1) * limit,
      take:  limit,
    })
    return NextResponse.json(anuncios)
  } catch (error) {
    console.error("GET /api/anuncios:", error)
    return NextResponse.json({ error: "Erro ao buscar anúncios." }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const blobsEnviados: string[] = []

  try {
    // 1. Autenticação
    const payload = getUsuarioDoRequest(req)
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado. Faça login." }, { status: 401 })
    }

    // 2. Busca user no banco
    const user = await prisma.user.findUnique({ where: { id: payload.id } })
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 })
    }

    // 3. Verifica limite de anúncios ativos no banco (nunca confiar no frontend)
    const limiteAtivos = user.tipDoc === "CNPJ" ? 6 : 2
    const totalAtivos = await prisma.anuncio.count({
      where: { userId: user.id, ativo: true },
    })
    if (totalAtivos >= limiteAtivos) {
      return NextResponse.json({
        error: `Limite de ${limiteAtivos} anúncios ativos atingido. Desative um anúncio antes de criar outro.`,
      }, { status: 403 })
    }

    // 4. Lê FormData
    const form = await req.formData()
    const veiculoRaw = form.get("veiculo")
    if (!veiculoRaw) {
      return NextResponse.json({ error: "Dados do veículo ausentes." }, { status: 400 })
    }

    const veiculo = JSON.parse(veiculoRaw as string)
    const fotos = form.getAll("fotos") as File[]

    // 5. Limite e validação de fotos
    const maxFotos = user.tipDoc === "CNPJ" ? 6 : 4
    const fotosValidas = fotos.slice(0, maxFotos)
    for (const foto of fotosValidas) {
      if (foto.size > 2 * 1024 * 1024) {
        return NextResponse.json({ error: `Foto "${foto.name}" ultrapassa 2MB.` }, { status: 400 })
      }
      if (!foto.type.startsWith("image/")) {
        return NextResponse.json({ error: `Arquivo "${foto.name}" não é uma imagem válida.` }, { status: 400 })
      }
    }

    // 6. Sobe os blobs ANTES de criar o anúncio (permite rollback limpo)
    const fotosUrls: { url: string; capa: boolean }[] = []
    for (let i = 0; i < fotosValidas.length; i++) {
      const foto = fotosValidas[i]
      const ext = foto.name.split(".").pop() ?? "jpg"
      const blob = await put(
        `anuncios/${Date.now()}_${i}.${ext}`,
        foto,
        { access: "public", contentType: foto.type }
      )
      blobsEnviados.push(blob.url)
      fotosUrls.push({ url: blob.url, capa: i === 0 })
    }

    // 7. Gera título automático
    const titulo = [veiculo.marca, veiculo.modelo, veiculo.versao, veiculo.anoMod]
      .filter(Boolean).join(" ").trim()

    // 8. Expira em 60 dias
    const expiraEm = new Date()
    expiraEm.setDate(expiraEm.getDate() + 60)

    // 9. Criação atômica: anúncio + fotos em uma única operação no banco
    const anuncio = await prisma.anuncio.create({
      data: {
        titulo,
        categoria:     veiculo.categoria,
        marca:         veiculo.marca,
        modelo:        veiculo.modelo,
        versao:        veiculo.versao        || null,
        anoFab:        Number(veiculo.anoFab),
        anoMod:        Number(veiculo.anoMod),
        km:            Number(String(veiculo.km).replace(/\D/g, "")),
        combustivel:   veiculo.combustivel,
        cambio:        veiculo.cambio,
        cor:           veiculo.cor,
        portas:        veiculo.portas        ? Number(veiculo.portas) : null,
        blindado:      veiculo.blindado      ?? false,
        financiamento: veiculo.financiamento ?? true,
        troca:         veiculo.troca         ?? false,
        preco:         Number(String(veiculo.preco).replace(/\D/g, "")),
        fipe:          veiculo.fipe          ? Number(String(veiculo.fipe).replace(/\D/g, "")) : null,
        placa:         veiculo.placa         || null,
        descricao:     veiculo.descricao     || null,
        expiraEm,
        userId:        user.id,
        fotos: {
          create: fotosUrls,
        },
      },
      include: { fotos: true },
    })

    return NextResponse.json({ ok: true, anuncioId: anuncio.id }, { status: 201 })

  } catch (error) {
    // Rollback: remove blobs já enviados se o banco falhar
    if (blobsEnviados.length > 0) {
      await Promise.allSettled(blobsEnviados.map(url => del(url)))
      console.warn("Rollback: blobs removidos após falha no banco.")
    }
    console.error("POST /api/anuncios:", error)
    return NextResponse.json({ error: "Erro interno ao criar anúncio." }, { status: 500 })
  }
}
