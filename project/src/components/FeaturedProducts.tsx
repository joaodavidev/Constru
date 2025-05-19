import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { getFeaturedProducts } from '../data/products';

export default function FeaturedProducts() {
  const featuredProducts = getFeaturedProducts();
  
  return (
    <section className="py-12 bg-light">
      <div className="container">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold">Produtos em Destaque</h2>
          <Link 
            to="/products" 
            className="flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            Ver Todos <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}