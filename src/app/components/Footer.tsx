'use client'

import Link from 'next/link'

// Ícones SVG inline
const Icons = {
  Phone: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  WhatsApp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
  Mail: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  MapPin: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Instagram: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  Facebook: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  YouTube: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
}

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const whatsappNumber = '5511976661297'
  const whatsappMessage = encodeURIComponent('Olá! Vim pelo site e gostaria de mais informações sobre imóveis.')

  return (
    <footer className="footer">
      {/* Seção Principal */}
      <div className="footer-main">
        <div className="footer-container">
          {/* Coluna 1 - Sobre */}
          <div className="footer-col">
            <div className="footer-logo">
              <img src="/logo.png" alt="Imobiliária Perto" />
            </div>
            <p className="footer-slogan">Seu novo lar, mais próximo.</p>
            <p className="footer-about">
              Somos uma consultoria imobiliária comprometida em encontrar o imóvel perfeito para você. 
              Com atendimento personalizado e tecnologia de ponta, transformamos sonhos em endereços.
            </p>
            {/* Redes Sociais */}
            <div className="footer-social">
              <a href="https://instagram.com/ImobiliariaPerto" target="_blank" rel="noopener noreferrer" className="social-link instagram" aria-label="Instagram">
                <Icons.Instagram />
              </a>
              <a href="https://facebook.com/ImobiliariaPerto" target="_blank" rel="noopener noreferrer" className="social-link facebook" aria-label="Facebook">
                <Icons.Facebook />
              </a>
              <a href="https://youtube.com/@ImobiliariaPerto" target="_blank" rel="noopener noreferrer" className="social-link youtube" aria-label="YouTube">
                <Icons.YouTube />
              </a>
            </div>
          </div>

          {/* Coluna 2 - Links Rápidos */}
          <div className="footer-col">
            <h3 className="footer-title">Links Rápidos</h3>
            <ul className="footer-links">
              <li><Link href="/">Início</Link></li>
              <li><Link href="/?finalidade=venda">Comprar</Link></li>
              <li><Link href="/?finalidade=aluguel">Alugar</Link></li>
              <li><Link href="/?tipo=casa">Casas</Link></li>
              <li><Link href="/?tipo=apartamento">Apartamentos</Link></li>
              <li><Link href="/?tipo=terreno">Terrenos</Link></li>
              <li>
                <a href="https://blog.imobiliariaperto.com.br" target="_blank" rel="noopener noreferrer">
                  📝 Blog
                </a>
              </li>
              <li>
                <a href="https://www.tributoimoveis.com.br" target="_blank" rel="noopener noreferrer">
                  🏛️ Tributo Imóveis
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3 - Imóveis por Cidade */}
          <div className="footer-col">
            <h3 className="footer-title">Imóveis por Cidade</h3>
            <ul className="footer-links">
              <li><Link href="/imoveis-salto">📍 Salto</Link></li>
              <li><Link href="/imoveis-itu">📍 Itu</Link></li>
              <li><Link href="/imoveis-indaiatuba">📍 Indaiatuba</Link></li>
              <li><Link href="/imoveis-sorocaba">📍 Sorocaba</Link></li>
              <li><Link href="/imoveis-campinas">📍 Campinas</Link></li>
              <li><Link href="/imoveis-porto-feliz">📍 Porto Feliz</Link></li>
            </ul>
          </div>

          {/* Coluna 4 - Contato */}
          <div className="footer-col">
            <h3 className="footer-title">Contato</h3>
            <ul className="footer-contact">
              <li>
                <Icons.MapPin />
                <span>
                  Rua Estado do Maranhão, 289<br />
                  Terras de São Pedro e São Paulo<br />
                  Salto - SP, 13324-461
                </span>
              </li>
              <li>
                <Icons.Phone />
                <a href="tel:+5511976661297">(11) 97666-1297</a>
              </li>
              <li>
                <Icons.WhatsApp />
                <a href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer">
                  (11) 97666-1297
                </a>
              </li>
              <li>
                <Icons.Mail />
                <a href="mailto:imobiliariaperto@gmail.com">imobiliariaperto@gmail.com</a>
              </li>
              <li>
                <Icons.Clock />
                <span>
                  Seg a Sex: 9h às 18h<br />
                  Sábado: 9h às 12h
                </span>
              </li>
            </ul>
          </div>

          {/* Coluna 5 - Mapa */}
          <div className="footer-col">
            <h3 className="footer-title">Localização</h3>
            <div className="footer-map">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3665.8!2d-47.2869!3d-23.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDEyJzAwLjAiUyA0N8KwMTcnMTIuOCJX!5e0!3m2!1spt-BR!2sbr!4v1234567890"
                width="100%"
                height="180"
                style={{ border: 0, borderRadius: '8px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Imobiliária Perto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Seção Copyright + Dados Legais */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">

          {/* Linha 1 — copyright e CRECI */}
          <div className="footer-bottom-row">
            <p>© {currentYear} <strong>Imobiliária Perto</strong>. Todos os direitos reservados.</p>
            <p className="footer-creci">CRECI-SP: Em processo de registro</p>
          </div>

          {/* Linha 2 — dados legais */}
          <div className="footer-legal-row">
            <p className="footer-legal-text">
              <strong>Imobiliária Perto</strong> é uma das marcas da{' '}
              <strong>Empresa Cotaweb Seguros</strong>
              <span className="footer-separator">|</span>
              CNPJ: <span className="footer-cnpj">23.659.612/0001-96</span>
            </p>
          </div>

          {/* Linha 3 — crédito STR */}
          <div className="footer-str-row">
            <span className="footer-str-label">Site criado por</span>
            <a
              href="https://www.strsoftware.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-str-link"
            >
              ⚡ <strong>STR SOFTWARE GENETICS</strong>
            </a>
            <span className="footer-separator">—</span>
            <a
              href="https://www.strsoftware.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-str-url"
            >
              www.strsoftware.com.br
            </a>
          </div>

        </div>
      </div>

      <style jsx>{`
        .footer {
          background: linear-gradient(135deg, #1a1f36 0%, #0f1219 100%);
          color: #fff;
          margin-top: auto;
        }

        .footer-main {
          padding: 60px 0 40px;
        }

        .footer-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 40px;
        }

        .footer-col {
          display: flex;
          flex-direction: column;
        }

        .footer-logo {
          margin-bottom: 16px;
        }

        .footer-logo img {
          max-width: 180px;
          height: auto;
          border-radius: 8px;
        }

        .footer-slogan {
          color: #7dd3fc;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 16px;
        }

        .footer-about {
          color: #94a3b8;
          font-size: 14px;
          line-height: 1.7;
          margin-bottom: 20px;
        }

        .footer-social {
          display: flex;
          gap: 12px;
        }

        .social-link {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          transition: all 0.3s ease;
        }

        .social-link.instagram {
          background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
        }

        .social-link.facebook {
          background: #1877f2;
        }

        .social-link.youtube {
          background: #ff0000;
        }

        .social-link:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        .footer-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 24px;
          color: #fff;
          position: relative;
          padding-bottom: 12px;
        }

        .footer-title::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 40px;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #7dd3fc);
          border-radius: 2px;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links li {
          margin-bottom: 12px;
        }

        .footer-links a {
          color: #94a3b8;
          text-decoration: none;
          font-size: 14px;
          transition: all 0.2s ease;
          display: inline-block;
        }

        .footer-links a:hover {
          color: #7dd3fc;
          transform: translateX(5px);
        }

        .footer-contact {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-contact li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
          color: #94a3b8;
          font-size: 14px;
        }

        .footer-contact li :global(svg) {
          flex-shrink: 0;
          margin-top: 2px;
          color: #7dd3fc;
        }

        .footer-contact a {
          color: #94a3b8;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-contact a:hover {
          color: #7dd3fc;
        }

        .footer-map {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        /* ── RODAPÉ INFERIOR ── */
        .footer-bottom {
          background: rgba(0, 0, 0, 0.4);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 20px 0;
        }

        .footer-bottom-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
          text-align: center;
        }

        .footer-bottom-row {
          display: flex;
          gap: 24px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
        }

        .footer-bottom-row p {
          color: #64748b;
          font-size: 13px;
          margin: 0;
        }

        .footer-creci {
          font-size: 12px !important;
          color: #475569 !important;
        }

        .footer-legal-row {
          display: flex;
          justify-content: center;
        }

        .footer-legal-text {
          color: #475569;
          font-size: 12px;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .footer-legal-text strong {
          color: #64748b;
        }

        .footer-cnpj {
          font-family: monospace;
          letter-spacing: 0.05em;
          color: #64748b;
        }

        .footer-separator {
          color: #334155;
          padding: 0 4px;
        }

        .footer-str-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          padding-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.04);
          width: 100%;
        }

        .footer-str-label {
          font-size: 11px;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .footer-str-link {
          font-size: 12px;
          color: #3b82f6;
          text-decoration: none;
          font-weight: 700;
          letter-spacing: 0.05em;
          transition: color 0.2s;
        }

        .footer-str-link:hover {
          color: #7dd3fc;
        }

        .footer-str-url {
          font-size: 11px;
          color: #3b82f6;
          text-decoration: none;
          letter-spacing: 0.05em;
          transition: color 0.2s;
        }

        .footer-str-url:hover {
          color: #7dd3fc;
          text-decoration: underline;
        }

        /* Responsivo */
        @media (max-width: 1024px) {
          .footer-container {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .footer-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .footer-container {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .footer-col {
            align-items: center;
          }

          .footer-title::after {
            left: 50%;
            transform: translateX(-50%);
          }

          .footer-contact li {
            justify-content: center;
            text-align: left;
          }

          .footer-social {
            justify-content: center;
          }
        }
      `}</style>
    </footer>
  )
}
