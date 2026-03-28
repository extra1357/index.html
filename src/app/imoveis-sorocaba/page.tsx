// src/app/imoveis-sorocaba/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import LocalBusinessSchema from '@/components/seo/LocalBusinessSchema';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import FAQSchema from '@/components/seo/FAQSchema';

export const metadata: Metadata = {
  title: 'Imobiliária em Sorocaba SP - Apartamentos e Casas Perto de Você | Imobiliária Perto',
  description: 'Encontre apartamentos e casas para alugar ou comprar em Sorocaba SP. Imóveis no Centro, Campolim, Jardim Emília e Wanel Ville. Imobiliária especializada em Sorocaba.',
  keywords: 'imobiliária sorocaba, apartamento sorocaba, casa para alugar sorocaba, imóveis sorocaba sp, aluguel sorocaba',
  openGraph: {
    title: 'Imobiliária em Sorocaba SP - Imóveis Perto de Você',
    description: 'Os melhores apartamentos e casas para alugar ou comprar em Sorocaba SP',
    url: 'https://www.imobiliariaperto.com.br/imoveis-sorocaba',
    siteName: 'Imobiliária Perto',
    locale: 'pt_BR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.imobiliariaperto.com.br/imoveis-sorocaba',
  },
};

const faqItems = [
  {
    question: 'Qual o valor médio do aluguel em Sorocaba SP?',
    answer: 'O valor médio de aluguel em Sorocaba varia de R$ 1.000 a R$ 2.500 para apartamentos e R$ 1.500 a R$ 3.500 para casas, dependendo do bairro e tamanho do imóvel.',
  },
  {
    question: 'Quais os melhores bairros para morar em Sorocaba?',
    answer: 'Os bairros mais procurados em Sorocaba são: Campolim (nobre e valorizado), Jardim Emília (infraestrutura completa), Wanel Ville (moderno) e Centro (prático e acessível).',
  },
  {
    question: 'Como alugar um imóvel em Sorocaba pela Imobiliária Perto?',
    answer: 'É simples! Navegue pelos nossos imóveis disponíveis, escolha o que mais gosta e entre em contato conosco. Nossa equipe irá te guiar em todo o processo de locação.',
  },
];

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Imóveis em Sorocaba', url: '/imoveis-sorocaba' },
];

async function getImoveissorocaba() {
  try {
    const imoveis = await prisma.imovel.findMany({
      where: {
        cidade: 'Sorocaba',
        status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] },
        disponivel: true,
      },
      take: 12,
      orderBy: [
        { destaque: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        tipo: true,
        endereco: true,
        bairro: true,
        preco: true,
        precoAluguel: true,
        metragem: true,
        quartos: true,
        banheiros: true,
        vagas: true,
        finalidade: true,
        imagens: true,
        destaque: true,
      },
    });
    return imoveis;
  } catch (error) {
    console.error('Erro ao buscar imóveis:', error);
    return [];
  }
}

async function getEstatisticas() {
  try {
    const [total, casas, apartamentos, aluguel, venda] = await Promise.all([
      prisma.imovel.count({
        where: { cidade: 'Sorocaba', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true },
      }),
      prisma.imovel.count({
        where: { cidade: 'Sorocaba', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true, tipo: 'Casa' },
      }),
      prisma.imovel.count({
        where: { cidade: 'Sorocaba', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true, tipo: 'Apartamento' },
      }),
      prisma.imovel.count({
        where: { cidade: 'Sorocaba', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true, finalidade: 'aluguel' },
      }),
      prisma.imovel.count({
        where: { cidade: 'Sorocaba', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true, finalidade: 'venda' },
      }),
    ]);
    return { total, casas, apartamentos, aluguel, venda };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return { total: 0, casas: 0, apartamentos: 0, aluguel: 0, venda: 0 };
  }
}

export default async function ImoveissorocabaPage() {
  const imoveis = await getImoveissorocaba();
  const stats = await getEstatisticas();

  return (
    <>
      {/* Schema Markup */}
      <LocalBusinessSchema cidade="Sorocaba" />
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema items={faqItems} />

      {/* Breadcrumb visual */}
      <nav aria-label="breadcrumb" className="container mx-auto px-4 py-4">
        <ol className="flex space-x-2 text-sm text-gray-600">
          {breadcrumbs.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="mx-2">/</span>}
              <Link href={item.url} className="hover:text-blue-600">
                {item.name}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Imobiliária em Sorocaba SP - Encontre seu Imóvel Perto de Você
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Procurando <strong>apartamentos ou casas para alugar ou comprar em Sorocaba SP</strong>?
            A <strong>Imobiliária Perto</strong> é especialista no mercado imobiliário de
            Sorocaba e região, com os melhores imóveis no Campolim, Jardim Emília, Wanel Ville e Centro.
          </p>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Imóveis Disponíveis</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">{stats.casas}</div>
              <div className="text-sm text-gray-600">Casas</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.apartamentos}</div>
              <div className="text-sm text-gray-600">Apartamentos</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.aluguel}</div>
              <div className="text-sm text-gray-600">Para Alugar</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-red-600">{stats.venda}</div>
              <div className="text-sm text-gray-600">Para Venda</div>
            </div>
          </div>
        </section>

        {/* Bairros de Sorocaba */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Imóveis em Sorocaba SP por Bairro</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Apartamentos e Casas no Campolim
              </h3>
              <p className="text-gray-700 mb-4">
                O <strong>Campolim</strong> é um dos bairros mais nobres e valorizados de Sorocaba,
                com condomínios de alto padrão, shoppings, escolas particulares e fácil acesso
                à Rodovia Raposo Tavares. Ideal para quem busca qualidade de vida e segurança.
              </p>
              <Link
                href="/imoveis-publicos?cidade=Sorocaba&bairro=Campolim"
                className="text-blue-600 hover:underline"
              >
                Ver imóveis no Campolim →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Imóveis no Jardim Emília
              </h3>
              <p className="text-gray-700 mb-4">
                O <strong>Jardim Emília</strong> oferece excelente infraestrutura com supermercados,
                escolas, farmácias e transporte público. Um bairro consolidado e muito procurado
                por famílias que buscam praticidade no dia a dia em Sorocaba.
              </p>
              <Link
                href="/imoveis-publicos?cidade=Sorocaba&bairro=Jardim Emília"
                className="text-blue-600 hover:underline"
              >
                Ver imóveis no Jardim Emília →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Casas e Apartamentos no Wanel Ville
              </h3>
              <p className="text-gray-700 mb-4">
                Bairro moderno e em constante crescimento, o <strong>Wanel Ville</strong> é
                uma das regiões mais valorizadas de Sorocaba. Próximo a universidades, centros
                comerciais e com ótimo acesso às principais vias da cidade.
              </p>
              <Link
                href="/imoveis-publicos?cidade=Sorocaba&bairro=Wanel Ville"
                className="text-blue-600 hover:underline"
              >
                Ver imóveis no Wanel Ville →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Imóveis no Centro de Sorocaba
              </h3>
              <p className="text-gray-700 mb-4">
                O <strong>Centro de Sorocaba</strong> concentra o comércio, serviços públicos,
                bancos e transporte. Uma opção prática e com excelente custo-benefício para
                quem quer morar bem sem pagar caro.
              </p>
              <Link
                href="/imoveis-publicos?cidade=Sorocaba&bairro=Centro"
                className="text-blue-600 hover:underline"
              >
                Ver imóveis no Centro →
              </Link>
            </div>
          </div>
        </section>

        {/* Imóveis em Destaque */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Imóveis Disponíveis em Sorocaba</h2>

          {imoveis.length === 0 ? (
            <p className="text-gray-600">
              Não há imóveis disponíveis no momento. Entre em contato conosco para mais informações.
            </p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {imoveis.map((imovel) => {
                const preco = imovel.finalidade === 'aluguel' && imovel.precoAluguel
                  ? Number(imovel.precoAluguel)
                  : Number(imovel.preco);

                return (
                  <Link
                    key={imovel.id}
                    href={`/imoveis-publicos/${imovel.id}`}
                    className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {imovel.imagens && imovel.imagens.length > 0 ? (
                      <img
                        src={imovel.imagens[0]}
                        alt={`${imovel.tipo} em ${imovel.bairro || 'Sorocaba'}`}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Sem imagem</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">
                        {imovel.tipo} - {imovel.bairro || 'Sorocaba'}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {imovel.quartos} quartos • {imovel.banheiros} banheiros • {Number(imovel.metragem)}m²
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-blue-600">
                          R$ {new Intl.NumberFormat('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(preco))}
                          {imovel.finalidade === 'aluguel' && '/mês'}
                        </span>
                        {imovel.destaque && (
                          <span className="bg-yellow-400 text-xs px-2 py-1 rounded">
                            Destaque
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              href="/imoveis-publicos?cidade=Sorocaba"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Todos os Imóveis em Sorocaba
            </Link>
          </div>
        </section>

        {/* Por que Morar em Sorocaba */}
        <section className="mb-12 bg-gray-50 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6">Por que Morar em Sorocaba SP?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">🏙️ Grande Centro Regional</h3>
              <p className="text-gray-700">
                Sorocaba é a 4ª maior cidade do interior paulista, com ampla oferta de empregos,
                serviços, hospitais e universidades de qualidade.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🏭 Polo Industrial e Tecnológico</h3>
              <p className="text-gray-700">
                Sede de grandes empresas como Toyota, Votorantim e Oxiteno, gerando milhares
                de empregos diretos e indiretos na região.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🚗 Localização Estratégica</h3>
              <p className="text-gray-700">
                A 100 km de São Paulo, com acesso fácil pelas rodovias Raposo Tavares,
                Castelo Branco e Dom Gabriel Paulino. Próxima a Salto, Itu e Campinas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🌿 Qualidade de Vida</h3>
              <p className="text-gray-700">
                Conhecida como "Princesa do Oeste", Sorocaba oferece parques, ciclovias,
                boa infraestrutura urbana e custo de vida menor que a capital.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Perguntas Frequentes - Imóveis em Sorocaba SP</h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">{item.question}</h3>
                <p className="text-gray-700">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <section className="bg-blue-600 text-white p-8 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">
            Encontre seu Imóvel Ideal em Sorocaba SP
          </h2>
          <p className="text-lg mb-6">
            Nossa equipe está pronta para ajudar você a encontrar o imóvel perfeito perto de você.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/imoveis-publicos?cidade=Sorocaba"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Ver Todos os Imóveis
            </Link>
            <a
              href="https://wa.me/5511976661297?text=Olá! Gostaria de mais informações sobre imóveis em Sorocaba"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              Falar no WhatsApp
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
