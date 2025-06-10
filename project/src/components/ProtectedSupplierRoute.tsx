import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedSupplierRouteProps {
  children: React.ReactNode;
}

export default function ProtectedSupplierRoute({ children }: ProtectedSupplierRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.tipo_usuario !== 'fornecedor') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
