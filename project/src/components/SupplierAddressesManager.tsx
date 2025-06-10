import React, { useState } from 'react';
import { Endereco } from '../types/supplier';

export default function SupplierAddressesManager({
  enderecos,
  onEnderecoCreated,
  onEnderecoDeleted,
  fornecedorId
}: {
  enderecos: Endereco[];
  onEnderecoCreated: (e: Endereco) => void;
  onEnderecoDeleted: (id: number) => void;
  fornecedorId: string | number;
}) {
  const [showModal, setShowModal] = useState(false);
  const [novoEndereco, setNovoEndereco] = useState({
    nome_endereco: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteInfo, setDeleteInfo] = useState<{ produtos: any[] } | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!novoEndereco.nome_endereco) {
      setError('O apelido do endereço é obrigatório.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/enderecos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...novoEndereco, usuario_id: fornecedorId })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erro ao cadastrar endereço');
        setLoading(false);
        return;
      }
      const data = await res.json();
      onEnderecoCreated(data);
      setNovoEndereco({ nome_endereco: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' });
      setShowModal(false);
      setError('');
    } catch {
      setError('Erro ao cadastrar endereço');
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    setDeleteError('');
    setDeleteInfo(null);
    setDeleteId(id);
    try {
      const res = await fetch(`http://localhost:3001/enderecos/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        if (data.produtos) {
          setDeleteInfo({ produtos: data.produtos });
        }
        setDeleteError(data.error || 'Erro ao remover endereço');
        return;
      }
      onEnderecoDeleted(id);
      setDeleteId(null);
    } catch {
      setDeleteError('Erro ao remover endereço');
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Seus endereços</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Novo endereço</button>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {enderecos.map(e => (
          <li key={e.id} className="bg-white rounded shadow p-4 flex flex-col">
            <div className="flex-1">
              <h3 className="font-semibold">{e.nome_endereco}</h3>
              <p className="text-sm text-gray-600">{e.rua}, {e.numero} {e.complemento && `- ${e.complemento}`}</p>
              <p className="text-sm text-gray-600">{e.bairro}, {e.cidade} - {e.estado}, {e.cep}</p>
            </div>
            <button className="btn btn-danger mt-4" onClick={() => handleDelete(e.id)}>Remover</button>
            {deleteId === e.id && deleteError && (
              <div className="mt-2 bg-red-100 text-red-700 p-2 rounded text-sm">
                {deleteError}
                {deleteInfo && deleteInfo.produtos.length > 0 && (
                  <ul className="mt-2 text-xs text-gray-700">
                    {deleteInfo.produtos.map(p => (
                      <li key={p.id}>• {p.nome}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      {/* Modal de novo endereço */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowModal(false)}>×</button>
            <h3 className="text-lg font-semibold mb-2">Cadastrar novo endereço</h3>
            <form onSubmit={handleCreate} className="space-y-2">
              <input className="input w-full" placeholder="Apelido (ex: Matriz)" value={novoEndereco.nome_endereco} onChange={e => setNovoEndereco({ ...novoEndereco, nome_endereco: e.target.value })} required />
              <input className="input w-full" placeholder="Rua" value={novoEndereco.rua} onChange={e => setNovoEndereco({ ...novoEndereco, rua: e.target.value })} />
              <input className="input w-full" placeholder="Número" value={novoEndereco.numero} onChange={e => setNovoEndereco({ ...novoEndereco, numero: e.target.value })} />
              <input className="input w-full" placeholder="Complemento" value={novoEndereco.complemento} onChange={e => setNovoEndereco({ ...novoEndereco, complemento: e.target.value })} />
              <input className="input w-full" placeholder="Bairro" value={novoEndereco.bairro} onChange={e => setNovoEndereco({ ...novoEndereco, bairro: e.target.value })} />
              <input className="input w-full" placeholder="Cidade" value={novoEndereco.cidade} onChange={e => setNovoEndereco({ ...novoEndereco, cidade: e.target.value })} />
              <input className="input w-full" placeholder="Estado" value={novoEndereco.estado} onChange={e => setNovoEndereco({ ...novoEndereco, estado: e.target.value })} />
              <input className="input w-full" placeholder="CEP" value={novoEndereco.cep} onChange={e => setNovoEndereco({ ...novoEndereco, cep: e.target.value })} />
              {error && <div className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</div>}
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? 'Salvando...' : 'Salvar endereço'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
