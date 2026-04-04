import { NextRequest, NextResponse } from "next/server"

const ROTAS_PROTEGIDAS = ["/painel", "/anunciar/publicar"]

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const protegida = ROTAS_PROTEGIDAS.some(r => pathname.startsWith(r))
  if (!protegida) return NextResponse.next()

  const token = req.cookies.get("vibecarros_token")?.value
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  try {
    const [, payload] = token.split(".")
    const decoded = JSON.parse(atob(payload))
    if (!decoded?.id || decoded.exp * 1000 < Date.now()) {
      throw new Error("Token expirado")
    }
    return NextResponse.next()
  } catch {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
