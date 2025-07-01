import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, setUser, logout } = useAuth() as any;
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: user?.nome || user?.name || '',
    email: user?.email || '',
    senha: '',
    cpf: user?.cpf || '',
    cnpj: user?.cnpj || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return (
    <div className="container py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        Faça login para acessar seu perfil.
      </div>
    </div>
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          senha: form.senha || undefined,
          cpf: form.cpf,
          cnpj: form.cnpj,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser && setUser(data.user);
        setSuccess('Dados atualizados com sucesso!');
      } else {
        setError(data.error || 'Erro ao atualizar perfil.');
      }
    } catch {
      setError('Erro de conexão.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-semibold mb-6 text-center">Meu Perfil</h1>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center">{success}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
            <input id="nome" name="nome" value={form.nome} onChange={handleChange} className="input" placeholder="Nome" />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input id="email" name="email" value={form.email} onChange={handleChange} className="input" placeholder="E-mail" />
          </div>
          <div className="mb-4">
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
            <input id="senha" name="senha" value={form.senha} onChange={handleChange} className="input" placeholder="Nova senha" type="password" />
          </div>
          <div className="mb-4">
            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
            <input id="cpf" name="cpf" value={form.cpf} onChange={handleChange} className="input" placeholder="CPF" />
          </div>
          <div className="mb-6">
            <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
            <input id="cnpj" name="cnpj" value={form.cnpj} onChange={handleChange} className="input" placeholder="CNPJ" />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? 'Salvando...' : 'Salvar alterações'}</button>
        </form>
        <button onClick={handleLogout} className="btn btn-outline w-full mt-6">Sair da conta</button>
      </div>
    </div>
  );
};

export default ProfilePage;
