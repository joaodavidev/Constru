import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    senha_atual: '',
    nova_senha: '',
    confirmar_senha: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validações
    if (formData.nova_senha !== formData.confirmar_senha) {
      toast.error('As senhas não coincidem');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/usuarios/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha_atual: formData.senha_atual || undefined,
          nova_senha: formData.nova_senha || undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      updateUser(data.user);
      toast.success('Perfil atualizado com sucesso!');
      
      // Limpa campos de senha
      setFormData(prev => ({
        ...prev,
        senha_atual: '',
        nova_senha: '',
        confirmar_senha: ''
      }));
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logout realizado com sucesso!');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-6">Seu Perfil</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <h2 className="text-lg font-medium mb-4">Alterar Senha</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Senha Atual</label>
                <input
                  type="password"
                  name="senha_atual"
                  value={formData.senha_atual}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
                <input
                  type="password"
                  name="nova_senha"
                  value={formData.nova_senha}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                <input
                  type="password"
                  name="confirmar_senha"
                  value={formData.confirmar_senha}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-outline-danger w-full"
            >
              Sair da Conta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
