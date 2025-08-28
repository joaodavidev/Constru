import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useEffect } from 'react';
import { API_BASE_URL } from '../api';
import { categories } from '../data/categories';

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch(`${API_BASE_URL}/produtos`)
      .then(res => res.json())
      .then(data => {
        // Mapear campos do backend para o tipo Product do frontend
        const mapped = data.map((p: any) => ({
          id: p.id?.toString() || p.id_produto?.toString() || '',
          name: p.nome,
          price: p.preco,
          description: p.descricao,
          image: p.imagem,
          category: p.categoria_id?.toString() || '',
          rating: p.rating || 0,
          reviews: p.reviews || 0,
          inStock: p.estoque > 0,
          featured: false,
        }));
        setProducts(mapped);
      })
      .catch(() => setProducts([]));
  }, []);

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.categoria_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    // Adapte o sort conforme os campos reais do backend
    return 0;
  });
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('featured');
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-semibold mb-6">Todos os Produtos</h1>
      
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-grow relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar produtos..."
            className="input pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden btn btn-outline flex items-center"
        >
          <Filter size={18} className="mr-2" /> 
          Filtros
        </button>
        
        <div className="hidden md:flex items-center gap-4">
          <div>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              <option value="">Todas as Categorias</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
            >
              <option value="featured">Em Destaque</option>
              <option value="rating">Melhor Avaliados</option>
            </select>
          </div>
          
          <button 
            onClick={resetFilters}
            className="text-primary hover:text-primary/80 flex items-center"
          >
            <X size={18} className="mr-1" />
            Limpar
          </button>
        </div>
      </div>
      
      {/* Mobile Filters */}
      {showFilters && (
        <div className="md:hidden bg-white p-4 rounded-lg shadow-md mb-6 animate-slide-down">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Categoria</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input"
              >
                <option value="">Todas as Categorias</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Ordenar Por</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input"
              >
                <option value="featured">Em Destaque</option>
                <option value="rating">Melhor Avaliados</option>
              </select>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={resetFilters}
                className="text-primary hover:text-primary/80"
              >
                Limpar Filtros
              </button>
              
              <button 
                onClick={() => setShowFilters(false)}
                className="btn btn-primary"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedProducts.length > 0 ? (
          sortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-xl text-gray-500">Nenhum produto encontrado. Tente ajustar seus filtros.</p>
            <button 
              onClick={resetFilters}
              className="mt-4 btn btn-primary"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}