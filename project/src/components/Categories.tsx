import React from 'react';
import { categories } from '../data/categories';
import CategoryCard from './CategoryCard';

export default function Categories() {
  return (
    <section className="py-12 bg-white">
      <div className="container">
        <h2 className="text-2xl md:text-3xl font-semibold mb-8">Comprar por Categoria</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}