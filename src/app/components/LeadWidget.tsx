'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function LeadWidget() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [showBalloon, setShowBalloon] = useState(false)
  const [balloonDismissed, setBalloonDismissed] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [leadForm, setLeadForm] = useState({ nome: '', email: '', telefone: '', mensagem: '' })

  if (pathname?.startsWith('/admin')) return null

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    const show = () => {
      if (!balloonDismissed && !menuOpen && !chatOpen && !formOpen) {
        setShowBalloon(true)
        setTimeout(() => setShowBalloon(false), 8000)
      }
    }
    const first = setTimeout(() => {
      show()
      interval = setInterval(show, 5 * 60 * 1000)
    }, 4000)
    return () => { clearTimeout(first); clearInterval(interval) }
  }, [balloonDismissed, menuOpen, chatOpen, formOpen])

  function closeAll() { setMenuOpen(false); setChatOpen(false); setFormOpen(false) }

  function handleToggle() {
    if (chatOpen || formOpen) { closeAll(); return }
    setShowBalloon(false)
    setBalloonDismissed(true)
    setMenuOpen(v => !v)
  }

  async function enviarLead(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...leadForm, origem: 'widget', status: 'novo' }),
      })
      if (res.ok) {
        setEnviado(true)
        setLeadForm({ nome: '', email: '', telefone: '', mensagem: '' })
        setTimeout(() => { setEnviado(false); setFormOpen(false) }, 4000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setEnviando(false)
    }
  }

  const sofiaFace = (
    <svg viewBox="0 0 72 72" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sw" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#f7cfa0"/>
          <stop offset="100%" stopColor="#d4915c"/>
        </radialGradient>
      </defs>
      <ellipse cx="36" cy="70" rx="22" ry="14" fill="#1a2235"/>
      <rect x="31" y="50" width="10" height="10" rx="5" fill="url(#sw)"/>
      <ellipse cx="36" cy="33" rx="15" ry="17" fill="url(#sw)"/>
      <ellipse cx="36" cy="17" rx="17" ry="12" fill="#1e0d04"/>
      <ellipse cx="21" cy="33" rx="3" ry="5" fill="#d4a070"/>
      <ellipse cx="51" cy="33" rx="3" ry="5" fill="#d4a070"/>
      <ellipse cx="29" cy="33" rx="3.5" ry="4" fill="white"/>
      <ellipse cx="43" cy="33" rx="3.5" ry="4" fill="white"/>
      <circle cx="30" cy="33.5" r="2" fill="#5c3a1e"/>
      <circle cx="44" cy="33.5" r="2" fill="#5c3a1e"/>
      <path d="M29 43 Q36 48 43 43" stroke="#c04535" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  )

  const actionStyle = (bg1: string, bg2: string, border: string, color: string): React.CSSProperties => ({
    display:'flex', alignItems:'center', gap:10,
    padding:'10px 18px', borderRadius:50,
    background:`linear-gradient(135deg,${bg1},${bg2})`,
    border, color, cursor:'pointer',
    fontFamily:'Arial', fontSize:14, fontWeight:500,
    whiteSpace:'nowrap', boxShadow:'0 4px 16px rgba(0,0,0,0.2)',
    transition:'transform 0.2s', textDecoration:'none',
    pointerEvents:'auto'
  })

  const inputStyle: React.CSSProperties = {
    width:'100%', padding:'12px 16px',
    background:'#111827', border:'1px solid rgba(201,168,76,0.2)',
    borderRadius:10, color:'#f0ece4',
    fontFamily:'Arial', fontSize:14,
    marginBottom:12, outline:'none', boxSizing:'border-box'
  }

  return (
    <>
      {/* Container principal — pointer-events none para não bloquear nada */}
      <div style={{
        position:'fixed', bottom:28, right:28, zIndex:9999,
        display:'flex', flexDirection:'column', alignItems:'flex-end', gap:12,
        pointerEvents:'none'
      }}>

        {/* Balãozinho de boas-vindas */}
        {showBalloon && !menuOpen && !chatOpen && !formOpen && (
          <div style={{
            background: '#0a0f1e',
            border: '1px solid rgba(201,168,76,0.4)',
            borderRadius: '16px 16px 4px 16px',
            padding: '14px 18px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            maxWidth: 240,
            animation: 'sofiaFadeIn 0.4s ease',
            position: 'relative',
            pointerEvents:'auto',
          }}>
            <button onClick={() => { setShowBalloon(false); setBalloonDismissed(true) }} style={{
              position:'absolute', top:6, right:10,
              background:'none', border:'none', color:'#6b7280',
              fontSize:14, cursor:'pointer', lineHeight:1,
              pointerEvents:'auto'
            }}>✕</button>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', border:'1.5px solid #c9a84c', overflow:'hidden', flexShrink:0 }}>
                {sofiaFace}
              </div>
              <span style={{ color:'#e8c97a', fontFamily:'Arial', fontSize:13, fontWeight:600 }}>Sofia • Consultora IA</span>
            </div>
            <p style={{ color:'#f0ece4', fontFamily:'Arial', fontSize:13, lineHeight:1.5, margin:0 }}>
              Olá! Sou a Sofia 👋<br/>Posso te ajudar a encontrar o imóvel ideal?
            </p>
            <button onClick={() => { setShowBalloon(false); setBalloonDismissed(true); setMenuOpen(true) }} style={{
              marginTop:10, width:'100%', padding:'8px',
              background:'linear-gradient(135deg,#c9a84c,#b8913e)',
              color:'#0a0f1e', border:'none', borderRadius:8,
              fontFamily:'Arial', fontSize:13, fontWeight:600, cursor:'pointer',
              pointerEvents:'auto'
            }}>
              Sim, quero ajuda! ✦
            </button>
          </div>
        )}

        {/* Menu de ações */}
        {menuOpen && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10, pointerEvents:'auto' }}>
            <button onClick={() => { setChatOpen(true); setMenuOpen(false) }} style={actionStyle('#1a2235','#0f172a','1px solid #c9a84c','#e8c97a')}>
              <span>🤖</span> Sofia – Buscar Imóvel
            </button>
            <a href="https://wa.me/5511976661297?text=Olá! Vim pelo site ImobiliáriaPerto e gostaria de mais informações."
               target="_blank" rel="noreferrer" style={actionStyle('#25d366','#128c3e','none','white')}>
              <span>💬</span> WhatsApp
            </a>
            <button onClick={() => { setFormOpen(true); setMenuOpen(false) }} style={actionStyle('#3b82f6','#1d4ed8','none','white')}>
              <span>📋</span> Fale Conosco
            </button>
          </div>
        )}

        {/* Botão principal Sofia */}
        <button onClick={handleToggle} style={{
          width:60, height:60, borderRadius:'50%',
          background:'linear-gradient(135deg,#c9a84c,#b8913e)',
          border:'none', cursor:'pointer',
          boxShadow:'0 4px 24px rgba(201,168,76,0.5)',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'transform 0.2s',
          position:'relative',
          pointerEvents:'auto'
        }}>
          {(chatOpen || formOpen) ? <span style={{fontSize:22,color:'#0a0f1e'}}>✕</span> : sofiaFace}
          <div style={{
            position:'absolute', top:2, right:2,
            width:13, height:13, background:'#22c55e',
            borderRadius:'50%', border:'2px solid white'
          }}/>
        </button>
      </div>

      {/* iframe chatbot — só monta no DOM quando aberto */}
      {chatOpen && (
        <iframe
          src="https://imobiliaria-agente2.vercel.app"
          style={{
            position:'fixed', bottom:104, right:28,
            width:420, height:600,
            borderRadius:20, border:'none',
            boxShadow:'0 8px 48px rgba(0,0,0,0.35)',
            zIndex:9998,
            pointerEvents:'auto'
          }}
        />
      )}

      {/* Formulário de lead — só monta no DOM quando aberto */}
      {formOpen && (
        <div style={{
          position:'fixed', bottom:104, right:28,
          width:400, borderRadius:20,
          background:'#0a0f1e', border:'1px solid rgba(201,168,76,0.2)',
          boxShadow:'0 8px 48px rgba(0,0,0,0.35)',
          zIndex:9998, padding:28, fontFamily:'Arial',
          pointerEvents:'auto'
        }}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h3 style={{color:'#e8c97a',margin:0,fontSize:18}}>📋 Fale Conosco</h3>
            <button onClick={() => setFormOpen(false)} style={{background:'none',border:'none',color:'#6b7280',fontSize:20,cursor:'pointer'}}>✕</button>
          </div>
          <p style={{color:'#6b7280',fontSize:13,marginBottom:20,lineHeight:1.5}}>
            Deixe seus dados e um consultor entrará em contato em breve.
          </p>
          {enviado ? (
            <div style={{textAlign:'center',padding:'20px 0'}}>
              <div style={{fontSize:48,marginBottom:12}}>✅</div>
              <h4 style={{color:'#e8c97a',marginBottom:8}}>Recebemos seu contato!</h4>
              <p style={{color:'#6b7280',fontSize:14}}>Nosso consultor entrará em contato em breve pelo WhatsApp ou e-mail.</p>
            </div>
          ) : (
            <div>
              {(['nome','email','telefone','mensagem'] as const).map((field, i) => (
                field === 'mensagem' ? (
                  <textarea key={field} placeholder="Qual imóvel te interessa? (opcional)"
                    value={leadForm[field]}
                    onChange={e => setLeadForm(f => ({...f,[field]:e.target.value}))}
                    rows={2} style={inputStyle}/>
                ) : (
                  <input key={field} type={field==='email'?'email':field==='telefone'?'tel':'text'}
                    placeholder={['Seu nome completo','Seu e-mail','WhatsApp / Telefone',''][i]}
                    value={leadForm[field]}
                    onChange={e => setLeadForm(f => ({...f,[field]:e.target.value}))}
                    required={field!=='mensagem'} style={inputStyle}/>
                )
              ))}
              <button onClick={enviarLead} disabled={enviando} style={{
                width:'100%', padding:14,
                background:'linear-gradient(135deg,#c9a84c,#b8913e)',
                color:'#0a0f1e', border:'none', borderRadius:10,
                fontSize:15, fontWeight:600, cursor:'pointer', marginTop:4,
                pointerEvents:'auto'
              }}>
                {enviando ? 'Enviando...' : '✦ Quero ser contactado'}
              </button>
            </div>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
  @keyframes sofiaFadeIn {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @media (max-width:480px) {
    iframe[src*="imobiliaria-agente2"] {
      width:100vw!important; height:100vh!important;
      bottom:0!important; right:0!important; border-radius:0!important;
    }
  }
` }} />
    </>
  )
}
