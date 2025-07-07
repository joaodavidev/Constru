import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { products } from '../data/products';
import { Oferta, Endereco } from '../types/supplier';
import { useSupplierOfertas, useSupplierEnderecos } from './hooksSupplier';
import SupplierAddressesManager from '../components/SupplierAddressesManager';
import { API_BASE_URL } from '../api';

function CreateAnnouncementModal({
  open, onClose, produto, enderecos, onEnderecoCreated, onSuccess, fornecedorId
}: {
  open: boolean;
  onClose: () => void;
  produto: any;
  enderecos: Endereco[];
  onEnderecoCreated: (e: Endereco) => void;
  onSuccess: () => void;
  fornecedorId: string | number;
}) {
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [enderecoId, setEnderecoId] = useState<string>('');
  const [showEnderecoModal, setShowEnderecoModal] = useState(false);
  const [error, setError] = useState('');
  // Novo endereço
  const [novoEndereco, setNovoEndereco] = useState({
    nome_endereco: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: ''
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!preco || !estoque || !enderecoId) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (Number(preco) <= 0 || Number(estoque) < 0) {
      setError('Preço deve ser maior que zero e estoque não pode ser negativo.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/ofertas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produto_id: produto.id,
          fornecedor_id: fornecedorId,
          preco: Number(preco),
          estoque: Number(estoque),
          endereco_id: enderecoId
        })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erro ao criar anúncio');
        setLoading(false);
        return;
      }
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Erro ao criar anúncio');
      setLoading(false);
    }
  };

  const handleEnderecoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!novoEndereco.nome_endereco) {
      setError('O apelido do endereço é obrigatório.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/enderecos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...novoEndereco, usuario_id: fornecedorId })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erro ao cadastrar endereço');
        return;
      }
      const data = await res.json();
      onEnderecoCreated(data);
      setEnderecoId(String(data.id));
      setShowEnderecoModal(false);
      setNovoEndereco({ nome_endereco: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' });
      setError('');
    } catch (err) {
      setError('Erro ao cadastrar endereço');
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>×</button>
        <h2 className="text-xl font-semibold mb-4">Criar anúncio para {produto.name}</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Preço (R$)</label>
            <input type="number" min={0.01} step={0.01} value={preco} onChange={e => setPreco(e.target.value)} className="input w-full" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estoque</label>
            <input type="number" min={0} step={1} value={estoque} onChange={e => setEstoque(e.target.value)} className="input w-full" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Endereço do ponto de entrega</label>
            <div className="flex gap-2 items-center">
              <select value={enderecoId} onChange={e => setEnderecoId(e.target.value)} className="input flex-1" required>
                <option value="">Selecione um endereço</option>
                {enderecos.map(e => (
                  <option key={e.id} value={e.id}>{e.nome_endereco} - {e.rua}, {e.numero}</option>
                ))}
              </select>
              <button type="button" className="btn btn-outline" onClick={() => setShowEnderecoModal(true)}>Novo endereço</button>
            </div>
          </div>
          {error && <div className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</div>}
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? 'Salvando...' : 'Criar anúncio'}</button>
        </form>
        {/* Modal de novo endereço */}
        {showEnderecoModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowEnderecoModal(false)}>×</button>
              <h3 className="text-lg font-semibold mb-2">Cadastrar novo endereço</h3>
              <form onSubmit={handleEnderecoSubmit} className="space-y-2">
                <input className="input w-full" placeholder="Apelido (ex: Matriz)" value={novoEndereco.nome_endereco} onChange={e => setNovoEndereco({ ...novoEndereco, nome_endereco: e.target.value })} required />
                <input className="input w-full" placeholder="Rua" value={novoEndereco.rua} onChange={e => setNovoEndereco({ ...novoEndereco, rua: e.target.value })} />
                <input className="input w-full" placeholder="Número" value={novoEndereco.numero} onChange={e => setNovoEndereco({ ...novoEndereco, numero: e.target.value })} />
                <input className="input w-full" placeholder="Complemento" value={novoEndereco.complemento} onChange={e => setNovoEndereco({ ...novoEndereco, complemento: e.target.value })} />
                <input className="input w-full" placeholder="Bairro" value={novoEndereco.bairro} onChange={e => setNovoEndereco({ ...novoEndereco, bairro: e.target.value })} />
                <input className="input w-full" placeholder="Cidade" value={novoEndereco.cidade} onChange={e => setNovoEndereco({ ...novoEndereco, cidade: e.target.value })} />
                <input className="input w-full" placeholder="Estado" value={novoEndereco.estado} onChange={e => setNovoEndereco({ ...novoEndereco, estado: e.target.value })} />
                <input className="input w-full" placeholder="CEP" value={novoEndereco.cep} onChange={e => setNovoEndereco({ ...novoEndereco, cep: e.target.value })} />
                {error && <div className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</div>}
                <button type="submit" className="btn btn-primary w-full">Salvar endereço</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SupplierAnnouncementPage() {
  const { user } = useAuth();
  const fornecedorId = user?.id ?? '';
  const { ofertas, loading: ofertasLoading, error: ofertasError, setOfertas } = useSupplierOfertas(fornecedorId);
  const { enderecos, setEnderecos } = useSupplierEnderecos(fornecedorId);
  const [modalProduto, setModalProduto] = useState<any | null>(null);

  const handleEnderecoCreated = (novo: Endereco) => {
    setEnderecos(prev => [...prev, novo]);
  };
  // Handler para adicionar endereço na lista
  const handleEnderecoDeleted = (id: number) => {
    setEnderecos(prev => prev.filter(e => e.id !== id));
  };
  const handleSuccess = () => {
    // Atualiza lista de ofertas após criar anúncio
    fetch(`${API_BASE_URL}/ofertas?fornecedor_id=${fornecedorId}`)
      .then(res => res.json())
      .then(data => setOfertas(data));
  };

  // Função para remover anúncio
  const handleRemove = async (ofertaId: number) => {
    if (!window.confirm('Tem certeza que deseja remover este anúncio?')) return;
    await fetch(`${API_BASE_URL}/ofertas/${ofertaId}`, { method: 'DELETE' });
    // Atualiza lista após remoção
    fetch(`${API_BASE_URL}/ofertas?fornecedor_id=${fornecedorId}`)
      .then(res => res.json())
      .then(data => setOfertas(data));
  };

  // Estado para edição de anúncio
  const [editOferta, setEditOferta] = useState<Oferta | null>(null);
  const [editPreco, setEditPreco] = useState('');
  const [editEstoque, setEditEstoque] = useState('');
  const [editEnderecoId, setEditEnderecoId] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const openEditModal = (oferta: Oferta) => {
    setEditOferta(oferta);
    setEditPreco(String(oferta.preco));
    setEditEstoque(String(oferta.estoque));
    setEditEnderecoId(String(oferta.endereco_id));
    setEditError('');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOferta) return;
    setEditError('');
    if (!editPreco || !editEstoque || !editEnderecoId) {
      setEditError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (Number(editPreco) <= 0 || Number(editEstoque) < 0) {
      setEditError('Preço deve ser maior que zero e estoque não pode ser negativo.');
      return;
    }
    setEditLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/ofertas/${editOferta.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preco: Number(editPreco), estoque: Number(editEstoque), endereco_id: editEnderecoId })
      });
      if (!res.ok) {
        const data = await res.json();
        setEditError(data.error || 'Erro ao editar anúncio');
        setEditLoading(false);
        return;
      }
      setEditLoading(false);
      setEditOferta(null);
      // Atualiza lista após edição
      fetch(`${API_BASE_URL}/ofertas?fornecedor_id=${fornecedorId}`)
        .then(res => res.json())
        .then(data => setOfertas(data));
    } catch {
      setEditError('Erro ao editar anúncio');
      setEditLoading(false);
    }
  };

  // Produtos já anunciados pelo fornecedor
  const produtosAnunciadosIds = ofertas.map(o => String(o.produto_id));
  // Produtos que ainda não têm anúncio
  const produtosNaoAnunciados = products.filter(p => !produtosAnunciadosIds.includes(p.id));

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-semibold mb-6">Painel do Fornecedor</h1>
      <SupplierAddressesManager
        enderecos={enderecos}
        onEnderecoCreated={handleEnderecoCreated}
        onEnderecoDeleted={handleEnderecoDeleted}
        fornecedorId={fornecedorId}
      />
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Produtos ainda não anunciados</h2>
        {produtosNaoAnunciados.length === 0 ? (
          <p className="text-gray-500">Você já anunciou todos os produtos disponíveis.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {produtosNaoAnunciados.map(produto => (
              <li key={produto.id} className="bg-white rounded shadow p-4 flex flex-col">
                <div className="flex-1">
                  <img src={produto.image} alt={produto.name} className="w-full h-32 object-cover rounded mb-2" />
                  <h3 className="font-semibold">{produto.name}</h3>
                  <p className="text-sm text-gray-600">{produto.description}</p>
                </div>
                <button className="btn btn-primary mt-4" onClick={() => setModalProduto(produto)}>Criar anúncio</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Seus anúncios</h2>
        {ofertasLoading ? (
          <p>Carregando anúncios...</p>
        ) : ofertas.length === 0 ? (
          <p className="text-gray-500">Você ainda não possui anúncios.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ofertas.map(oferta => (
              <li key={oferta.id} className="bg-white rounded shadow p-4 flex flex-col">
                <div className="flex-1">
                  <img src={oferta.produto_imagem || ''} alt={oferta.produto_nome} className="w-full h-32 object-cover rounded mb-2" />
                  <h3 className="font-semibold">{oferta.produto_nome}</h3>
                  <p className="text-sm text-gray-600">Preço: R$ {oferta.preco.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Estoque: {oferta.estoque}</p>
                  <p className="text-sm text-gray-600">Endereço: {oferta.nome_endereco}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="btn btn-outline" onClick={() => openEditModal(oferta)}>Editar</button>
                  <button className="btn btn-danger" onClick={() => handleRemove(oferta.id)}>Remover</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Modal de criar anúncio */}
      <CreateAnnouncementModal
        open={!!modalProduto}
        onClose={() => setModalProduto(null)}
        produto={modalProduto}
        enderecos={enderecos}
        onEnderecoCreated={handleEnderecoCreated}
        onSuccess={handleSuccess}
        fornecedorId={fornecedorId}
      />
      {/* Modal de editar anúncio */}
      {editOferta && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setEditOferta(null)}>×</button>
            <h2 className="text-xl font-semibold mb-4">Editar anúncio de {editOferta.produto_nome}</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Preço (R$)</label>
                <input type="number" min={0.01} step={0.01} value={editPreco} onChange={e => setEditPreco(e.target.value)} className="input w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estoque</label>
                <input type="number" min={0} step={1} value={editEstoque} onChange={e => setEditEstoque(e.target.value)} className="input w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Endereço do ponto de entrega</label>
                <select value={editEnderecoId} onChange={e => setEditEnderecoId(e.target.value)} className="input w-full" required>
                  <option value="">Selecione um endereço</option>
                  {enderecos.map(e => (
                    <option key={e.id} value={e.id}>{e.nome_endereco} - {e.rua}, {e.numero}</option>
                  ))}
                </select>
              </div>
              {editError && <div className="bg-red-100 text-red-700 p-2 rounded text-sm">{editError}</div>}
              <button type="submit" className="btn btn-primary w-full" disabled={editLoading}>{editLoading ? 'Salvando...' : 'Salvar alterações'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
