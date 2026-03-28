'use client';
export const dynamic = 'force-dynamic';


import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Componente interno que usa useSearchParams
function RedefinirSenhaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [validando, setValidando] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  
  const [formData, setFormData] = useState({
    novaSenha: '',
    confirmarSenha: ''
  });

  useEffect(() => {
    if (!token) {
      setErro('Token não fornecido');
      setValidando(false);
      return;
    }
    validarToken();
  }, [token]);

  const validarToken = async () => {
    try {
      const response = await fetch(`/api/auth/redefinir-senha?token=${token}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Token inválido');
      }
      setTokenValido(data.valid);
      setUsuario(data.usuario);
    } catch (err: any) {
      setErro(err.message || 'Token inválido ou expirado');
      setTokenValido(false);
    } finally {
      setValidando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (formData.novaSenha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    if (formData.novaSenha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/redefinir-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, novaSenha: formData.novaSenha })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao redefinir senha');
      }
      setSucesso(data.message);
      setTimeout(() => router.push('/admin/login'), 2000);
    } catch (err: any) {
      setErro(err.message || 'Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  if (validando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validando token...</p>
        </div>
      </div>
    );
  }

  if (!tokenValido) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4 text-red-600">Token Inválido</h1>
          <p className="text-gray-600 mb-6">{erro}</p>
          <div className="space-y-3">
            <Link href="/admin/esqueci-senha" className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Solicitar novo reset
            </Link>
            <Link href="/admin/login" className="block w-full text-blue-600 hover:text-blue-700 font-medium">
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="text-3xl font-bold mb-2">Nova Senha</h1>
          {usuario && (
            <p className="text-gray-600 text-sm">
              Olá, <strong>{usuario.nome}</strong>! <br />
              Defina sua nova senha
            </p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Nova Senha</label>
            <input type="password" value={formData.novaSenha} onChange={(e: any) => setFormData({ ...formData, novaSenha: e.target.value })} required minLength={6} placeholder="Mínimo 6 caracteres" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" disabled={loading || !!sucesso} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Confirmar Senha</label>
            <input type="password" value={formData.confirmarSenha} onChange={(e: any) => setFormData({ ...formData, confirmarSenha: e.target.value })} required minLength={6} placeholder="Digite a senha novamente" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" disabled={loading || !!sucesso} />
          </div>
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              ❌ {erro}
            </div>
          )}
          {sucesso && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              ✅ {sucesso}
              <p className="mt-2 text-xs">Redirecionando para o login...</p>
            </div>
          )}
          <button type="submit" disabled={loading || !!sucesso} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading ? 'Salvando...' : sucesso ? 'Senha Alterada!' : 'Redefinir Senha'}
          </button>
          {!sucesso && (
            <div className="text-center">
              <Link href="/admin/login" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                ← Voltar para o login
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <RedefinirSenhaContent />
    </Suspense>
  );
}
