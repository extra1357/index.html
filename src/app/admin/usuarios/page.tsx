"use client";

export const dynamic = 'force-dynamic';


import React, { useState, useEffect } from 'react';

// Tipos
type RoleType = 'SUPER_ADMIN' | 'ADMIN' | 'GERENTE' | 'CORRETOR' | 'ASSISTENTE' | 'VISUALIZADOR';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: RoleType;
  ativo: boolean;
  ultimoLogin: Date | null;
  corretor: { id: string; nome: string } | null;
}

interface Corretor {
  id: string;
  nome: string;
  creci: string;
}

// Simulando importação das permissões
const ROLE_DESCRIPTIONS: Record<RoleType, string> = {
  SUPER_ADMIN: 'Acesso total ao sistema - Dono/Proprietário',
  ADMIN: 'Gerente Geral - Gestão completa exceto configurações críticas',
  GERENTE: 'Gerente de Equipe - Foco em vendas e leads',
  CORRETOR: 'Corretor - Acesso apenas aos seus leads e vendas',
  ASSISTENTE: 'Assistente Administrativo - Cadastros e consultas',
  VISUALIZADOR: 'Apenas leitura - Relatórios e consultas'
};

const ROLE_HIERARCHY: Record<RoleType, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  GERENTE: 60,
  CORRETOR: 40,
  ASSISTENTE: 20,
  VISUALIZADOR: 10
};

const ROLE_PERMISSIONS: Record<RoleType, string[]> = {
  SUPER_ADMIN: ['usuarios.criar', 'usuarios.editar', 'usuarios.deletar', 'usuarios.visualizar', 'usuarios.gerenciar_permissoes', 'imoveis.criar', 'imoveis.editar', 'imoveis.deletar', 'vendas.aprovar', 'comissoes.pagar', 'sistema.configuracoes'],
  ADMIN: ['usuarios.criar', 'usuarios.editar', 'usuarios.visualizar', 'imoveis.criar', 'imoveis.editar', 'vendas.aprovar', 'comissoes.aprovar', 'relatorios.financeiros'],
  GERENTE: ['leads.visualizar_todos', 'vendas.visualizar_todas', 'leads.atribuir', 'relatorios.gerar'],
  CORRETOR: ['leads.criar', 'leads.editar', 'leads.visualizar', 'vendas.criar', 'consultas.criar', 'comissoes.visualizar'],
  ASSISTENTE: ['imoveis.criar', 'leads.criar', 'proprietarios.criar', 'consultas.criar'],
  VISUALIZADOR: ['imoveis.visualizar', 'leads.visualizar', 'relatorios.visualizar']
};

function canManageUser(managerRole: RoleType, targetRole: RoleType): boolean {
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
}

function getRoleBadgeColor(role: RoleType): string {
  const colors: Record<RoleType, string> = {
    SUPER_ADMIN: 'bg-purple-600',
    ADMIN: 'bg-red-600',
    GERENTE: 'bg-blue-600',
    CORRETOR: 'bg-green-600',
    ASSISTENTE: 'bg-yellow-600',
    VISUALIZADOR: 'bg-gray-600'
  };
  return colors[role] || 'bg-gray-600';
}

function getRoleIcon(role: RoleType): string {
  const icons: Record<RoleType, string> = {
    SUPER_ADMIN: '👑',
    ADMIN: '⚡',
    GERENTE: '📊',
    CORRETOR: '🤝',
    ASSISTENTE: '📝',
    VISUALIZADOR: '👁️'
  };
  return icons[role] || '👤';
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [viewPermissions, setViewPermissions] = useState<RoleType | null>(null);
  
  const currentUserRole: RoleType = 'ADMIN';
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    role: 'VISUALIZADOR' as RoleType,
    corretorId: '',
    ativo: true
  });

  useEffect(() => {
    fetchUsuarios();
    fetchCorretores();
  }, []);

  async function fetchUsuarios() {
    try {
      const response = await fetch('/api/usuarios');
      const data = await response.json();
      
      if (data.success) {
        setUsuarios(data.usuarios);
      } else {
        console.error('Erro ao buscar usuários:', data.error);
      }
    } catch (e: any) {
      console.error('Erro na requisição:', e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCorretores() {
    try {
      const response = await fetch('/api/corretores');
      const data = await response.json();
      
      if (data.success) {
        setCorretores(data.corretores || []);
      }
    } catch (e: any) {
      console.error('Erro ao buscar corretores:', e);
    }
  }

  function handleEdit(user: Usuario) {
    if (!canManageUser(currentUserRole, user.role)) {
      alert('Você não tem permissão para editar este usuário');
      return;
    }
    
    setEditingUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      senha: '',
      confirmarSenha: '',
      role: user.role,
      corretorId: user.corretor?.id || '',
      ativo: user.ativo
    });
    setShowModal(true);
  }

  function handleNew() {
    setEditingUser(null);
    setFormData({
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      role: 'VISUALIZADOR',
      corretorId: '',
      ativo: true
    });
    setShowModal(true);
  }

  async function handleSubmit() {
    if (!formData.nome || !formData.email) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    
    if (!editingUser && !formData.senha) {
      alert('Senha é obrigatória para novo usuário');
      return;
    }
    
    if (formData.senha && formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem');
      return;
    }
    
    if (!canManageUser(currentUserRole, formData.role)) {
      alert('Você não pode criar usuário com este nível de acesso');
      return;
    }
    
    try {
      const url = editingUser ? `/api/usuarios/${editingUser.id}` : '/api/usuarios';
      const method = editingUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message || 'Usuário salvo com sucesso!');
        setShowModal(false);
        fetchUsuarios();
      } else {
        alert(data.error || 'Erro ao salvar usuário');
      }
    } catch (e: any) {
      alert('Erro ao salvar usuário: ' + e.message);
    }
  }

  async function handleToggleStatus(userId: string, currentStatus: boolean) {
    if (!confirm(`Deseja ${currentStatus ? 'desativar' : 'ativar'} este usuário?`)) return;
    
    try {
      const response = await fetch(`/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !currentStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message || 'Status alterado com sucesso!');
        fetchUsuarios();
      } else {
        alert(data.error || 'Erro ao alterar status');
      }
    } catch (e: any) {
      alert('Erro ao alterar status: ' + e.message);
    }
  }

  const availableRoles = (Object.entries(ROLE_HIERARCHY) as [RoleType, number][])
    .filter(([role]) => canManageUser(currentUserRole, role))
    .sort((a, b) => b[1] - a[1]);

  if (loading) {
    return <div className="p-12 font-sans">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans p-12">
      <header className="flex justify-between items-start mb-12 border-l-[12px] border-purple-600 pl-8">
        <div>
          <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none text-slate-900">
            Gestão de <br />
            <span className="text-purple-600">Usuários</span>
          </h1>
          <p className="font-black text-slate-500 text-xs tracking-widest uppercase mt-4 italic">
            Controle de Acesso e Permissões
          </p>
        </div>
        <button 
          onClick={handleNew}
          className="bg-purple-600 text-white px-6 py-4 font-black rounded-sm hover:bg-purple-700 transition-all shadow-lg uppercase italic tracking-tighter text-sm"
        >
          + Novo Usuário
        </button>
      </header>

      {/* HIERARQUIA */}
      <section className="mb-8 bg-white border-[3px] border-slate-900 p-6 shadow-xl rounded-lg">
        <h3 className="font-black uppercase italic tracking-tighter text-lg mb-4">🔐 Hierarquia de Acesso</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(Object.entries(ROLE_HIERARCHY) as [RoleType, number][])
            .sort((a, b) => b[1] - a[1])
            .map(([role, level]) => (
              <div key={role} className="flex items-center gap-3 p-3 bg-slate-50 border-2 border-slate-200 rounded">
                <span className="text-2xl">{getRoleIcon(role)}</span>
                <div>
                  <p className="font-bold text-sm">{role.replace('_', ' ')}</p>
                  <p className="text-xs text-slate-500 uppercase">Nível {level}</p>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* TABELA */}
      <section className="bg-white border-[3px] border-slate-900 shadow-xl rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="p-4 text-left font-black uppercase text-xs tracking-wider">Usuário</th>
                <th className="p-4 text-left font-black uppercase text-xs tracking-wider">Email</th>
                <th className="p-4 text-left font-black uppercase text-xs tracking-wider">Nível</th>
                <th className="p-4 text-left font-black uppercase text-xs tracking-wider">Corretor</th>
                <th className="p-4 text-left font-black uppercase text-xs tracking-wider">Último Login</th>
                <th className="p-4 text-left font-black uppercase text-xs tracking-wider">Status</th>
                <th className="p-4 text-center font-black uppercase text-xs tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((user: any, idx: number) => (
                <tr key={user.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getRoleIcon(user.role)}</span>
                      <span className="font-bold">{user.nome}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{user.email}</td>
                  <td className="p-4">
                    <span className={`${getRoleBadgeColor(user.role)} text-white px-3 py-1 text-xs font-black uppercase rounded-full`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    {user.corretor ? (
                      <span className="text-green-600 font-bold">✓ {user.corretor.nome}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    {user.ultimoLogin ? new Date(user.ultimoLogin).toLocaleString('pt-BR') : 'Nunca'}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleStatus(user.id, user.ativo)}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                        user.ativo 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {user.ativo ? '✓ ATIVO' : '✗ INATIVO'}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setViewPermissions(user.role)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded hover:bg-blue-200 transition-colors"
                        title="Ver Permissões"
                      >
                        🔍
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        disabled={!canManageUser(currentUserRole, user.role)}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Editar"
                      >
                        ✏️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL CRIAR/EDITAR */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-slate-900">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase italic">
                {editingUser ? '✏️ Editar Usuário' : '➕ Novo Usuário'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-2xl hover:text-red-400 transition-colors">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block font-bold text-sm mb-2">Nome Completo *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e: any) => setFormData({...formData, nome: e.target.value})}
                  className="w-full p-3 border-2 border-slate-300 rounded focus:border-purple-600 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block font-bold text-sm mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e: any) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 border-2 border-slate-300 rounded focus:border-purple-600 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-sm mb-2">
                    {editingUser ? 'Nova Senha (vazio = manter)' : 'Senha *'}
                  </label>
                  <input
                    type="password"
                    value={formData.senha}
                    onChange={(e: any) => setFormData({...formData, senha: e.target.value})}
                    className="w-full p-3 border-2 border-slate-300 rounded focus:border-purple-600 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-bold text-sm mb-2">Confirmar Senha</label>
                  <input
                    type="password"
                    value={formData.confirmarSenha}
                    onChange={(e: any) => setFormData({...formData, confirmarSenha: e.target.value})}
                    className="w-full p-3 border-2 border-slate-300 rounded focus:border-purple-600 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-sm mb-2">Nível de Acesso *</label>
                <select
                  value={formData.role}
                  onChange={(e: any) => setFormData({...formData, role: e.target.value as RoleType})}
                  className="w-full p-3 border-2 border-slate-300 rounded focus:border-purple-600 outline-none transition-colors"
                >
                  {availableRoles.map(([role]) => (
                    <option key={role} value={role}>
                      {getRoleIcon(role)} {role.replace('_', ' ')} - {ROLE_DESCRIPTIONS[role]}
                    </option>
                  ))}
                </select>
              </div>

              {formData.role === 'CORRETOR' && (
                <div>
                  <label className="block font-bold text-sm mb-2">Vincular ao Corretor</label>
                  <select
                    value={formData.corretorId}
                    onChange={(e: any) => setFormData({...formData, corretorId: e.target.value})}
                    className="w-full p-3 border-2 border-slate-300 rounded focus:border-purple-600 outline-none transition-colors"
                  >
                    <option value="">Selecione um corretor...</option>
                    {corretores.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nome} - CRECI {c.creci}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-3 p-4 bg-slate-100 rounded">
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e: any) => setFormData({...formData, ativo: e.target.checked})}
                  className="w-5 h-5 cursor-pointer"
                />
                <label className="font-bold text-sm cursor-pointer">Usuário Ativo</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 font-bold rounded hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white font-bold rounded hover:bg-purple-700 transition-colors"
                >
                  {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PERMISSÕES */}
      {viewPermissions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-4 border-slate-900">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase italic">
                🔐 Permissões: {viewPermissions.replace('_', ' ')}
              </h2>
              <button onClick={() => setViewPermissions(null)} className="text-2xl hover:text-red-400 transition-colors">✕</button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4 font-medium">{ROLE_DESCRIPTIONS[viewPermissions]}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ROLE_PERMISSIONS[viewPermissions]?.map(perm => (
                  <div key={perm} className="flex items-center gap-2 p-3 bg-green-50 border-2 border-green-200 rounded">
                    <span className="text-green-600 font-bold text-lg">✓</span>
                    <span className="text-sm font-medium">{perm}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
