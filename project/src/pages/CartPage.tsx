// ...existing code...
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CartPage() {
  const { cart } = useCart();
  if (!cart || cart.length === 0) {
    return (
      <div className="container py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={24} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Seu carrinho está vazio</h2>
          <p className="text-gray-600 mb-6">Adicione produtos ao carrinho e eles aparecerão aqui.</p>
          <Link to="/products" className="btn btn-primary">
            Continuar comprando
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-semibold mb-6">Seu Carrinho</h1>
      <Link to="/products" className="inline-flex items-center text-primary hover:text-primary/80 mb-6">
        <ArrowLeft size={16} className="mr-1" /> Continuar comprando
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Itens do Carrinho */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="mb-6 border-b pb-3">
            <h2 className="text-xl font-medium">Itens do Carrinho ({cart.length})</h2>
          </div>
          <div className="space-y-0">
            {cart.map(item => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        </div>
        {/* Resumo do Carrinho */}
        <div>
          <CartSummary />
        </div>
      </div>
    </div>
  );
}