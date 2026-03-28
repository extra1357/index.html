'use client'

import { useRouter } from 'next/navigation'
import GaleriaImovel from './GaleriaImovel'
import { ArrowLeft, MessageCircle, Calendar } from 'lucide-react'

interface Imovel {
  id: string
  type: string
  title: string
  addr: string
  price: number
  imagens: string[]
  description: string | null
  quartos: number
  banheiros: number
  garagem: number
  metragem: number
  finalidade: string
  destaque: boolean
  slug?: string | null
  codigo?: string | null
}

interface ImovelDetalhesProps {
  imovel: Imovel
}

export default function ImovelDetalhes({ imovel }: ImovelDetalhesProps) {
  const router = useRouter()

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      
      <GaleriaImovel 
        imagens={imovel.imagens} 
        titulo={imovel.title}
        endereco={imovel.addr}
        quartos={imovel.quartos}
        banheiros={imovel.banheiros}
        garagem={imovel.garagem}
        metragem={imovel.metragem}
        preco={imovel.price}
        finalidade={imovel.finalidade}
      />

      {imovel.description && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded"></span>
            Sobre o Imóvel
          </h2>
          <div className="prose prose-gray max-w-none">
            {imovel.description.split('\n').map((paragrafo, index) => {
              const textoLimpo = paragrafo.trim()
              if (!textoLimpo) return null
              
              return (
                <p key={index} className="text-gray-700 leading-relaxed mb-4 text-justify">
                  {textoLimpo}
                </p>
              )
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-blue-600 rounded"></span>
          Informações Adicionais
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 font-medium">Tipo:</span>
            <span className="text-gray-900 font-semibold">{imovel.type}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 font-medium">Finalidade:</span>
            <span className="text-gray-900 font-semibold capitalize">{imovel.finalidade}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 font-medium">Destaque:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              imovel.destaque 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-200 text-gray-700'
            }`}>
              {imovel.destaque ? 'Sim' : 'Não'}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 font-medium">Código:</span>
            <span className="text-gray-900 font-mono font-semibold">{imovel.id.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* BOTÕES COLORIDOS - IDENTIDADE VISUAL */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Botão Voltar - Cinza */}
          <button
            onClick={() => router.back()}
            className="group flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-xl font-bold text-white transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:scale-105"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            <span className="text-lg">Voltar</span>
          </button>
          
          {/* Botão WhatsApp - Verde */}
          <button
            onClick={() => {
              const mensagem = `Olá! Tenho interesse no imóvel: ${imovel.title} - ${imovel.addr}. Código: ${imovel.id.slice(0, 8).toUpperCase()}`
              const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(mensagem)}`
              window.open(whatsappUrl, '_blank')
            }}
            className="group flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl font-bold text-white transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:scale-105"
          >
            <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="text-lg">Contato WhatsApp</span>
          </button>
          
          {/* Botão Agendar - Azul */}
          <button
            onClick={() => {
              const mensagem = `Olá! Gostaria de agendar uma visita ao imóvel: ${imovel.title}. Código: ${imovel.id.slice(0, 8).toUpperCase()}`
              const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(mensagem)}`
              window.open(whatsappUrl, '_blank')
            }}
            className="group flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl font-bold text-white transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:scale-105"
          >
            <Calendar className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-lg">Agendar Visita</span>
          </button>
        </div>

        {/* Rodapé */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            💬 <span className="font-semibold text-gray-800">Atendimento rápido pelo WhatsApp</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">Respondemos em minutos • Sem compromisso</p>
        </div>
      </div>
    </div>
  )
}
