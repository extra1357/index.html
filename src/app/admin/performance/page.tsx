'use client';

import { useEffect, useState } from 'react';
import Container from '@/components/ui/Container';

export default function PerformancePage() {
  const [data, setData] = useState<any>(null);

  return (
    <Container title="📈 STR Performance Index" subtitle="Análise volumétrica e conversão do sistema">
      
      {/* GRID DE INDICADORES CHAVE (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-gray-900 p-6 rounded-2xl">
          <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">Taxa de Conversão</p>
          <p className="text-3xl font-black text-white">12.4%</p>
          <div className="w-full bg-gray-800 h-1 mt-4 rounded-full overflow-hidden">
             <div className="bg-blue-500 h-full w-[12.4%]"></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Valor em Negociação</p>
          <p className="text-3xl font-black text-gray-900">R$ 4.2M</p>
          <p className="text-green-500 text-[10px] font-bold mt-2">↑ 8% vs mês anterior</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Tempo Médio Resposta</p>
          <p className="text-3xl font-black text-gray-900">14min</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Leads Ativos</p>
          <p className="text-3xl font-black text-blue-600">87</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico Simulado de Volume Semanal */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 h-80 flex flex-col">
          <h3 className="text-xs font-black text-gray-900 uppercase mb-auto">Volume de Captura (7 dias)</h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {[40, 70, 45, 90, 65, 80, 50].map((h: any, i: number) => (
              <div key={i} className="bg-blue-600 w-full rounded-t-lg transition-all hover:bg-blue-400" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-400 uppercase">
            <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sab</span><span>Dom</span>
          </div>
        </div>

        {/* Maiores Interessados por Cidade */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200">
           <h3 className="text-xs font-black text-gray-900 uppercase mb-6">Demanda por Região</h3>
           <div className="space-y-4">
              {['São Paulo', 'Barueri', 'Santana de Parnaíba'].map((cidade: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold mb-1 uppercase">
                    <span>{cidade}</span>
                    <span>{100 - (i * 25)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full">
                    <div className="bg-gray-900 h-full rounded-full" style={{ width: `${100 - (i * 25)}%` }}></div>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>

    </Container>
  );
}
