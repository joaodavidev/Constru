import React from 'react';
import Hero from '../components/Hero';
import FeaturedProducts from '../components/FeaturedProducts';
import Categories from '../components/Categories';

export default function HomePage() {
  return (
    <div>
      <Hero />
      <FeaturedProducts />
      <Categories />
      
      {/* Newsletter Section */}
      <section className="py-12 bg-secondary">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">Entre na nossa Newsletter</h2>
            <p className="text-white/90 mb-6">Esteja atualizado sobre produtos mais recentes, ofertas exclusivas e dicas de compras.</p>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Seu endereço de email" 
                className="input flex-grow"
              />
              <button className="btn bg-primary text-white hover:bg-primary/90">
                Inscrever-se
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Trust Badges Section */}
      <section className="py-12 bg-light">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Produtos de qualidade</h3>
              <p className="text-gray-600 text-sm">Produtos escolhidos para atender os altos padrões do mercado e avaliado por usuários.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              {/* Ícone de moeda */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2} fill="none" />
                <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor" fontFamily="Arial" fontWeight="bold">$</text>
              </svg>
              </div>
              <h3 className="font-semibold mb-2">Preços competitivos</h3>
              <p className="text-gray-600 text-sm">Trabalhamos com os fornecedores para buscar sempre os preços para você.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Pagamento Seguro</h3>
              <p className="text-gray-600 text-sm">Múltiplas opções de pagamento seguro para sua conveniência.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth={2} fill="none" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
              </svg>
              </div>
              <h3 className="font-semibold mb-2">Facilidade de busca</h3>
              <p className="text-gray-600 text-sm">Oferecemos conforto e praticidade para as buscas de preço do seu dia a dia.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}