// src/app/imoveis-porto-feliz/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import LocalBusinessSchema from '@/components/seo/LocalBusinessSchema';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import FAQSchema from '@/components/seo/FAQSchema';

export const metadata: Metadata = {
  title: 'Imobiliária em Porto Feliz SP - Apartamentos e Casas Perto de Você | Imobiliária Perto',
  description: 'Encontre apartamentos e casas para alugar ou comprar em Porto Feliz SP. Imóveis no Centro, Jardim São Paulo, Vila Aparecida e bairros nobres. Imobiliária especializada em Porto Feliz.',
  keywords: 'imobiliária porto feliz, apartamento porto feliz, casa para alugar porto feliz, imóveis porto feliz sp, aluguel porto feliz',
  openGraph: {
    title: 'Imobiliária em Porto Feliz SP - Imóveis Perto de Você',
    description: 'Os melhores apartamentos e casas para alugar ou comprar em Porto Feliz SP',
    url: 'https://www.imobiliariaperto.com.br/imoveis-porto-feliz',
    siteName: 'Imobiliária Perto',
    locale: 'pt_BR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.imobiliariaperto.com.br/imoveis-porto-feliz',
  },
};

const faqItems = [
  {
    question: 'Qual o valor médio do aluguel em Porto Feliz SP?',
    answer: 'O valor médio de aluguel em Porto Feliz varia de R$ 700 a R$ 1.400 para apartamentos e R$ 1.000 a R$ 2.200 para casas, dependendo do bairro e tamanho do imóvel.',
  },
  {
    question: 'Quais os melhores bairros para morar em Porto Feliz?',
    answer: 'Os bairros mais procurados em Porto Feliz são: Centro (comércio e serviços), Jardim São Paulo (tranquilo e familiar), Vila Aparecida (bem localizado) e Jardim Estância Brasil (valorizado e próximo ao Tietê).',
  },
  {
    question: 'Como alugar um imóvel em Porto Feliz pela Imobiliária Perto?',
    answer: 'É simples! Navegue pelos nossos imóveis disponíveis, escolha o que mais gosta e entre em contato conosco. Nossa equipe irá te guiar em todo o processo de locação.',
  },
];

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Imóveis em Porto Feliz', url: '/imoveis-porto-feliz' },
];

async function getImoveisPortoFeliz() {
  try {
    const imoveis = await prisma.imovel.findMany({
      where: {
        cidade: 'Porto Feliz',
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
        where: { cidade: 'Porto Feliz', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true },
      }),
      prisma.imovel.count({
        where: { cidade: 'Porto Feliz', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true, tipo: 'Casa' },
      }),
      prisma.imovel.count({
        where: { cidade: 'Porto Feliz', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true, tipo: 'Apartamento' },
      }),
      prisma.imovel.count({
        where: { cidade: 'Porto Feliz', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true, finalidade: 'aluguel' },
      }),
      prisma.imovel.count({
        where: { cidade: 'Porto Feliz', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true, finalidade: 'venda' },
      }),
    ]);
    return { total, casas, apartamentos, aluguel, venda };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return { total: 0, casas: 0, apartamentos: 0, aluguel: 0, venda: 0 };
  }
}

export default async function ImoveisPortoFelizPage() {
  const imoveis = await getImoveisPortoFeliz();
  const stats = await getEstatisticas();

  return (
    <>
      {/* Schema Markup */}
      <LocalBusinessSchema cidade="Porto Feliz" />
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
            Imobiliária em Porto Feliz SP - Encontre seu Imóvel Perto de Você
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Procurando <strong>apartamentos ou casas para alugar ou comprar em Porto Feliz SP</strong>?
            A <strong>Imobiliária Perto</strong> é especialista no mercado imobiliário de
            Porto Feliz e região, com os melhores imóveis no Centro, Jardim São Paulo,
            Vila Aparecida e Jardim Estância Brasil.
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

        {/* Bairros de Porto Feliz */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Imóveis em Porto Feliz SP por Bairro</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Apartamentos e Casas no Centro de Porto Feliz
              </h3>
              <p className="text-gray-700 mb-4">
                O <strong>Centro de Porto Feliz</strong> reúne o comércio local, prefeitura,
                bancos e fácil acesso a transporte. Ideal para quem busca praticidade e
                proximidade de tudo que a cidade oferece no dia a dia.
              </p>
              <Link
                href="/imoveis-publicos?cidade=Porto Feliz&bairro=Centro"
                className="text-blue-600 hover:underline"
              >
                Ver imóveis no Centro →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Imóveis no Jardim São Paulo
              </h3>
              <p className="text-gray-700 mb-4">
                O <strong>Jardim São Paulo</strong> é um bairro tranquilo e familiar,
                muito procurado por quem busca sossego sem abrir mão de boa infraestrutura.
                Ótima opção para famílias com crianças em Porto Feliz.
              </p>
              <Link
                href="/imoveis-publicos?cidade=Porto Feliz&bairro=Jardim São Paulo"
                className="text-blue-600 hover:underline"
              >
                Ver imóveis no Jardim São Paulo →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Casas e Apartamentos na Vila Aparecida
              </h3>
              <p className="text-gray-700 mb-4">
                A <strong>Vila Aparecida</strong> é uma região bem localizada e consolidada
                em Porto Feliz, com bom acesso ao centro e serviços essenciais. Oferece
                imóveis com ótimo custo-benefício para moradia.
              </p>
              <Link
                href="/imoveis-publicos?cidade=Porto Feliz&bairro=Vila Aparecida"
                className="text-blue-600 hover:underline"
              >
                Ver imóveis na Vila Aparecida →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Imóveis no Jardim Estância Brasil
              </h3>
              <p className="text-gray-700 mb-4">
                O <strong>Jardim Estância Brasil</strong> é um dos bairros mais valorizados
                de Porto Feliz, próximo ao Rio Tietê e com excelente infraestrutura. Uma
                opção premium para quem busca qualidade de vida na cidade.
              </p>
              <Link
                href="/imoveis-publicos?cidade=Porto Feliz&bairro=Jardim Estância Brasil"
                className="text-blue-600 hover:underline"
              >
                Ver imóveis no Jardim Estância Brasil →
              </Link>
            </div>
          </div>
        </section>

        {/* Imóveis em Destaque */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Imóveis Disponíveis em Porto Feliz</h2>

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
                        alt={`${imovel.tipo} em ${imovel.bairro || 'Porto Feliz'}`}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Sem imagem</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">
                        {imovel.tipo} - {imovel.bairro || 'Porto Feliz'}
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
              href="/imoveis-publicos?cidade=Porto Feliz"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Todos os Imóveis em Porto Feliz
            </Link>
          </div>
        </section>

        {/* Por que Morar em Porto Feliz */}
        <section className="mb-12 bg-gray-50 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6">Por que Morar em Porto Feliz SP?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">🌊 Cidade às Margens do Tietê</h3>
              <p className="text-gray-700">
                Porto Feliz é conhecida pela sua história com a Expedição dos Bandeirantes
                e pelo belo rio Tietê, oferecendo lazer, natureza e turismo para os moradores.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🏭 Economia Diversificada</h3>
              <p className="text-gray-700">
                Com indústrias, agronegócio e comércio forte, Porto Feliz tem boa geração de
                empregos e uma economia estável que valoriza o mercado imobiliário local.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🚗 Localização Privilegiada</h3>
              <p className="text-gray-700">
                A aproximadamente 30 minutos de Salto e Itu, e 45 minutos de Sorocaba,
                com acesso pela Rodovia SP-079 e estradas estaduais bem conservadas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🏡 Custo de Vida Acessível</h3>
              <p className="text-gray-700">
                Uma das cidades com melhor custo-benefício da região, com imóveis mais
                acessíveis que Salto e Sorocaba, mantendo excelente qualidade de vida.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Perguntas Frequentes - Imóveis em Porto Feliz SP</h2>
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
            Encontre seu Imóvel Ideal em Porto Feliz SP
          </h2>
          <p className="text-lg mb-6">
            Nossa equipe está pronta para ajudar você a encontrar o imóvel perfeito perto de você.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/imoveis-publicos?cidade=Porto Feliz"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Ver Todos os Imóveis
            </Link>
            <a
              href="https://wa.me/5511976661297?text=Olá! Gostaria de mais informações sobre imóveis em Porto Feliz"
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
