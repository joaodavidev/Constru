import { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'CA-60',
    description: 'Aço CA-60 para construção civil',
    image: '/images/ca60.jpeg',
    category: 'materiais',
    rating: 4.8,
    reviews: 245,
    inStock: true,
    featured: true,
  },
  {
    id: '2',
    name: 'Brita 0',
    description: 'Brita 0 para construção',
    image: '/images/brita0.jpg',
    category: 'agregados',
    rating: 4.6,
    reviews: 189,
    inStock: true,
    featured: true,
  },
  {
    id: '3',
    name: 'Brita 1',
    description: 'Brita 1 para construção',
    image: '/images/brita1.jpg',
    category: 'agregados',
    rating: 4.7,
    reviews: 132,
    inStock: true,
    featured: true,
  },
  {
    id: '9',
    name: 'Cimento 50kg',
    description: 'Saco de cimento 50kg',
    image: '/images/cimento50kg.webp',
    category: 'materiais',
    rating: 4.8,
    reviews: 245,
    inStock: true,
    featured: true,
  },
  {
    id: '4',
    name: 'Brita 2',
    description: 'Brita 2 para construção',
    image: 'https://images.pexels.com/photos/5725442/pexels-photo-5725442.jpeg',
    category: 'agregados',
    rating: 4.9,
    reviews: 87,
    inStock: true,
  },
  {
    id: '5',
    name: 'Tijolos 6 furos',
    description: 'Tijolos cerâmicos de 6 furos',
    image: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg',
    category: 'alvenaria',
    rating: 4.5,
    reviews: 63,
    inStock: true,
  },
  {
    id: '6',
    name: 'Tijolos 8 furos',
    description: 'Tijolos cerâmicos de 8 furos',
    image: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg',
    category: 'alvenaria',
    rating: 4.3,
    reviews: 118,
    inStock: true,
  },
  {
    id: '7',
    name: 'Tijolos 12 furos',
    description: 'Tijolos cerâmicos de 12 furos',
    image: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg',
    category: 'alvenaria',
    rating: 4.4,
    reviews: 156,
    inStock: true,
  },
  {
    id: '8',
    name: 'Bloco estrutural',
    description: 'Bloco estrutural de concreto',
    image: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg',
    category: 'alvenaria',
    rating: 4.2,
    reviews: 79,
    inStock: true,
  },
  {
    id: '10',
    name: 'Argamassa 20kg',
    description: 'Argamassa para assentamento 20kg',
    image: 'https://images.pexels.com/photos/4491881/pexels-photo-4491881.jpeg',
    category: 'materiais',
    rating: 4.6,
    reviews: 189,
    inStock: true,
  },
  {
    id: '11',
    name: 'Areia Grossa',
    description: 'Areia grossa para construção',
    image: 'https://images.pexels.com/photos/5725442/pexels-photo-5725442.jpeg',
    category: 'agregados',
    rating: 4.7,
    reviews: 132,
    inStock: true,
  },
  {
    id: '12',
    name: 'Areia Fina',
    description: 'Areia fina para acabamento',
    image: 'https://images.pexels.com/photos/5725442/pexels-photo-5725442.jpeg',
    category: 'agregados',
    rating: 4.9,
    reviews: 87,
    inStock: true,
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.featured);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category === category);
};