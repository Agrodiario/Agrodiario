// src/components/RootRedirector.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function RootRedirector() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Carregando...
      </div>
    );
  }
  
  // Redireciona para a home se autenticado, para landing se não
  return isAuthenticated ? 
    <Navigate to="/home" replace /> : 
    <Navigate to="/landing" replace />;
}