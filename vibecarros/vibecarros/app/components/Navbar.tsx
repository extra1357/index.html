import Link from 'next/link'

export default function Navbar() {
  return (
    <nav>
      <Link href='/' className='logo'>
        <div className='logo-icon'>🚗</div>
        Vibe<span style={{color:'var(--accent2)'}}>Carros</span>
      </Link>
      <div className='nav-links'>
        <Link href='/#busca'>Buscar Carros</Link>
        <Link href='/#anuncios'>Anúncios</Link>
        <a href='https://veiculos.fipe.org.br/' target='_blank' style={{color:'var(--accent2)'}}>Tabela FIPE</a>
        <Link href='/anunciar' className='btn-nav'>Anunciar Grátis</Link>
      </div>
    </nav>
  )
}