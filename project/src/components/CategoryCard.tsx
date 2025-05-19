import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link to={`/category/${category.id}`} className="block group">
      <div className="relative overflow-hidden rounded-lg shadow-md">
        <img 
          src={category.image} 
          alt={category.name} 
          className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/70 to-transparent flex items-end">
          <div className="p-4 w-full">
            <h3 className="text-white font-semibold text-lg group-hover:text-secondary transition-colors">
              {category.name}
            </h3>
          </div>
        </div>
      </div>
    </Link>
  );
}