// src/app/imoveis-campinas/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import LocalBusinessSchema from '@/components/seo/LocalBusinessSchema';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import FAQSchema from '@/components/seo/FAQSchema';

export const metadata: Metadata = {
  title: 'Imobiliária em Campinas SP - Apartamentos e Casas Perto de Você | Imobiliária Perto',
  description: 'Encontre apartamentos e casas para alugar ou comprar em Campinas SP. Imóveis no Cambuí, Jardim Chapadão, Taquaral e Nova Campinas. Imobiliária especializada em Campinas.',
  keywords: 'imobiliária campinas, apartamento campinas, casa para alugar campinas, imóveis campinas sp, aluguel campinas',
  openGraph: {
    title: 'Imobiliária em Campinas SP - Imóveis Perto de Você',
    description: 'Os melhores apartamentos e casas para alugar ou comprar em Campinas SP',
    url: 'https://www.imobiliariaperto.com.br/imoveis-campinas',
    siteName: 'Imobiliária Perto',
    locale: 'pt_BR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.imobiliariaperto.com.br/imoveis-campinas',
  },
};

const faqItems = [
  {
    question: 'Qual o valor médio do aluguel em Campinas SP?',
    answer: 'O valor médio de aluguel em Campinas varia de R$ 1.200 a R$ 3.000 para apartamentos e R$ 2.000 a R$ 5.000 para casas, dependendo do bairro e tamanho do imóvel.',
  },
  {
    question: 'Quais os melhores bairros para morar em Campinas?',
    answer: 'Os bairros mais procurados em Campinas são: Cambuí (nobre e central), Taquaral (próximo ao lago), Nova Campinas (alto padrão) e Jardim Chapadão (tranquilo e bem localizado).',
  },
  {
    question: 'Como alugar um imóvel em Campinas pela Imobiliária Perto?',
    answer: 'É simples! Navegue pelos nossos imóveis disponíveis, escolha o que mais gosta e entre em contato conosco. Nossa equipe irá te guiar em todo o processo de locação.',
  },
];

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Imóveis em Campinas', url: '/imoveis-campinas' },
];

async function getImoveisCampinas() {
  try {
    const imoveis = await prisma.imovel.findMany({
      where: {
        cidade: 'Campinas',
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
        where: { cidade: 'Campinas', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true },
      }),
      prisma.imovel.count({
        where: { cidade: 'Campinas', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true, tipo: 'Casa' },
      }),
      prisma.imovel.count({
        where: { cidade: 'Campinas', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true, tipo: 'Apartamento' },
      }),
      prisma.imovel.count({
        where: { cidade: 'Campinas', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true, finalidade: 'aluguel' },
      }),
      prisma.imovel.count({
        where: { cidade: 'Campinas', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true, finalidade: 'venda' },
      }),
    ]);
    return { total, casas, apartamentos, aluguel, venda };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return { total: 0, casas: 0, apartamentos: 0, aluguel: 0, venda: 0 };
  }
}

export default async function ImoveisCampinasPage() {
  const imoveis = await getImoveisCampinas();
  const stats = await getEstatisticas();

  return (
    <>
      {/* Schema Markup */}
      <LocalBusinessSchema cidade="Campinas" />
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
            Imobiliária em Campinas SP - Encontre seu Imóvel Perto de Você
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Procurando <strong>apartamentos ou casas para alugar ou comprar em Campinas SP</strong>?
            A <strong>Imobiliária Perto</strong> é especialista no mercado imobiliário de
            Campinas e região, com os melhores imóveis no Cambuí, Taquaral, Nova Campinas
            e Jardim Chapadão.
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

        {/* Bairros de Campinas */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Imóveis em Campinas SP por Bairro</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Apartamentos e Casas no Cambuí
              </h3>
              <p className="text-gray-700 mb-4">
                O <strong>Cambuí</strong> é um dos bairros mais nobres e desejados de Campinas,
                com vida noturna agitada, restaurantes, bares, comércio sofisticado e fácil
                acesso ao centro. Ideal para quem busca praticidade e alto padrão de vida.
              </p>
              <Link
                href="/imoveis-publicos?cidade=Campinas&bairro=Cambuí"
                className="text-blue-600 hover:underline"
              >
                Ver imóveis no Cambuí →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Imóveis no Taquaral
              </h3>
              <p className="text-gray-700 mb-4">
                O <strong>Taquaral</strong> é um bairro tranquilo e familiar, famoso pelo
                Parque Portugal e o Lago do Taquaral. Ótima opção para famílias que buscam
                qualidade de vida, área verde e boa infraestrutura em Campinas.
              </p>
              <Link
                href="/imoveis-publicos?cidade=Campinas&bairro=Taquaral"
                className="text-blue-600 hover:underline"
              >
                Ver imóveis no Taquaral →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Casas e Apartamentos em Nova Campinas
              </h3>
              <p className="text-gray-700 mb-4">
                <strong>Nova Campinas</strong> é o bairro de alto padrão da cidade, com
                condomínios fechados, ruas arborizadas e excelente segurança. Muito procurado
                por executivos e famílias que buscam o melhor de Campinas.
              </p>
              <Link
                href="/imoveis-publicos?cidade=Campinas&bairro=Nova Campinas"
                className="text-blue-600 hover:underline"
              >
                Ver imóveis em Nova Campinas →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Imóveis no Jardim Chapadão
              </h3>
              <p className="text-gray-700 mb-4">
                O <strong>Jardim Chapadão</strong> é um bairro consolidado, bem localizado
                e com ótima infraestrutura. Próximo a shoppings, universidades e vias de
                acesso rápido, oferece imóveis com excelente custo-benefício em Campinas.
              </p>
              <Link
                href="/imoveis-publicos?cidade=Campinas&bairro=Jardim Chapadão"
                className="text-blue-600 hover:underline"
              >
                Ver imóveis no Jardim Chapadão →
              </Link>
            </div>
          </div>
        </section>

        {/* Imóveis em Destaque */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Imóveis Disponíveis em Campinas</h2>

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
                        alt={`${imovel.tipo} em ${imovel.bairro || 'Campinas'}`}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Sem imagem</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">
                        {imovel.tipo} - {imovel.bairro || 'Campinas'}
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
              href="/imoveis-publicos?cidade=Campinas"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Todos os Imóveis em Campinas
            </Link>
          </div>
        </section>

        {/* Por que Morar em Campinas */}
        <section className="mb-12 bg-gray-50 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6">Por que Morar em Campinas SP?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">🏙️ 2ª Maior Cidade do Interior</h3>
              <p className="text-gray-700">
                Campinas é a maior cidade do interior paulista em economia, com PIB expressivo,
                ampla oferta de empregos e uma das melhores infraestruturas do Brasil.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🎓 Polo Universitário e Tecnológico</h3>
              <p className="text-gray-700">
                Sede da Unicamp, PUC-Campinas e diversas faculdades, além de um forte polo
                tecnológico com empresas de TI, startups e centros de pesquisa.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">✈️ Hub de Transporte</h3>
              <p className="text-gray-700">
                O Aeroporto Internacional de Viracopos conecta Campinas ao mundo. A cidade
                também tem fácil acesso pelas rodovias Anhanguera, Bandeirantes e Dom Pedro I.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🏥 Saúde e Qualidade de Vida</h3>
              <p className="text-gray-700">
                Hospitais de referência como o HC-Unicamp e Albert Einstein, além de parques,
                shoppings e uma excelente rede de serviços para os moradores.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Perguntas Frequentes - Imóveis em Campinas SP</h2>
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
            Encontre seu Imóvel Ideal em Campinas SP
          </h2>
          <p className="text-lg mb-6">
            Nossa equipe está pronta para ajudar você a encontrar o imóvel perfeito perto de você.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/imoveis-publicos?cidade=Campinas"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Ver Todos os Imóveis
            </Link>
            <a
              href="https://wa.me/5511976661297?text=Olá! Gostaria de mais informações sobre imóveis em Campinas"
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
