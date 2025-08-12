
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Oferta } from '../types/supplier';
import { API_BASE_URL } from '../api';

interface CartItem {
  oferta: Oferta;
  quantidade: number;
  preco_unitario: number;
  id?: number; // id do item no backend
}

interface CartContextType {
  cart: CartItem[];
  cartId: number | null;
  addToCart: (oferta: Oferta, quantidade?: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantidade: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<number | null>(null);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Inicializa carrinho (anônimo ou autenticado)
  useEffect(() => {
    const token = localStorage.getItem('cartToken');
    const usuario_id = localStorage.getItem('userId');
    fetch(`${API_BASE_URL}/carrinho`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario_id ? { usuario_id } : { token }),
    })
      .then(res => res.json())
      .then(data => {
        setCartId(data.id);
        if (data.token) localStorage.setItem('cartToken', data.token);
        syncCart(data.id);
      });
  }, []);

  // Sincroniza itens do carrinho
  const syncCart = async (idOverride?: number) => {
    const id = idOverride || cartId;
    if (!id) return;
    const res = await fetch(`${API_BASE_URL}/carrinho/${id}/itens`);
    const items = await res.json();
    setCart(items);
    setCartTotal(items.reduce((sum: number, item: CartItem) => sum + item.preco_unitario * item.quantidade, 0));
    setCartCount(items.reduce((sum: number, item: CartItem) => sum + item.quantidade, 0));
  };

  // Adiciona item ao carrinho
  const addToCart = async (oferta: Oferta, quantidade = 1) => {
    if (!cartId) return;
    await fetch(`${API_BASE_URL}/carrinho/${cartId}/item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oferta_id: oferta.id, quantidade, preco_unitario: oferta.preco }),
    });
    await syncCart();
  };

  // Remove item do carrinho
  const removeFromCart = async (itemId: number) => {
    await fetch(`${API_BASE_URL}/carrinho/item/${itemId}`, { method: 'DELETE' });
    await syncCart();
  };

  // Atualiza quantidade
  const updateQuantity = async (itemId: number, quantidade: number) => {
    await fetch(`${API_BASE_URL}/carrinho/item/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantidade }),
    });
    await syncCart();
  };

  // Limpa carrinho
  const clearCart = async () => {
    if (!cartId) return;
    // Remove todos os itens
    for (const item of cart) {
      await removeFromCart(item.id!);
    }
    await syncCart();
  };

  return (
    <CartContext.Provider value={{
      cart,
      cartId,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      syncCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}