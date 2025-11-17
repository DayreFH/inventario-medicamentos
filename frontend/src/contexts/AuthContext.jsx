import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/http';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const loadUser = async () => {
      console.log('🔄 AuthContext: Cargando usuario...');
      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');

      console.log('   - Token en localStorage:', token ? 'SÍ' : 'NO');
      console.log('   - Usuario en localStorage:', savedUser ? 'SÍ' : 'NO');

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          console.log('   - Usuario parseado:', parsedUser.name);
          
          // Verificar que el token siga siendo válido
          console.log('   - Verificando token con /auth/me...');
          const { data } = await api.get('/auth/me');
          setUser(data.user);
          localStorage.setItem('auth_user', JSON.stringify(data.user));
          console.log('✅ AuthContext: Usuario verificado:', data.user.name);
        } catch (error) {
          console.error('❌ AuthContext: Error verificando sesión:', error.message);
          // Si el token no es válido, limpiar
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setUser(null);
          console.log('   - Token inválido, sesión limpiada');
        }
      } else {
        console.log('   - No hay sesión guardada');
      }
      
      setLoading(false);
      console.log('✅ AuthContext: Carga completada, loading=false');
    };

    loadUser();
  }, []);

  // Registrar usuario
  const register = async (email, password, name) => {
    try {
      setError(null);
      console.log('Intentando registrar:', { email, name });
      const { data } = await api.post('/auth/register', { email, password, name });
      
      // Guardar token y usuario
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      setUser(data.user);
      
      console.log('Registro exitoso:', data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error completo en registro:', error);
      console.error('Error response:', error.response);
      
      // Extraer mensaje de error más detallado
      let errorMsg = 'Error al registrar usuario';
      
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.data?.details) {
        errorMsg = error.response.data.details.map(d => d.message).join(', ');
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Iniciar sesión
  const login = async (email, password) => {
    try {
      setError(null);
      console.log('Intentando login:', { email });
      const { data } = await api.post('/auth/login', { email, password });
      
      // Guardar token y usuario
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      setUser(data.user);
      
      console.log('Login exitoso:', data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Error completo en login:', error);
      console.error('Error response:', error.response);
      
      // Extraer mensaje de error más detallado
      let errorMsg = 'Error al iniciar sesión';
      
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Cerrar sesión
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setError(null);
  };

  // Cambiar contraseña
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      await api.post('/auth/change-password', { currentPassword, newPassword });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error al cambiar contraseña';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Refrescar token
  const refreshToken = async () => {
    try {
      const { data } = await api.post('/auth/refresh');
      localStorage.setItem('auth_token', data.token);
      return { success: true };
    } catch (error) {
      console.error('Error refrescando token:', error);
      return { success: false };
    }
  };

  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return !!user;
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Verificar si el usuario es admin
  const isAdmin = () => {
    return hasRole('admin');
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    changePassword,
    refreshToken,
    isAuthenticated,
    hasRole,
    isAdmin,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

