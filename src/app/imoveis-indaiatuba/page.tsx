// src/app/imoveis-indaiatuba/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import LocalBusinessSchema from '@/components/seo/LocalBusinessSchema';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import FAQSchema from '@/components/seo/FAQSchema';

export const metadata: Metadata = {
  title: 'Imobiliária em Indaiatuba SP - Apartamentos e Casas Perto de Você | Imobiliária Perto',
  description: 'Encontre apartamentos e casas para alugar em Indaiatuba SP. Imóveis em Cidade Nova, Morada do Sol, Jardim Pau Preto. Imobiliária especializada em Indaiatuba.',
  keywords: 'imobiliária indaiatuba, apartamento indaiatuba, casa para alugar indaiatuba, imóveis indaiatuba sp, aluguel indaiatuba',
  openGraph: {
    title: 'Imobiliária em Indaiatuba SP - Imóveis Perto de Você',
    description: 'Os melhores apartamentos e casas para alugar em Indaiatuba SP',
    url: 'https://www.imobiliariaperto.com.br/imoveis-indaiatuba',
    siteName: 'Imobiliária Perto',
    locale: 'pt_BR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.imobiliariaperto.com.br/imoveis-indaiatuba',
  },
};

const faqItems = [
  {
    question: 'Qual o valor médio do aluguel em Indaiatuba SP?',
    answer: 'O valor médio de aluguel em Indaiatuba varia de R$ 1.000 a R$ 2.000 para apartamentos e R$ 1.800 a R$ 3.500 para casas, dependendo do bairro e características do imóvel.',
  },
  {
    question: 'Quais os melhores bairros para morar em Indaiatuba?',
    answer: 'Os bairros mais procurados em Indaiatuba são: Cidade Nova (infraestrutura), Morada do Sol (residencial), Jardim Pau Preto (valorizado) e Parque Residencial Indaiá (familiar).',
  },
  {
    question: 'Por que Indaiatuba é uma boa cidade para morar?',
    answer: 'Indaiatuba é considerada uma das melhores cidades do interior paulista, com excelente IDH, polo tecnológico forte, segurança acima da média e qualidade de vida excepcional.',
  },
];

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Imóveis em Indaiatuba', url: '/imoveis-indaiatuba' },
];

async function getImoveisIndaiatuba() {
  try {
    const imoveis = await prisma.imovel.findMany({
      where: {
        cidade: 'Indaiatuba',
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
        where: { cidade: 'Indaiatuba', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true },
      }),
      prisma.imovel.count({
        where: { cidade: 'Indaiatuba', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true, tipo: 'Casa' },
      }),
      prisma.imovel.count({
        where: { cidade: 'Indaiatuba', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true, tipo: 'Apartamento' },
      }),
      prisma.imovel.count({
        where: { cidade: 'Indaiatuba', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true, finalidade: 'aluguel' },
      }),
      prisma.imovel.count({
        where: { cidade: 'Indaiatuba', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true, finalidade: 'venda' },
      }),
    ]);
    return { total, casas, apartamentos, aluguel, venda };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return { total: 0, casas: 0, apartamentos: 0, aluguel: 0, venda: 0 };
  }
}

export default async function ImoveisIndaiatubaPage() {
  const imoveis = await getImoveisIndaiatuba();
  const stats = await getEstatisticas();

  return (
    <>
      <LocalBusinessSchema cidade="Indaiatuba" />
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema items={faqItems} />

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
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Imobiliária em Indaiatuba SP - Encontre seu Imóvel Perto de Você
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Procurando <strong>apartamentos ou casas para alugar em Indaiatuba SP</strong>? 
            A <strong>Imobiliária Perto</strong> oferece os melhores imóveis em Cidade Nova, 
            Morada do Sol, Jardim Pau Preto e Parque Residencial Indaiá.
          </p>

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

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Imóveis em Indaiatuba SP por Bairro</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Apartamentos e Casas em Cidade Nova
              </h3>
              <p className="text-gray-700 mb-4">
                <strong>Cidade Nova</strong> é o coração de Indaiatuba, com Polo Shopping, 
                hospital São Paulo, escolas e restaurantes. Excelente infraestrutura para 
                famílias e profissionais.
              </p>
              <Link 
                href="/imoveis-publicos?cidade=Indaiatuba&bairro=Cidade Nova" 
                className="text-blue-600 hover:underline"
              >
                Ver imóveis em Cidade Nova →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Imóveis no Morada do Sol
              </h3>
              <p className="text-gray-700 mb-4">
                Bairro residencial planejado, com condomínios fechados, áreas verdes e 
                segurança. Ideal para famílias que buscam tranquilidade e qualidade de vida.
              </p>
              <Link 
                href="/imoveis-publicos?cidade=Indaiatuba&bairro=Morada do Sol" 
                className="text-blue-600 hover:underline"
              >
                Ver imóveis no Morada do Sol →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Casas no Jardim Pau Preto
              </h3>
              <p className="text-gray-700 mb-4">
                Bairro valorizado e consolidado, com casas amplas e terrenos generosos. 
                Próximo ao centro e com fácil acesso às principais vias da cidade.
              </p>
              <Link 
                href="/imoveis-publicos?cidade=Indaiatuba&bairro=Jardim Pau Preto" 
                className="text-blue-600 hover:underline"
              >
                Ver imóveis no Jardim Pau Preto →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Apartamentos no Parque Residencial Indaiá
              </h3>
              <p className="text-gray-700 mb-4">
                Bairro familiar com escolas, comércio local e áreas de lazer. Ótimo 
                custo-benefício para quem busca apartamentos em Indaiatuba.
              </p>
              <Link 
                href="/imoveis-publicos?cidade=Indaiatuba&bairro=Parque Residencial Indaiá" 
                className="text-blue-600 hover:underline"
              >
                Ver imóveis no Parque Indaiá →
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Imóveis Disponíveis em Indaiatuba</h2>
          
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
                        alt={`${imovel.tipo} em ${imovel.bairro || 'Indaiatuba'}`}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Sem imagem</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">
                        {imovel.tipo} - {imovel.bairro || 'Indaiatuba'}
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
              href="/imoveis-publicos?cidade=Indaiatuba"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Todos os Imóveis em Indaiatuba
            </Link>
          </div>
        </section>

        <section className="mb-12 bg-gray-50 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6">Por que Morar em Indaiatuba SP?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">🏢 Polo Tecnológico</h3>
              <p className="text-gray-700">
                Sede de grandes empresas como Toyota, John Deere, Bosch e Dell, gerando 
                empregos de qualidade e desenvolvimento econômico.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">📊 Alto IDH</h3>
              <p className="text-gray-700">
                Uma das cidades com melhor Índice de Desenvolvimento Humano do Brasil, 
                com excelentes indicadores de educação, saúde e renda.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🎓 Educação de Qualidade</h3>
              <p className="text-gray-700">
                Escolas de excelência, faculdades renomadas e ensino técnico de ponta, 
                preparando os melhores profissionais.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🌳 Qualidade de Vida</h3>
              <p className="text-gray-700">
                Parques bem cuidados, infraestrutura moderna, baixos índices de violência 
                e excelente planejamento urbano.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Perguntas Frequentes - Imóveis em Indaiatuba SP</h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">{item.question}</h3>
                <p className="text-gray-700">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-blue-600 text-white p-8 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">
            Encontre seu Imóvel Ideal em Indaiatuba SP
          </h2>
          <p className="text-lg mb-6">
            Nossa equipe está pronta para ajudar você a encontrar o imóvel perfeito perto de você.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link 
              href="/imoveis-publicos?cidade=Indaiatuba"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Ver Todos os Imóveis
            </Link>
            <a 
              href="https://wa.me/5511976661297?text=Olá! Gostaria de mais informações sobre imóveis em Indaiatuba"
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
