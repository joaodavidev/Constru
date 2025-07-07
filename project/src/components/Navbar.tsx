import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Menu, X, Hammer, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const { cartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Hammer size={20} className="text-secondary" />
            </div>
            <span className="ml-2 text-xl font-bold text-primary">Constru+</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="font-medium hover:text-primary">Início</Link>
          <Link to="/products" className="font-medium hover:text-primary">Produtos</Link>
          <Link to="/categories" className="font-medium hover:text-primary">Categorias</Link>
          <Link to="/support" className="font-medium hover:text-primary">Suporte</Link>
        </nav>

        {/* Search & Actions */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleSearch}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Buscar"
          >
            <Search size={20} />
          </button>
          <Link 
            to="/cart"
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Carrinho"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full px-1.5 py-0.5">
                {cartCount}
              </span>
            )}
          </Link>
          <Link 
            to={isAuthenticated ? "/account" : "/login"}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={isAuthenticated ? "Conta" : "Entrar"}
          >
            <User size={20} />
          </Link>
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Fechar Menu" : "Abrir Menu"}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t animate-slide-down">
          <div className="container py-4 space-y-4">
            <Link to="/" className="block py-2 hover:text-primary" onClick={toggleMenu}>Início</Link>
            <Link to="/products" className="block py-2 hover:text-primary" onClick={toggleMenu}>Produtos</Link>
            <Link to="/categories" className="block py-2 hover:text-primary" onClick={toggleMenu}>Categorias</Link>
            <Link to="/support" className="block py-2 hover:text-primary" onClick={toggleMenu}>Suporte</Link>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="border-t animate-slide-down bg-white">
          <div className="container py-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar produtos..." 
                className="input pr-8"
              />
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                onClick={toggleSearch}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}