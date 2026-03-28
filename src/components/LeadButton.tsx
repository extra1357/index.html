'use client';

import { capturarLead } from '@/lib/lead';

export default function LeadButton({
  cidade,
  origem,
  texto = 'Falar no WhatsApp',
}: {
  cidade: string;
  origem: string;
  texto?: string;
}) {
  const handleClick = async () => {
    await capturarLead({
      origem,
      cidade,
      pagina: window.location.pathname,
    });

    window.open(
      `https://wa.me/5511976661297?text=Olá! Quero imóveis em ${cidade}`,
      '_blank'
    );
  };

  return (
    <button
      onClick={handleClick}
      className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
    >
      {texto}
    </button>
  );
}
