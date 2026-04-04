import Link from 'next/link'

export default function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div className="footer-brand-col">
          <div className="footer-logo"><span>🚗</span> Vibe<span>Carros</span></div>
          <p><strong>Sobre Nós</strong></p>
          <p style={{marginTop:'6px'}}>O VibeCarros é o marketplace de compra e venda de veículos mais transparente do Brasil. Preço pedido e Tabela FIPE lado a lado em cada anúncio.</p>
          <p style={{marginTop:'10px'}}>Nosso compromisso é conectar pessoas ao veículo certo, com segurança e total transparência.</p>
          <div className="footer-webseguros-badge">
            <div>🛡️</div>
            <div>
              <strong>Uma marca da WebSeguros</strong>
              <span>CNPJ: 12.345.678/0001-99</span>
            </div>
          </div>
        </div>

        <div className="footer-col">
          <h5>Navegação</h5>
          <ul>
            <li><Link href="/#busca">Buscar Veículos</Link></li>
            <li><Link href="/#anuncios">Anúncios em Destaque</Link></li>
            <li><Link href="/anunciar">Anunciar Grátis</Link></li>
            <li><a href="https://veiculos.fipe.org.br/" target="_blank">Tabela FIPE Oficial ↗</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Institucional</h5>
          <ul>
            <li><Link href="/sobre">Sobre a WebSeguros</Link></li>
            <li><Link href="/termos">Termos de Uso</Link></li>
            <li><Link href="/privacidade">Política de Privacidade</Link></li>
            <li><Link href="/planos">Planos e Preços</Link></li>
            <li><Link href="/ajuda">Central de Ajuda</Link></li>
            <li><Link href="/blog">Blog — Em breve</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Contato</h5>
          <div className="footer-contact-item">
            <div>🌐</div>
            <div>
              <strong>Site</strong>
              <a href="https://vibecarros.com.br" target="_blank">vibecarros.com.br</a>
            </div>
          </div>
          <div className="footer-contact-item">
            <div>📧</div>
            <div>
              <strong>E-mail</strong>
              <a href="mailto:contato@vibecarros.com.br">contato@vibecarros.com.br</a>
            </div>
          </div>
          <div className="footer-contact-item">
            <div>📍</div>
            <div>
              <strong>Atendimento</strong>
              Segunda a Sexta, 8h às 18h
            </div>
          </div>
          <a className="footer-wpp-btn" href="https://wa.me/5511999990000?text=Olá! Vim pelo VibeCarros e gostaria de suporte." target="_blank">
            💬 Falar pelo WhatsApp
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <div>© 2025 VibeCarros — Uma marca da WebSeguros · CNPJ 12.345.678/0001-99 · Todos os direitos reservados.</div>
        <div>
          <Link href="/termos">Termos</Link>
          <span> · </span>
          <Link href="/privacidade">Privacidade</Link>
          <span> · </span>
          <a href="https://veiculos.fipe.org.br/" target="_blank">Tabela FIPE Oficial</a>
        </div>
      </div>
    </footer>
  )
}