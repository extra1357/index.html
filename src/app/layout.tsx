import type { Metadata, Viewport } from "next";
import "./globals.css";

// Configuração moderna de Viewport (Substitui as tags antigas mobile-web-app-capable)
export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Sistema Imobiliário",
  description: "Gerenciamento de Imóveis e Leads",
  // O Next.js se encarrega de injetar as tags corretas de PWA no build
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
