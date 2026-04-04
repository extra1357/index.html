import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import SearchPanel from "./components/SearchPanel"
import Listings from "./components/Listings"
import Footer from "./components/Footer"

const MOCK_ANUNCIOS = [
  {
    id: "mock-1",
    titulo: "Toyota Corolla XEi 2.0 Flex",
    marca: "Toyota",
    modelo: "Corolla",
    ano: 2022,
    preco: 142900,
    km: 28000,
    combustivel: "Flex",
    cambio: "Automatico",
    categoria: "Carros",
    cor: "Prata",
    descricao: "Unico dono, revisado na concessionaria, IPVA 2024 pago.",
    cidade: "Sao Paulo",
    estado: "SP",
    destaque: true,
    ativo: true,
    criadoEm: new Date(),
    userId: "mock-user-1",
    fotos: [{ id: "f1", url: "https://placehold.co/600x400?text=Corolla+XEi", anuncioId: "mock-1" }],
    user: { name: "Carlos Silva", whatsapp: "11976661297" },
  },
  {
    id: "mock-2",
    titulo: "Jeep Compass Limited 2.0 Diesel",
    marca: "Jeep",
    modelo: "Compass",
    ano: 2021,
    preco: 189900,
    km: 45000,
    combustivel: "Diesel",
    cambio: "Automatico",
    categoria: "Caminhonetes/SUV",
    cor: "Preto",
    descricao: "Teto solar, couro, todas as revisoes feitas, muito novo.",
    cidade: "Campinas",
    estado: "SP",
    destaque: true,
    ativo: true,
    criadoEm: new Date(),
    userId: "mock-user-2",
    fotos: [{ id: "f2", url: "https://placehold.co/600x400?text=Compass+Limited", anuncioId: "mock-2" }],
    user: { name: "Ana Souza", whatsapp: "11976661297" },
  },
  {
    id: "mock-3",
    titulo: "Honda Civic EXL 1.5 Turbo",
    marca: "Honda",
    modelo: "Civic",
    ano: 2023,
    preco: 168500,
    km: 12000,
    combustivel: "Gasolina",
    cambio: "CVT",
    categoria: "Carros",
    cor: "Branco",
    descricao: "Seminovo, garantia de fabrica ativa, primeiro emplacamento 2023.",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    destaque: false,
    ativo: true,
    criadoEm: new Date(),
    userId: "mock-user-3",
    fotos: [{ id: "f3", url: "https://placehold.co/600x400?text=Civic+EXL+Turbo", anuncioId: "mock-3" }],
    user: { name: "Pedro Lima", whatsapp: "11976661297" },
  },
]

async function getAnuncios() {
  if (!process.env.DATABASE_URL) {
    console.log("Sem DATABASE_URL, usando mock.")
    return MOCK_ANUNCIOS as any
  }
  try {
    const { prisma } = await import("@/lib/prisma")
    const anuncios = await prisma.anuncio.findMany({
      where: { ativo: true },
      include: {
        fotos: true,
        user: { select: { name: true, whatsapp: true } },
      },
      orderBy: [{ destaque: "desc" }, { criadoEm: "desc" }],
    })
    return anuncios
  } catch (error) {
    console.error("Erro ao buscar anuncios, usando mock:", error)
    return MOCK_ANUNCIOS as any
  }
}

export default async function Home() {
  const anuncios = await getAnuncios()
  return (
    <>
      <Navbar />
      <Hero />
      <SearchPanel />
      <Listings anuncios={anuncios} />
      <Footer />
    </>
  )
}