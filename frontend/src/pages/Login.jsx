import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Para registro
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Error al iniciar sesión');
        console.error('Error en login:', result);
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
      console.error('Error catch en login:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validaciones
    if (!registerName || !registerEmail || !registerPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }
    
    if (registerPassword !== registerConfirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (registerPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await register(registerEmail, registerPassword, registerName);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        // Mostrar error más detallado
        const errorMsg = result.error || 'Error al registrar usuario';
        setError(errorMsg);
        console.error('Error en registro:', result);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al registrar usuario';
      setError(errorMsg);
      console.error('Error catch en registro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      overflow: 'hidden',
      margin: 0,
      padding: 0
    }}>
        {/* Columna izquierda - Imagen como fondo (oculta en móvil) */}
        {!isMobile && <div style={{
          backgroundImage: 'url(/welcome-hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '40px 60px 60px 60px',
          position: 'relative',
          height: '100vh',
          overflow: 'hidden'
        }}>
          {/* Overlay oscuro solo en la parte inferior para los textos */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.8) 100%)',
            zIndex: 0
          }}></div>
          
          {/* Textos en la parte inferior con espacio reducido */}
          <div style={{
            textAlign: 'center',
            color: 'white',
            zIndex: 1,
            position: 'relative',
            width: '100%',
            maxWidth: '600px',
            paddingBottom: '20px'
          }}>
            <h2 style={{
              fontSize: '34px',
              fontWeight: 'bold',
              marginBottom: '4px',
              textShadow: '0 4px 12px rgba(0,0,0,0.9)',
              lineHeight: '1.1'
            }}>
              💊 Inventario de Medicamentos
            </h2>
            <h3 style={{
              fontSize: '26px',
              fontWeight: '600',
              marginBottom: '4px',
              textShadow: '0 4px 12px rgba(0,0,0,0.9)',
              lineHeight: '1.1'
            }}>
              Sistema de Gestión
            </h3>
            <p style={{
              fontSize: '18px',
              lineHeight: '1.3',
              margin: '0',
              textShadow: '0 2px 8px rgba(0,0,0,0.9)',
              opacity: 0.95
            }}>
              Controla tu inventario de medicamentos de manera eficiente y segura
            </p>
          </div>
        </div>}

        {/* Columna derecha - Formulario */}
        <div style={{
          padding: isMobile ? '30px' : '60px',
          background: '#ffffff',
          height: '100vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
        {/* Título */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          {isMobile && (
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#667eea',
                margin: '0 0 12px 0'
              }}>
                💊 Inventario de Medicamentos
              </h2>
            </div>
          )}
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#2c3e50',
            marginBottom: '12px'
          }}>
            {showRegister ? '👋 Crear Cuenta' : '🔐 Iniciar Sesión'}
          </h1>
          <p style={{ color: '#6c757d', fontSize: '16px' }}>
            {showRegister ? 'Completa el formulario para registrarte' : 'Ingresa tus credenciales para continuar'}
          </p>
        </div>

        {/* Mensajes de error */}
        {error && (
          <div style={{
            padding: '16px 20px',
            background: '#ff4444',
            border: '2px solid #cc0000',
            borderRadius: '8px',
            color: '#ffffff',
            marginBottom: '24px',
            fontSize: '15px',
            fontWeight: '500',
            boxShadow: '0 4px 8px rgba(255,68,68,0.3)',
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Formularios */}
        {!showRegister ? (
          /* FORMULARIO DE LOGIN */
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#495057',
                fontSize: '14px'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#495057',
                fontSize: '14px'
              }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#a0a0a0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s',
                marginBottom: '16px'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <p style={{ color: '#6c757d', fontSize: '14px' }}>
                ¿No tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setShowRegister(true);
                    setError(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    cursor: 'pointer',
                    fontWeight: '600',
                    textDecoration: 'underline'
                  }}
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* FORMULARIO DE REGISTRO */
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#495057',
                fontSize: '14px'
              }}>
                Nombre completo
              </label>
              <input
                type="text"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                required
                placeholder="Juan Pérez"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#495057',
                fontSize: '14px'
              }}>
                Email
              </label>
              <input
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#495057',
                fontSize: '14px'
              }}>
                Contraseña
              </label>
              <input
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
                placeholder="Mínimo 6 caracteres"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#495057',
                fontSize: '14px'
              }}>
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={registerConfirmPassword}
                onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                required
                placeholder="Repite la contraseña"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#a0a0a0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s',
                marginBottom: '16px'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <p style={{ color: '#6c757d', fontSize: '14px' }}>
                ¿Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setShowRegister(false);
                    setError(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    cursor: 'pointer',
                    fontWeight: '600',
                    textDecoration: 'underline'
                  }}
                >
                  Inicia sesión
                </button>
              </p>
            </div>
          </form>
        )}
        </div>
    </div>
  );
}

