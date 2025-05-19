import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';

export default function CartPage() {
  const { cart } = useCart();
  
  if (cart.length === 0) {
    return (
      <div className="container py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={24} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to your cart and they will appear here.</p>
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-semibold mb-6">Your Shopping Cart</h1>
      
      <Link to="/products" className="inline-flex items-center text-primary hover:text-primary/80 mb-6">
        <ArrowLeft size={16} className="mr-1" /> Continue Shopping
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="mb-6 border-b pb-3">
            <h2 className="text-xl font-medium">Cart Items ({cart.length})</h2>
          </div>
          
          <div className="space-y-0">
            {cart.map(item => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </div>
        </div>
        
        {/* Cart Summary */}
        <div>
          <CartSummary />
        </div>
      </div>
    </div>
  );
}