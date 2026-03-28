// src/app/imoveis-itu/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import LocalBusinessSchema from '@/components/seo/LocalBusinessSchema';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import FAQSchema from '@/components/seo/FAQSchema';

export const metadata: Metadata = {
  title: 'Imobiliária em Itu SP - Apartamentos e Casas Perto de Você | Imobiliária Perto',
  description: 'Encontre apartamentos e casas para alugar em Itu SP. Imóveis no Centro, Cidade Nova, Parque Residencial Potiguara. Imobiliária especializada em Itu.',
  keywords: 'imobiliária itu, apartamento itu, casa para alugar itu, imóveis itu sp, aluguel itu',
  openGraph: {
    title: 'Imobiliária em Itu SP - Imóveis Perto de Você',
    description: 'Os melhores apartamentos e casas para alugar em Itu SP',
    url: 'https://www.imobiliariaperto.com.br/imoveis-itu',
    siteName: 'Imobiliária Perto',
    locale: 'pt_BR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.imobiliariaperto.com.br/imoveis-itu',
  },
};

const faqItems = [
  {
    question: 'Qual o valor médio do aluguel em Itu SP?',
    answer: 'O valor médio de aluguel em Itu varia de R$ 900 a R$ 1.800 para apartamentos e R$ 1.500 a R$ 3.000 para casas, dependendo do bairro e tamanho do imóvel.',
  },
  {
    question: 'Quais os melhores bairros para morar em Itu?',
    answer: 'Os bairros mais procurados em Itu são: Centro (histórico e completo), Cidade Nova (moderno), Parque Residencial Potiguara (residencial) e Jardim Aeroporto (tranquilo).',
  },
  {
    question: 'Vale a pena morar em Itu?',
    answer: 'Sim! Itu oferece excelente qualidade de vida, custo acessível, patrimônio histórico rico e localização estratégica entre Sorocaba e Campinas.',
  },
];

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Imóveis em Itu', url: '/imoveis-itu' },
];

async function getImoveisItu() {
  try {
    const imoveis = await prisma.imovel.findMany({
      where: {
        cidade: 'Itu',
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
        where: { cidade: 'Itu', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true },
      }),
      prisma.imovel.count({
        where: { cidade: 'Itu', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true, tipo: 'Casa' },
      }),
      prisma.imovel.count({
        where: { cidade: 'Itu', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true, tipo: 'Apartamento' },
      }),
      prisma.imovel.count({
        where: { cidade: 'Itu', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true, finalidade: 'aluguel' },
      }),
      prisma.imovel.count({
        where: { cidade: 'Itu', status: { in: ['ATIVO', 'ALUGADO', 'VENDIDO'] }, disponivel: true, finalidade: 'venda' },
      }),
    ]);
    return { total, casas, apartamentos, aluguel, venda };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return { total: 0, casas: 0, apartamentos: 0, aluguel: 0, venda: 0 };
  }
}

export default async function ImoveisItuPage() {
  const imoveis = await getImoveisItu();
  const stats = await getEstatisticas();

  return (
    <>
      <LocalBusinessSchema cidade="Itu" />
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
            Imobiliária em Itu SP - Encontre seu Imóvel Perto de Você
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Procurando <strong>apartamentos ou casas para alugar em Itu SP</strong>? 
            A <strong>Imobiliária Perto</strong> oferece os melhores imóveis no Centro, 
            Cidade Nova, Parque Residencial Potiguara e Jardim Aeroporto.
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
          <h2 className="text-3xl font-bold mb-6">Imóveis em Itu SP por Bairro</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Apartamentos e Casas no Centro de Itu
              </h3>
              <p className="text-gray-700 mb-4">
                O <strong>centro histórico de Itu</strong> combina charme colonial com 
                infraestrutura moderna. Próximo a comércios, restaurantes e pontos turísticos 
                como a Igreja Matriz e o Museu da Energia.
              </p>
              <Link 
                href="/imoveis-publicos?cidade=Itu&bairro=Centro" 
                className="text-blue-600 hover:underline"
              >
                Ver imóveis no Centro →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Imóveis na Cidade Nova - Itu
              </h3>
              <p className="text-gray-700 mb-4">
                Bairro planejado e moderno, com Shopping Itu Plaza, hospitais e escolas. 
                Excelente opção para famílias que buscam conforto e praticidade.
              </p>
              <Link 
                href="/imoveis-publicos?cidade=Itu&bairro=Cidade Nova" 
                className="text-blue-600 hover:underline"
              >
                Ver imóveis na Cidade Nova →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Casas no Parque Residencial Potiguara
              </h3>
              <p className="text-gray-700 mb-4">
                Bairro residencial com casas amplas, tranquilidade e segurança. Ideal para 
                quem busca sossego sem abrir mão da proximidade com o centro de Itu.
              </p>
              <Link 
                href="/imoveis-publicos?cidade=Itu&bairro=Parque Residencial Potiguara" 
                className="text-blue-600 hover:underline"
              >
                Ver imóveis no Potiguara →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">
                Apartamentos no Jardim Aeroporto
              </h3>
              <p className="text-gray-700 mb-4">
                Bairro consolidado com boa infraestrutura comercial e residencial. Fácil 
                acesso às principais vias e próximo ao Parque Linear do Rio Tietê.
              </p>
              <Link 
                href="/imoveis-publicos?cidade=Itu&bairro=Jardim Aeroporto" 
                className="text-blue-600 hover:underline"
              >
                Ver imóveis no Jardim Aeroporto →
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Imóveis Disponíveis em Itu</h2>
          
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
                        alt={`${imovel.tipo} em ${imovel.bairro || 'Itu'}`}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Sem imagem</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">
                        {imovel.tipo} - {imovel.bairro || 'Itu'}
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
              href="/imoveis-publicos?cidade=Itu"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Todos os Imóveis em Itu
            </Link>
          </div>
        </section>

        <section className="mb-12 bg-gray-50 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6">Por que Morar em Itu SP?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">🏛️ Patrimônio Histórico</h3>
              <p className="text-gray-700">
                Cidade histórica com arquitetura colonial preservada, museus e pontos turísticos 
                que encantam moradores e visitantes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🛍️ Infraestrutura Completa</h3>
              <p className="text-gray-700">
                Shopping centers, hospitais de qualidade, escolas públicas e particulares, além 
                de faculdades e cursos técnicos.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🚗 Localização Privilegiada</h3>
              <p className="text-gray-700">
                Entre Sorocaba e Campinas, com fácil acesso pela Rodovia Castello Branco. 
                Próxima a Salto e Indaiatuba.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">🌳 Qualidade de Vida</h3>
              <p className="text-gray-700">
                Ar puro, parques naturais, clima agradável e custo de vida mais acessível que 
                grandes centros urbanos.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Perguntas Frequentes - Imóveis em Itu SP</h2>
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
            Encontre seu Imóvel Ideal em Itu SP
          </h2>
          <p className="text-lg mb-6">
            Nossa equipe está pronta para ajudar você a encontrar o imóvel perfeito perto de você.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link 
              href="/imoveis-publicos?cidade=Itu"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Ver Todos os Imóveis
            </Link>
            <a 
              href="https://wa.me/5511976661297?text=Olá! Gostaria de mais informações sobre imóveis em Itu"
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
