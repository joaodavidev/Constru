import React from 'react';
import { useCart } from '../context/CartContext';
import { Trash, Minus, Plus } from 'lucide-react';

export default function CartItem({ item }: { item: any }) {
  const { updateQuantity, removeFromCart } = useCart();
  const { oferta, quantidade, preco_unitario, id } = item;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center py-4 border-b">
      {/* Oferta/Produto Image */}
      <div className="w-20 h-20 flex-shrink-0 mr-4 mb-4 sm:mb-0">
        <img 
          src={oferta.produto_imagem || 'https://via.placeholder.com/80'} 
          alt={oferta.produto_nome || 'Produto'} 
          className="w-full h-full object-cover rounded"
        />
      </div>
      {/* Info */}
      <div className="flex-grow">
        <div className="font-medium">{oferta.produto_nome}</div>
        <div className="text-xs text-gray-500">Fornecedor: {oferta.fornecedor_id}</div>
      </div>
      {/* Quantity Controls */}
      <div className="flex items-center mt-2 sm:mt-0 sm:mx-4">
        <button 
          onClick={() => updateQuantity(id, quantidade - 1)} 
          className="p-1 border rounded-l hover:bg-gray-100"
          aria-label="Decrease quantity"
        >
          <Minus size={16} />
        </button>
        <span className="px-3 py-1 border-t border-b">{quantidade}</span>
        <button 
          onClick={() => updateQuantity(id, quantidade + 1)} 
          className="p-1 border rounded-r hover:bg-gray-100"
          aria-label="Increase quantity"
        >
          <Plus size={16} />
        </button>
      </div>
      {/* Price */}
      <div className="font-medium text-lg sm:w-24 text-right mt-2 sm:mt-0">
        R$ {(preco_unitario * quantidade).toFixed(2)}
      </div>
      {/* Remove Button */}
      <button 
        onClick={() => removeFromCart(id)} 
        className="text-red-500 hover:text-red-700 ml-4 p-1"
        aria-label="Remove item"
      >
        <Trash size={18} />
      </button>
    </div>
  );
}