import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Star, ChevronLeft } from 'lucide-react';
import { getProductById, getProductsByCategory } from '../data/products';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const product = id ? getProductById(id) : null;
  
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
            {suppliers.map(supplier => (
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
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">R$ {supplier.price.toFixed(2)}/kg</div>
                  <div className="text-sm text-gray-500">Distância: {supplier.distance}</div>
                  <div className="text-sm text-green-600">Economia: {supplier.economy}%</div>
                  <button className="btn btn-primary mt-2">
                    Entrar em contato
                  </button>
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
        <div className="space-y-4">
          {suppliers.map(supplier => (
            <div key={supplier.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{supplier.name}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        className={i < Math.floor(supplier.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
                <button className="btn btn-primary">
                  Entrar em contato
                </button>
              </div>
              
              {supplier.reviews.length > 0 ? (
                <div className="p-4">
                  {supplier.reviews.map(review => (
                    <div key={review.id} className="flex items-start space-x-4">
                      <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 font-medium">
                          {review.clientName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center mb-1">
                          <span className="font-medium mr-2">{review.clientName}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={14} 
                                className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <Link to="#" className="text-primary hover:underline">
                    Acessar avaliações
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
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