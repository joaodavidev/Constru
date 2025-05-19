import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="container pt-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                <div className="h-5 w-5 rounded-full bg-secondary"></div>
              </div>
              <span className="ml-2 text-xl font-bold">Constru+</span>
            </div>
            <p className="mb-4 text-light/80">Seu destino único para materiais de construção e produtos de reforma residencial. Materiais de qualidade, preços competitivos e excelente atendimento.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-secondary transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-secondary transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-secondary transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-xl mb-4 text-secondary">Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-white hover:text-secondary transition-colors">Início</Link></li>
              <li><Link to="/products" className="text-white hover:text-secondary transition-colors">Produtos</Link></li>
              <li><Link to="/categories" className="text-white hover:text-secondary transition-colors">Categorias</Link></li>
              <li><Link to="/about" className="text-white hover:text-secondary transition-colors">Sobre nós</Link></li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-xl mb-4 text-secondary">Atendimento ao cliente</h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-white hover:text-secondary transition-colors">Nos contate</Link></li>
              <li><Link to="/faq" className="text-white hover:text-secondary transition-colors">FAQs</Link></li>
              <li><Link to="/shipping" className="text-white hover:text-secondary transition-colors">Política de envio</Link></li>
              <li><Link to="/returns" className="text-white hover:text-secondary transition-colors">Estornos e Reembolsos</Link></li>
              <li><Link to="/terms" className="text-white hover:text-secondary transition-colors">Termos e Condições</Link></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-xl mb-4 text-secondary">Nos contate</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={20} className="mr-2 mt-1 flex-shrink-0" />
                <span>Curitiba, Paraná</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="mr-2 flex-shrink-0" />
                <span>(41) 99780-8511</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="mr-2 flex-shrink-0" />
                <span>aconstrumais@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-light/80">&copy; {new Date().getFullYear()} Constru+. Todos direitos reservado.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/privacy" className="text-white hover:text-secondary transition-colors">Política de privacidade</Link>
              <Link to="/terms" className="text-white hover:text-secondary transition-colors">Termos de serviço</Link>
              <Link to="/cookies" className="text-white hover:text-secondary transition-colors">Política de Cookie</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}