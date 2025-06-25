import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { API_BASE_URL } from '../api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, tipo_usuario?: string, cnpj?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for demo purposes
const mockUser: User = {
  id: '1',
  name: 'Demo User',
  email: 'demo@example.com',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for saved auth in localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Chama a API de login do backend
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha: password })
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Erro ao fazer login');
    }
    const data = await response.json();
    setUser(data.user);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const signup = async (name: string, email: string, password: string, tipo_usuario: string = 'cliente', cnpj?: string) => {
    // Chama a API de cadastro do backend
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: name, email, senha: password, tipo_usuario, cnpj })
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Erro ao criar conta');
    }
    const data = await response.json();
    setUser(data.user);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      signup,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}