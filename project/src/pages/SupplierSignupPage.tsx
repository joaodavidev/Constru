import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface FormData {
  name: string;
  cnpj: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  responsibleName: string;
}

export default function SupplierSignupPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    cnpj: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    responsibleName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const validateCNPJ = (cnpj: string) => {
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    if (cnpj.length !== 14) return false;
    
    // Check if all digits are the same
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    // Validate first check digit
    let sum = 0;
    let weight = 5;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cnpj.charAt(12))) return false;
    
    // Validate second check digit
    sum = 0;
    weight = 6;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cnpj.charAt(13))) return false;
    
    return true;
  };

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cnpj') {
      setFormData(prev => ({
        ...prev,
        [name]: formatCNPJ(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate CNPJ
    if (!validateCNPJ(formData.cnpj.replace(/\D/g, ''))) {
      setError('CNPJ inválido');
      return;
    }
    
    // Validate required fields
    if (!Object.values(formData).every(value => value.trim())) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    try {
      setLoading(true);
      // Here you would typically make an API call to register the supplier
      console.log('Supplier registration data:', formData);
      navigate('/login');
    } catch (err) {
      setError('Erro ao cadastrar fornecedor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-semibold mb-6 text-center">Cadastro de Fornecedor</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Empresa
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className="input"
              placeholder="Razão Social"
            />
          </div>
          
          <div>
            <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
              CNPJ
            </label>
            <input
              id="cnpj"
              name="cnpj"
              type="text"
              value={formData.cnpj}
              onChange={handleInputChange}
              className="input"
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mail Comercial
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="input"
              placeholder="comercial@empresa.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              className="input"
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefone de Contato
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              className="input"
              placeholder="(00) 00000-0000"
            />
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Endereço da Loja
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleInputChange}
              className="input"
              placeholder="Rua, número, bairro, cidade - Estado"
            />
          </div>
          
          <div>
            <label htmlFor="responsibleName" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Responsável
            </label>
            <input
              id="responsibleName"
              name="responsibleName"
              type="text"
              value={formData.responsibleName}
              onChange={handleInputChange}
              className="input"
              placeholder="Nome completo do responsável"
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full mt-6"
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Fornecedor'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já possui uma conta?{' '}
            <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}