export interface Product {
  id: string;
  name: string;
  price?: number;
  description: string;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  tipo_usuario?: string;
  cnpj?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}