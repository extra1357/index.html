import Link from 'next/link';

export default function SemPermissaoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
        <p className="text-gray-600 mb-6">
          Você não tem as permissões necessárias para acessar este painel administrativo.
        </p>
        <Link 
          href="/admin/login" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
        >
          Voltar para o Login
        </Link>
      </div>
    </div>
  );
}
