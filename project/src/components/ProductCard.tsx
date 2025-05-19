import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="card group hover:shadow-lg">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden">
          {/* Product Image */}
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-48 md:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Wishlist Button */}
          <button 
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-primary hover:text-white transition-colors"
            aria-label="Add to wishlist"
            onClick={(e) => e.preventDefault()}
          >
            <Heart size={18} />
          </button>
          
          {/* Tag for Featured Products */}
          {product.featured && (
            <span className="absolute top-2 left-2 badge badge-secondary">
              Destaque
            </span>
          )}
        </div>
        
        <div className="p-4">
          {/* Category */}
          <div className="text-xs text-gray-500 uppercase mb-1">
            {product.category}
          </div>
          
          {/* Product Name */}
          <h3 className="font-medium text-lg mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  className={i < Math.floor(product.rating) ? "text-secondary fill-secondary" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
          </div>
          
          {/* Conferir Fornecedores Button */}
          <Link 
            to={`/product/${product.id}`}
            className="btn btn-primary w-full mt-3 block text-center hover:text-secondary transition-colors"
          >
            Conferir fornecedores
          </Link>
        </div>
      </Link>
    </div>
  );
}