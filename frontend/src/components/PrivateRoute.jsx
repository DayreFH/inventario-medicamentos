import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente para proteger rutas privadas
 * Redirige a login si el usuario no está autenticado
 */
export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  console.log('🔒 PrivateRoute:', { loading, user: user ? user.name : 'NO AUTH' });

  // Mientras carga, mostrar un spinner o pantalla de carga
  if (loading) {
    console.log('⏳ PrivateRoute: Mostrando spinner de carga...');
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e9ecef',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6c757d', fontSize: '14px' }}>Verificando sesión...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Si no hay usuario, redirigir a login
  if (!user) {
    console.log('❌ PrivateRoute: No hay usuario, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  // Usuario autenticado, mostrar contenido
  console.log('✅ PrivateRoute: Usuario autenticado, mostrando contenido');
  return children;
}


