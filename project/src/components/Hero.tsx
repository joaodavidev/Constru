import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative bg-primary overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center opacity-10"></div>
      
      <div className="container relative py-16 md:py-24">
        <div className="max-w-2xl animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Construa seus sonhos com materiais que cabem no seu bolso.
          </h1>
          <p className="text-light/90 text-lg md:text-xl mb-8">
            Encontre tudo que você precisa para construção e reforma, materiais e busca especializada a preços competitivos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/products" className="btn btn-secondary">
              Comprar Agora
            </Link>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white transform -skew-y-2 translate-y-8"></div>
    </section>
  );
}