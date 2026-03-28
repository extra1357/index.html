import { buscarImoveis } from '@/lib/imoveis';
import ListaImoveisClient from './components/ListaImoveisClient';
import Footer from './components/Footer';

export const revalidate = 300;

interface HomePageProps {
  searchParams: { cidade?: string };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const cidade = searchParams?.cidade || '';
  const imoveis = await buscarImoveis(cidade || undefined);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ListaImoveisClient initialData={imoveis} cidadeAtual={cidade} />
      <Footer />
    </div>
  );
}
