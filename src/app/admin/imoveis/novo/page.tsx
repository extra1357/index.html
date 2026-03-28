import AdminLayout from '@/components/admin/AdminLayout';
import FormularioImovelProfissional from '@/components/admin/FormularioImovelProfissional';

export const metadata = {
  title: 'Novo Imóvel | Painel STR Imobiliária',
};

export default function NovoImovelPage() {
  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-950">Cadastrar Novo Imóvel</h2>
          <p className="text-gray-600 mt-1">Preencha as informações abaixo para disponibilizar o imóvel no sistema.</p>
        </div>
        <a 
            href="/admin/imoveis"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 flex items-center gap-1.5"
        >
            ⬅️ Voltar para Lista
        </a>
      </div>

      <FormularioImovelProfissional />
    </AdminLayout>
  );
}
