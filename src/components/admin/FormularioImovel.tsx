'use client';

import { useState } from 'react';
import { compressImage } from '@/lib/compressImage';

export default function FormularioImovel() {
  const [loading, setLoading] = useState(false);
  const [imagensBase64, setImagensBase64] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    tipo: '',
    endereco: '',
    cidade: '',
    estado: '',
    preco: '',
    metragem: '',
    quartos: '',
    banheiros: '',
    vagas: '',
    descricao: '',
    proprietarioId: '', // Preencher com ID do proprietário selecionado
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔥 1. Intercepta o Input de Arquivos e COMPRIME antes de transformar em Base64
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files);
    const novasImagens: string[] = [];

    setLoading(true);

    for (const file of filesArray) {
      try {
        // Reduz a imagem para max 1280px de largura e 70% de qualidade
        const compressedFile = await compressImage(file, 1280, 0.7);

        // Converte o arquivo leve para Base64 para mandar no JSON
        const base64 = await fileToBase64(compressedFile);
        novasImagens.push(base64);
      } catch (error) {
        console.error('Erro ao comprimir imagem:', error);
      }
    }

    setImagensBase64((prev) => [...prev, ...novasImagens]);
    setLoading(false);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // 🚀 2. Submete o JSON leve para a rota POST que você mandou
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        imagens: imagensBase64, // Array de strings base64 comprimidas
      };

      const res = await fetch('/api/imoveis/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.error || 'Erro ao cadastrar imóvel');
      }

      alert('Imóvel cadastrado com sucesso!');
      // Limpar form...
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Cadastrar Imóvel</h2>

      <div className="grid grid-cols-2 gap-4">
        <input type="text" name="tipo" placeholder="Tipo (ex: Casa)" onChange={handleChange} required className="border p-2 rounded" />
        <input type="text" name="cidade" placeholder="Cidade" onChange={handleChange} required className="border p-2 rounded" />
      </div>

      <input type="text" name="endereco" placeholder="Endereço Completo (Rua, Bairro...)" onChange={handleChange} required className="border p-2 w-full rounded" />

      <div className="grid grid-cols-3 gap-4">
        <input type="text" name="estado" placeholder="Estado (SP)" onChange={handleChange} required className="border p-2 rounded" />
        <input type="number" name="preco" placeholder="Preço" onChange={handleChange} required className="border p-2 rounded" />
        <input type="number" name="metragem" placeholder="Metragem" onChange={handleChange} required className="border p-2 rounded" />
      </div>

      <input type="text" name="proprietarioId" placeholder="ID do Proprietário" onChange={handleChange} required className="border p-2 w-full rounded" />

      {/* Input de Imagens */}
      <div className="border-2 border-dashed border-gray-300 p-4 rounded text-center">
        <label className="block mb-2 font-medium">Fotos do Imóvel</label>
        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
      </div>

      {/* Preview de Imagens Miniaturas */}
      {imagensBase64.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {imagensBase64.map((img, idx) => (
            <img key={idx} src={img} alt="Imóvel preview" className="h-20 w-full object-cover rounded" />
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Processando e Enviando...' : 'Cadastrar Imóvel'}
      </button>
    </form>
  );
}
