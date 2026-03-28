interface Imovel {
  id: string
  type: string
  title: string
  addr: string
  price: number
  imagens: string[]
  description: string | null
  quartos?: number | null
  banheiros?: number | null
  garagem?: number | null
  metragem?: number | null
  finalidade?: string | null
}

interface Props {
  imovel: Imovel
}

export default function SchemaMarkup({ imovel }: Props) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imobiliariaperto.com.br'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: imovel.title,
    description: imovel.description || `${imovel.type} disponível em ${imovel.addr}`,
    url: `${baseUrl}/imoveis/${imovel.id}`,
    image: imovel.imagens?.[0] || `${baseUrl}/placeholder.jpg`,
    offers: {
      '@type': 'Offer',
      price: imovel.price,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      businessFunction: imovel.finalidade === 'Aluguel' 
        ? 'https://schema.org/LeaseOut' 
        : 'https://schema.org/Sell',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: imovel.addr,
      addressCountry: 'BR',
    },
    numberOfRooms: imovel.quartos || undefined,
    numberOfBathroomsTotal: imovel.banheiros || undefined,
    floorSize: imovel.metragem
      ? {
          '@type': 'QuantitativeValue',
          value: imovel.metragem,
          unitCode: 'MTK',
        }
      : undefined,
  }

  const cleanSchema: any = JSON.parse(JSON.stringify(schema))

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanSchema) }}
    />
  )
}
