import axios from 'axios';

// Crear instancia de axios con configuración base
const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de peticiones: agregar token si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuestas: manejar errores de autenticación
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el error es 401 (no autorizado) en una ruta protegida (NO en /auth/*)
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      
      // No limpiar token si es un error en login/register (credenciales incorrectas)
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        console.log('❌ Token inválido, limpiando sesión...');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        
        // Solo redirigir si no estamos en login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;