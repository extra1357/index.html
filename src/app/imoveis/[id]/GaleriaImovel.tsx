'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Bed, Bath, Car, Maximize2, MapPin } from 'lucide-react'
import styles from './imovel.module.css'

interface GaleriaImovelProps {
  imagens: string[]
  titulo: string
  endereco?: string
  quartos?: number
  banheiros?: number
  garagem?: number
  metragem?: number
  preco?: number
  finalidade?: string
}

export default function GaleriaImovel({
  imagens,
  titulo,
  endereco,
  quartos,
  banheiros,
  garagem,
  metragem,
  preco,
  finalidade
}: GaleriaImovelProps) {
  const [imagemAtual, setImagemAtual] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  if (!imagens || imagens.length === 0) {
    return (
      <div className="bg-gray-100 p-8 text-center rounded-lg">
        <p className="text-gray-500">Nenhuma imagem disponivel</p>
      </div>
    )
  }

  const proximaImagem = () => setImagemAtual((prev) => (prev + 1) % imagens.length)
  const imagemAnterior = () => setImagemAtual((prev) => (prev - 1 + imagens.length) % imagens.length)
  const irParaImagem = (index: number) => setImagemAtual(index)

  const isBase64 = (src: string) => src.startsWith('data:')

  return (
    <div className="space-y-6">
      {/* Carrossel Principal */}
      <div
        className={`${styles.carrosselContainer} group shadow-xl`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isBase64(imagens[imagemAtual]) ? (
          <img
            src={imagens[imagemAtual]}
            alt={`${titulo} - Imagem ${imagemAtual + 1}`}
            className={styles.carrosselImagem}
          />
        ) : (
          <Image
            src={imagens[imagemAtual]}
            alt={`${titulo} - Imagem ${imagemAtual + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            style={{ objectFit: 'contain' }}
            priority={imagemAtual === 0}
          />
        )}

        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm z-10">
          {imagemAtual + 1} / {imagens.length}
        </div>

        {finalidade && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold uppercase backdrop-blur-sm shadow-lg z-10">
            {finalidade}
          </div>
        )}

        {imagens.length > 1 && (
          <>
            <button
              onClick={imagemAnterior}
              className={`${styles.btnCarrossel} ${styles.btnAnterior} ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={proximaImagem}
              className={`${styles.btnCarrossel} ${styles.btnProximo} ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              aria-label="Proxima imagem"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {imagens.length > 1 && (
          <div className={styles.indicadores}>
            {imagens.map((_, index) => (
              <button
                key={index}
                onClick={() => irParaImagem(index)}
                className={`${styles.indicador} ${index === imagemAtual ? styles.indicadorAtivo : ''}`}
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card de Informacoes */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{titulo}</h1>
          {endereco && (
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-5 h-5 flex-shrink-0 text-red-500" />
              <p className="text-base md:text-lg font-medium">{endereco}</p>
            </div>
          )}
        </div>

        {preco !== undefined && (
          <div className="mb-8">
            <p className="text-sm text-gray-600 mb-2 font-semibold uppercase tracking-wide">Valor</p>
            <p className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              R$ {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(preco)}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
          {quartos !== undefined && (
            <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg mb-3">
                <Bed className="w-7 h-7 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{quartos}</p>
              <p className="text-sm text-gray-600 font-semibold">Quartos</p>
            </div>
          )}
          {banheiros !== undefined && (
            <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-4 rounded-xl shadow-lg mb-3">
                <Bath className="w-7 h-7 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{banheiros}</p>
              <p className="text-sm text-gray-600 font-semibold">Banheiros</p>
            </div>
          )}
          {garagem !== undefined && (
            <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl shadow-lg mb-3">
                <Car className="w-7 h-7 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{garagem}</p>
              <p className="text-sm text-gray-600 font-semibold">Garagem</p>
            </div>
          )}
          {metragem !== undefined && (
            <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-xl shadow-lg mb-3">
                <Maximize2 className="w-7 h-7 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{metragem}</p>
              <p className="text-sm text-gray-600 font-semibold">m² Area</p>
            </div>
          )}
        </div>
      </div>

      {/* Miniaturas */}
      {imagens.length > 1 && (
        <div className={styles.gridMiniaturas}>
          {imagens.map((img, idx) => (
            <button
              key={idx}
              onClick={() => irParaImagem(idx)}
              className="relative"
              style={{ height: '80px' }}
            >
              {isBase64(img) ? (
                <img
                  src={img}
                  alt={`${titulo} - Miniatura ${idx + 1}`}
                  className={`${styles.miniatura} ${idx === imagemAtual ? styles.miniaturaAtiva : ''}`}
                />
              ) : (
                <Image
                  src={img}
                  alt={`${titulo} - Miniatura ${idx + 1}`}
                  fill
                  sizes="120px"
                  style={{ objectFit: 'cover', borderRadius: '6px' }}
                  className={idx === imagemAtual ? styles.miniaturaAtiva : ''}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
