import type { Metadata } from "next";
import { Sora } from "next/font/google";
import Script from "next/script";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
  variable: "--font-sora",
});

const baseUrl = "https://strsoftware.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "STR Software | Desenvolvimento de Software Sob Medida em São Paulo",
    template: "%s | STR Software",
  },
  description:
    "Empresa de desenvolvimento de software personalizado em São Paulo. Sistemas web, marketplaces, ERPs, agentes de IA e SaaS para empresas do interior e capital paulista.",
  keywords: [
    "desenvolvimento de software São Paulo",
    "sistema web sob medida",
    "software house SP",
    "desenvolvimento Next.js",
    "criação de marketplace",
    "sistema ERP personalizado",
    "agentes de inteligência artificial",
    "SaaS desenvolvimento",
    "software Sorocaba",
    "software interior SP",
    "STR Software",
  ],
  authors: [{ name: "STR Software", url: baseUrl }],
  creator: "STR Software",
  publisher: "STR Software",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: baseUrl,
    siteName: "STR Software",
    title: "STR Software | Desenvolvimento de Software Sob Medida em São Paulo",
    description:
      "Sistemas web, marketplaces, ERPs e agentes de IA para empresas de São Paulo, interior e todo o Brasil.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "STR Software" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "STR Software | Software Sob Medida em SP",
    description: "Sistemas web, marketplaces, ERPs e IA para empresas paulistas.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: baseUrl },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "STR Software",
      url: baseUrl,
      description: "Empresa especializada em desenvolvimento de software sob medida, sistemas web, marketplaces e inteligência artificial para empresas em São Paulo e todo o Brasil.",
      address: { "@type": "PostalAddress", addressLocality: "São Paulo", addressRegion: "SP", addressCountry: "BR" },
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: "STR Software",
      publisher: { "@id": `${baseUrl}/#organization` },
    },
    {
      "@type": "LocalBusiness",
      "@id": `${baseUrl}/#localbusiness`,
      name: "STR Software",
      url: baseUrl,
      image: `${baseUrl}/og-image.png`,
      description: "Desenvolvimento de software personalizado em São Paulo. Sistemas web, marketplaces, ERPs, SaaS e agentes de IA.",
      address: { "@type": "PostalAddress", addressLocality: "São Paulo", addressRegion: "SP", addressCountry: "BR" },
      geo: { "@type": "GeoCoordinates", latitude: -23.5505, longitude: -46.6333 },
      areaServed: ["São Paulo Capital", "Grande São Paulo", "Interior de São Paulo", "Brasil"],
      serviceType: ["Desenvolvimento de Software", "Marketplace", "ERP", "Agentes de IA", "SaaS"],
      priceRange: "$$",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`${sora.variable} font-sans bg-[#080808] antialiased`}>
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}