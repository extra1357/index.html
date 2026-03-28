'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiService } from '@/lib/api-service'

export default function NovoLead() {
  const router = useRouter()
  const [form, setForm] = useState({ 
    nome: '', 
    email: '', 
    telefone: '', 
    origem: 'site' 
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ✅ LÓGICA DE ENVIO ORIGINAL PRESERVADA
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    
    setIsSubmitting(true)

    try {
      await apiService.post('/api/leads', form)
      
      console.log('✅ Lead salvo com sucesso no PostgreSQL!')
      router.push('/admin/leads')
      router.refresh()
    } catch (error: any) {
      console.error('❌ Erro ao salvar:', error.message)
      alert('Falha ao salvar: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-6 sm:p-12 font-sans antialiased text-slate-900">
      {/* Botão Superior STR */}
      <div className="max-w-3xl mx-auto mb-10 flex justify-between items-center">
        <Link href="/admin/leads" className="font-black text-xs uppercase tracking-[0.3em] bg-slate-900 text-white px-6 py-2 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]">
          ← Cancelar Operação
        </Link>
        <span className="font-black text-[10px] text-slate-400 uppercase tracking-[0.5em]">STR_MODULE: LEAD_ENTRY</span>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white border-[3px] border-slate-900 shadow-[15px_15px_0px_0px_rgba(15,23,42,0.1)] overflow-hidden">
          {/* Header do Formulário */}
          <div className="bg-slate-900 p-8 border-b-[3px] border-slate-900">
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
              Novo <span className="text-blue-500">Lead</span>
            </h1>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">
              Entrada Manual via Pipeline PostgreSQL
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            {/* Nome Completo */}
            <div className="group">
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Nome Completo</label>
              <input 
                className="w-full bg-slate-50 p-5 border-[3px] border-slate-900 font-bold text-black outline-none focus:bg-blue-50 focus:border-blue-600 transition-all text-lg uppercase italic"
                placeholder="EX: EDSON STR"
                value={form.nome}
                onChange={e => setForm({...form, nome: e.target.value})}
                required
              />
            </div>

            {/* Grid E-mail e Telefone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">E-mail de Contato</label>
                <input 
                  type="email"
                  className="w-full bg-slate-50 p-5 border-[3px] border-slate-900 font-bold text-black outline-none focus:bg-blue-50 focus:border-blue-600 transition-all text-lg"
                  placeholder="contato@exemplo.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Telefone / WhatsApp</label>
                <input 
                  className="w-full bg-slate-50 p-5 border-[3px] border-slate-900 font-black text-black outline-none focus:bg-blue-50 focus:border-blue-600 transition-all text-lg"
                  placeholder="(00) 00000-0000"
                  value={form.telefone}
                  onChange={e => setForm({...form, telefone: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Origem */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Origem do Contato</label>
              <div className="relative">
                <select 
                  className="w-full bg-slate-50 p-5 border-[3px] border-slate-900 font-black text-black outline-none focus:bg-blue-50 appearance-none uppercase italic text-lg"
                  value={form.origem}
                  onChange={e => setForm({...form, origem: e.target.value})}
                >
                  <option value="site">Site Institucional STR</option>
                  <option value="redes-sociais">Campanha Redes Sociais</option>
                  <option value="indicacao">Indicação Direta</option>
                  <option value="whatsapp">Tráfego WhatsApp</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none font-black">
                  ▼
                </div>
              </div>
            </div>

            {/* Botão de Ação STR */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-6 border-[3px] border-slate-900 font-black text-2xl uppercase italic tracking-tighter shadow-[10px_10px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-4 ${
                isSubmitting ? 'bg-slate-300 text-slate-500 border-slate-300 shadow-none' : 'bg-blue-600 text-white'
              }`}
            >
              {isSubmitting ? (
                <>⏳ PROCESSANDO_DATABASE...</>
              ) : (
                <>🚀 CRIAR LEAD AGORA</>
              )}
            </button>
          </form>
        </div>

        {/* Info de Rodapé */}
        <p className="mt-8 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">
          Data_Protection_Mode: Active / PostgreSQL_v15
        </p>
      </div>
    </div>
  )
}
