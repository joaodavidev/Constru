import React, { useState } from 'react';
import { API_BASE_URL } from '../api';
import { useNavigate } from 'react-router-dom';

export default function CreateProductPage() {
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    categoria_id: '',
    preco: '',
    estoque: '',
    endereco_id: '',
    imagem: null as File | null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, imagem: e.target.files?.[0] || null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nome', form.nome);
      formData.append('descricao', form.descricao);
      formData.append('categoria_id', form.categoria_id);
      formData.append('preco', form.preco);
      formData.append('estoque', form.estoque);
      formData.append('endereco_id', form.endereco_id);
      if (form.imagem) formData.append('imagem', form.imagem);
      const res = await fetch(`${API_BASE_URL}/produtos`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erro ao criar produto');
        setLoading(false);
        return;
      }
      navigate('/produtos');
    } catch {
      setError('Erro ao criar produto');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h2 className="text-xl font-bold mb-4">Criar Produto</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome" className="w-full border p-2" required />
        <textarea name="descricao" value={form.descricao} onChange={handleChange} placeholder="Descrição" className="w-full border p-2" required />
        <input name="categoria_id" value={form.categoria_id} onChange={handleChange} placeholder="ID da Categoria" className="w-full border p-2" required />
        <input name="preco" value={form.preco} onChange={handleChange} placeholder="Preço" type="number" className="w-full border p-2" required />
        <input name="estoque" value={form.estoque} onChange={handleChange} placeholder="Estoque" type="number" className="w-full border p-2" required />
        <input name="endereco_id" value={form.endereco_id} onChange={handleChange} placeholder="ID do Endereço" className="w-full border p-2" required />
        <input name="imagem" type="file" accept="image/*" onChange={handleFile} className="w-full" />
        {error && <div className="text-red-600">{error}</div>}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? 'Criando...' : 'Criar Produto'}
        </button>
      </form>
    </div>
  );
}
