import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../data/categories';
import { getProductsByCategory } from '../data/products';

export default function CategoriesPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-semibold mb-6">Categorias</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => {
          const products = getProductsByCategory(category.id);
          
          return (
            <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <div className="p-4">
                    <h2 className="text-xl font-semibold text-white">{category.name}</h2>
                    <p className="text-white/80 text-sm">{products.length} produtos</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-2">
                  {products.map((product) => (
                    <Link 
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="block hover:bg-gray-50 p-2 rounded-md transition-colors"
                    >
                      <div className="flex items-center">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="ml-3">
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-gray-500">{product.description}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                
                <Link 
                  to={`/products?category=${category.id}`}
                  className="mt-4 btn btn-primary w-full"
                >
                  Ver todos os produtos
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}