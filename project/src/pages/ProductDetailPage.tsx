import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Star, ChevronLeft, ShoppingCart } from 'lucide-react';
import { getProductById, getProductsByCategory } from '../data/products';
import { useCart } from '../context/CartContext';
import { Oferta } from '../types/supplier';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../api';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const product = id ? getProductById(id) : null;
  const [ofertas, setOfertas] = useState<any[]>([]);
  const [loadingOfertas, setLoadingOfertas] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(false);
  const [novaAvaliacao, setNovaAvaliacao] = useState({ nota: 0, comentario: '' });
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);
  const [erroAvaliacao, setErroAvaliacao] = useState<string|null>(null);
  const [avaliacaoEnviada, setAvaliacaoEnviada] = useState(false);
  const { addToCart } = useCart();
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoadingOfertas(true);
    fetch(`${API_BASE_URL}/ofertas?produto_id=${id}`)
      .then(res => res.json())
      .then(data => setOfertas(Array.isArray(data) ? data : []))
      .catch(() => setOfertas([]))
      .finally(() => setLoadingOfertas(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoadingAvaliacoes(true);
    fetch(`${API_BASE_URL}/avaliacoes?produto_id=${id}`)
      .then(res => res.json())
      .then(data => setAvaliacoes(Array.isArray(data) ? data : []))
      .catch(() => setAvaliacoes([]))
      .finally(() => setLoadingAvaliacoes(false));
  }, [id, avaliacaoEnviada]);

  if (!product) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">Produto não encontrado</h2>
        <p className="mb-6">O produto que você está procurando não existe ou foi removido.</p>
        <Link to="/products" className="btn btn-primary">
          Voltar para Produtos
        </Link>
      </div>
    );
  }

  // Mock suppliers data
  const suppliers = [
    { 
      id: 1, 
      name: 'Fornecedor 1', 
      rating: 4.8, 
      price: 18.90, 
      distance: '40km', 
      economy: 2.5,
      reviews: [
        {
          id: 1,
          clientName: 'Cliente 1',
          rating: 5,
          comment: 'Fornecedor confiável, entregou dentro do prazo necessário'
        }
      ]
    },
    { 
      id: 2, 
      name: 'Fornecedor 2', 
      rating: 4.7, 
      price: 19.90, 
      distance: '30km', 
      economy: 1.5,
      reviews: []
    },
    { 
      id: 3, 
      name: 'Fornecedor 3', 
      rating: 4.6, 
      price: 20.80, 
      distance: '45km', 
      economy: 0.3,
      reviews: []
    },
    { 
      id: 4, 
      name: 'Fornecedor 4', 
      rating: 4.5, 
      price: 21.80, 
      distance: '50km', 
      economy: 0.7,
      reviews: []
    }
  ];

  // Get related products
  const relatedProducts = getProductsByCategory(product.category)
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  // Decide se usa ofertas reais ou mocks
  const usandoOfertasReais = ofertas.length > 0;
  // Agrupa avaliações reais por fornecedor (oferta)
  let reviewsByFornecedor: Record<string, any[]> = {};
  if (usandoOfertasReais && avaliacoes.length > 0) {
    ofertas.forEach(oferta => {
      reviewsByFornecedor[oferta.fornecedor_id] = avaliacoes.filter(a => a.produto_id === oferta.produto_id);
    });
  }
  const suppliersToShow = usandoOfertasReais
    ? ofertas.map(oferta => ({
        id: oferta.id,
        name: oferta.fornecedor_nome || 'Fornecedor',
        price: oferta.preco,
        endereco: oferta.endereco_nome || oferta.nome_endereco || '',
        rating: avaliacoes.length > 0 ? (reviewsByFornecedor[oferta.fornecedor_id]?.length
          ? (reviewsByFornecedor[oferta.fornecedor_id].reduce((acc, r) => acc + r.nota, 0) / reviewsByFornecedor[oferta.fornecedor_id].length)
          : 0) : 0,
        reviews: reviewsByFornecedor[oferta.fornecedor_id] || [],
        fornecedor_id: oferta.fornecedor_id,
      }))
    : suppliers.map(s => ({ ...s, endereco: s.distance })); // Mocks: usa distance como placeholder de endereço

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm mb-6">
        <Link to="/" className="text-gray-500 hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="aspect-square">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Product Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          
          {/* Suppliers List */}
          <div className="space-y-4">
            {loadingOfertas ? (
              <div>Carregando fornecedores...</div>
            ) : suppliersToShow.length === 0 ? (
              <div className="text-gray-500">Nenhum fornecedor para este produto ainda.</div>
            ) : suppliersToShow.map(supplier => (
              <div key={supplier.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <img 
                      src="https://via.placeholder.com/40"
                      alt={supplier.name}
                      className="w-10 h-10 rounded"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{supplier.name}</h3>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < Math.floor(supplier.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">{supplier.rating}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{supplier.endereco}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">R$ {supplier.price.toFixed(2)}/kg</div>
                  {usandoOfertasReais ? (
                    <button
                      className="btn btn-primary mt-2 flex items-center gap-2"
                      disabled={addingId === supplier.id}
                      onClick={async () => {
                        setAddingId(supplier.id);
                        const oferta = ofertas.find(o => o.id === supplier.id);
                        if (oferta) {
                          await addToCart(oferta, 1);
                          toast.success('Produto adicionado ao carrinho!');
                        }
                        setAddingId(null);
                      }}
                    >
                      <ShoppingCart size={18} /> Adicionar ao carrinho
                    </button>
                  ) : (
                    <button className="btn btn-primary mt-2 flex items-center gap-2" disabled>
                      <ShoppingCart size={18} /> Adicionar ao carrinho
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Product Description */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Descrição do produto</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Avaliações</h2>
        {loadingAvaliacoes ? (
          <div>Carregando avaliações...</div>
        ) : (
        <div className="space-y-4">
          {suppliersToShow.map(supplier => (
            <div key={supplier.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{supplier.name}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        className={i < Math.round(supplier.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  {supplier.rating > 0 && (
                    <span className="ml-2 text-sm text-gray-500">{supplier.rating.toFixed(1)}</span>
                  )}
                </div>
                {usandoOfertasReais ? (
                  <button
                    className="btn btn-primary flex items-center gap-2"
                    disabled={addingId === supplier.id}
                    onClick={async () => {
                      setAddingId(supplier.id);
                      const oferta = ofertas.find(o => o.id === supplier.id);
                      if (oferta) {
                        await addToCart(oferta, 1);
                        toast.success('Produto adicionado ao carrinho!');
                      }
                      setAddingId(null);
                    }}
                  >
                    <ShoppingCart size={18} /> Adicionar ao carrinho
                  </button>
                ) : (
                  <button className="btn btn-primary flex items-center gap-2" disabled>
                    <ShoppingCart size={18} /> Adicionar ao carrinho
                  </button>
                )}
              </div>
              {/* Avaliações reais ou mocks */}
              {supplier.reviews && supplier.reviews.length > 0 ? (
                <div className="p-4 space-y-3">
                  {supplier.reviews.map((review: any) => (
                    <div key={review.id} className="flex items-start space-x-4">
                      <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 font-medium">
                          {review.usuario_nome ? review.usuario_nome.charAt(0) : (review.clientName?.charAt(0) || '?')}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center mb-1">
                          <span className="font-medium mr-2">{review.usuario_nome || review.clientName}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={14} 
                                className={i < (review.nota || review.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600">{review.comentario || review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Nenhuma avaliação para este fornecedor ainda.
                </div>
              )}
              {/* Formulário de avaliação (apenas se usando ofertas reais) */}
              {usandoOfertasReais && (
                <div className="p-4 border-t bg-gray-50">
                  <form
                    onSubmit={async e => {
                      e.preventDefault();
                      setErroAvaliacao(null);
                      setEnviandoAvaliacao(true);
                      try {
                        // TODO: pegar usuario_id real do contexto de auth
                        const usuario_id = localStorage.getItem('userId') || 1;
                        const res = await fetch(`${API_BASE_URL}/avaliacoes`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            usuario_id,
                            produto_id: id,
                            nota: novaAvaliacao.nota,
                            comentario: novaAvaliacao.comentario,
                          })
                        });
                        if (!res.ok) {
                          const err = await res.json();
                          throw new Error(err.error || 'Erro ao enviar avaliação');
                        }
                        setAvaliacaoEnviada(v => !v); // força reload
                        setNovaAvaliacao({ nota: 0, comentario: '' });
                      } catch (err: any) {
                        setErroAvaliacao(err.message);
                      } finally {
                        setEnviandoAvaliacao(false);
                      }
                    }}
                  >
                    <div className="flex items-center mb-2">
                      <span className="mr-2">Sua nota:</span>
                      {[1,2,3,4,5].map(n => (
                        <button
                          type="button"
                          key={n}
                          className={
                            n <= novaAvaliacao.nota
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }
                          onClick={() => setNovaAvaliacao(a => ({ ...a, nota: n }))}
                          disabled={enviandoAvaliacao}
                        >
                          <Star size={20} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="w-full border rounded p-2 mb-2"
                      rows={2}
                      placeholder="Deixe um comentário (opcional)"
                      value={novaAvaliacao.comentario}
                      onChange={e => setNovaAvaliacao(a => ({ ...a, comentario: e.target.value }))}
                      disabled={enviandoAvaliacao}
                    />
                    {erroAvaliacao && <div className="text-red-500 text-sm mb-2">{erroAvaliacao}</div>}
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={enviandoAvaliacao || novaAvaliacao.nota === 0}
                    >
                      {enviandoAvaliacao ? 'Enviando...' : 'Enviar avaliação'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
        )}
      </section>
      
      {/* Related Products */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-6">Outros materiais</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {relatedProducts.map(product => (
            <Link 
              key={product.id} 
              to={`/product/${product.id}`}
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-32 object-cover rounded mb-3"
              />
              <h3 className="font-medium text-center">{product.name}</h3>
              <div className="text-center text-primary font-semibold mt-2">
                R$ {(product.price ?? 0).toFixed(2)}/kg
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}