import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUsuarioDoRequest } from "@/lib/auth"
import { del } from "@vercel/blob"

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = getUsuarioDoRequest(req)
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    const anuncio = await prisma.anuncio.findUnique({
      where: { id: params.id },
      include: { fotos: true },
    })

    if (!anuncio) {
      return NextResponse.json({ error: "Anúncio não encontrado." }, { status: 404 })
    }

    if (anuncio.userId !== payload.id) {
      return NextResponse.json({ error: "Sem permissão." }, { status: 403 })
    }

    if (anuncio.fotos.length > 0) {
      await Promise.allSettled(anuncio.fotos.map(f => del(f.url)))
    }

    await prisma.foto.deleteMany({ where: { anuncioId: anuncio.id } })
    await prisma.anuncio.delete({ where: { id: anuncio.id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("DELETE /api/anuncios/[id]:", error)
    return NextResponse.json({ error: "Erro ao deletar anúncio." }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = getUsuarioDoRequest(req)
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    const anuncio = await prisma.anuncio.findUnique({ where: { id: params.id } })
    if (!anuncio) {
      return NextResponse.json({ error: "Anúncio não encontrado." }, { status: 404 })
    }
    if (anuncio.userId !== payload.id) {
      return NextResponse.json({ error: "Sem permissão." }, { status: 403 })
    }

    const { acao } = await req.json()

    if (acao === "renovar") {
      const expiraEm = new Date()
      expiraEm.setDate(expiraEm.getDate() + 60)
      const atualizado = await prisma.anuncio.update({
        where: { id: params.id },
        data: { ativo: true, expiraEm },
      })
      return NextResponse.json({ ok: true, expiraEm: atualizado.expiraEm })
    }

    if (acao === "desativar") {
      await prisma.anuncio.update({
        where: { id: params.id },
        data: { ativo: false },
      })
      return NextResponse.json({ ok: true })
    }

    if (acao === "vendido") {
      await prisma.anuncio.update({
        where: { id: params.id },
        data: { ativo: false, destaque: false },
      })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 })
  } catch (error) {
    console.error("PATCH /api/anuncios/[id]:", error)
    return NextResponse.json({ error: "Erro ao atualizar anúncio." }, { status: 500 })
  }
}
