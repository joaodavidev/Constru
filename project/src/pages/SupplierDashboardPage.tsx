import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SupplierDashboardPage() {
  const navigate = useNavigate();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Painel do Fornecedor</h1>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        onClick={() => navigate('/criar-produto')}
      >
        Criar Produto
      </button>
      {/* ...aqui pode listar produtos, ofertas, endereços, etc... */}
    </div>
  );
}
