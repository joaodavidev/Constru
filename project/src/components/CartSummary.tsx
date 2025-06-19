import React from 'react';
import { useCart } from '../context/CartContext';

export default function CartSummary() {
  const { cartTotal, clearCart } = useCart();
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>R$ {cartTotal.toFixed(2)}</span>
        </div>
      </div>
      <button 
        onClick={() => alert('Checkout em breve!')}
        className="btn btn-primary w-full mb-3"
      >
        Finalizar Compra
      </button>
      <button 
        onClick={() => clearCart()}
        className="btn btn-outline w-full"
      >
        Limpar Carrinho
      </button>
    </div>
  );
}