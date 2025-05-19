import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CartSummary() {
  const { cartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const TAX_RATE = 0.08; // 8% tax
  const SHIPPING_COST = cartTotal >= 100 ? 0 : 10; // Free shipping over $100
  
  const taxAmount = cartTotal * TAX_RATE;
  const totalWithTaxAndShipping = cartTotal + taxAmount + SHIPPING_COST;
  
  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Tax (8%)</span>
          <span>${taxAmount.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span>{SHIPPING_COST === 0 ? 'Free' : `$${SHIPPING_COST.toFixed(2)}`}</span>
        </div>
        
        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>${totalWithTaxAndShipping.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <button 
        onClick={handleCheckout}
        className="btn btn-primary w-full mb-3"
      >
        {isAuthenticated ? 'Proceed to Checkout' : 'Sign in to Checkout'}
      </button>
      
      <button 
        onClick={() => clearCart()}
        className="btn btn-outline w-full"
      >
        Clear Cart
      </button>
      
      <div className="mt-6 text-sm text-gray-500">
        <p className="mb-2">We accept:</p>
        <div className="flex gap-2">
          <div className="bg-gray-200 rounded px-2 py-1">Visa</div>
          <div className="bg-gray-200 rounded px-2 py-1">Mastercard</div>
          <div className="bg-gray-200 rounded px-2 py-1">PayPal</div>
        </div>
      </div>
    </div>
  );
}