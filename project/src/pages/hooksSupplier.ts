import { useEffect, useState } from 'react';
import { Oferta, Endereco } from '../types/supplier';
import { API_BASE_URL } from '../api';

export function useSupplierOfertas(fornecedorId: number | string | undefined) {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fornecedorId) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/ofertas?fornecedor_id=${fornecedorId}`)
      .then(res => res.json())
      .then(data => {
        setOfertas(data);
        setError(null);
      })
      .catch(() => setError('Erro ao buscar anúncios'))
      .finally(() => setLoading(false));
  }, [fornecedorId]);

  return { ofertas, loading, error, setOfertas };
}

export function useSupplierEnderecos(usuarioId: number | string | undefined) {
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!usuarioId) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/enderecos?usuario_id=${usuarioId}`)
      .then(res => res.json())
      .then(data => {
        setEnderecos(data);
        setError(null);
      })
      .catch(() => setError('Erro ao buscar endereços'))
      .finally(() => setLoading(false));
  }, [usuarioId]);

  return { enderecos, loading, error, setEnderecos };
}
