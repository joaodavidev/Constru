import React from 'react';
import { Link } from 'react-router-dom';
import { Trash, Minus, Plus } from 'lucide-react';
import { CartItem as CartItemType } from '../types';
import { useCart } from '../context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;
  
  const handleIncrement = () => {
    updateQuantity(product.id, quantity + 1);
  };
  
  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else {
      removeFromCart(product.id);
    }
  };
  
  const handleRemove = () => {
    removeFromCart(product.id);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center py-4 border-b">
      {/* Product Image */}
      <Link to={`/product/${product.id}`} className="w-20 h-20 flex-shrink-0 mr-4 mb-4 sm:mb-0">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover rounded"
        />
      </Link>
      
      {/* Product Info */}
      <div className="flex-grow">
        <Link to={`/product/${product.id}`} className="font-medium hover:text-primary">
          {product.name}
        </Link>
        <p className="text-gray-500 text-sm">{product.category}</p>
      </div>
      
      {/* Quantity Controls */}
      <div className="flex items-center mt-2 sm:mt-0 sm:mx-4">
        <button 
          onClick={handleDecrement}
          className="p-1 border rounded-l hover:bg-gray-100"
          aria-label="Decrease quantity"
        >
          <Minus size={16} />
        </button>
        <span className="px-3 py-1 border-t border-b">{quantity}</span>
        <button 
          onClick={handleIncrement}
          className="p-1 border rounded-r hover:bg-gray-100"
          aria-label="Increase quantity"
        >
          <Plus size={16} />
        </button>
      </div>
      
      {/* Price */}
      <div className="font-medium text-lg sm:w-24 text-right mt-2 sm:mt-0">
        ${(product.price * quantity).toFixed(2)}
      </div>
      
      {/* Remove Button */}
      <button 
        onClick={handleRemove}
        className="text-red-500 hover:text-red-700 ml-4 p-1"
        aria-label="Remove item"
      >
        <Trash size={18} />
      </button>
    </div>
  );
}