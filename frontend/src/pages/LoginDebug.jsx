import { useState } from 'react';
import axios from 'axios';

export default function LoginDebug() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('test123456');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const testLogin = async () => {
    console.log('🧪 Probando login directo...');
    setResponse(null);
    setError(null);

    try {
      console.log('Enviando petición a: http://localhost:4000/api/auth/login');
      console.log('Datos:', { email, password: '***' });

      const result = await axios.post('http://localhost:4000/api/auth/login', {
        email,
        password
      });

      console.log('✅ Respuesta exitosa:', result.data);
      setResponse(JSON.stringify(result.data, null, 2));
      
      // Guardar en localStorage
      localStorage.setItem('auth_token', result.data.token);
      localStorage.setItem('auth_user', JSON.stringify(result.data.user));
      
      alert('Login exitoso! Token guardado. Ahora puedes ir a /dashboard');
      
    } catch (err) {
      console.error('❌ Error:', err);
      const errorMsg = err.response?.data?.message || err.message;
      setError(JSON.stringify({
        status: err.response?.status,
        error: err.response?.data?.error,
        message: err.response?.data?.message,
        fullError: err.message
      }, null, 2));
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ Storage limpiado');
    alert('Storage limpiado');
  };

  const checkStorage = () => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    
    console.log('Token:', token);
    console.log('User:', user);
    
    alert(`Token: ${token ? 'EXISTE' : 'NO EXISTE'}\nUser: ${user ? 'EXISTE' : 'NO EXISTE'}`);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 Debug de Login</h1>
      
      <div style={{ marginBottom: '20px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
        <h3>Estado del Sistema</h3>
        <p>Backend: <a href="http://localhost:4000/api/health" target="_blank">http://localhost:4000/api/health</a></p>
        <p>Frontend: http://localhost:5173</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
        />
        
        <label style={{ display: 'block', marginBottom: '8px' }}>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={testLogin} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Probar Login
        </button>
        <button onClick={clearStorage} style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Limpiar Storage
        </button>
        <button onClick={checkStorage} style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Ver Storage
        </button>
      </div>

      {response && (
        <div style={{ marginBottom: '20px', padding: '20px', background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '8px' }}>
          <h3 style={{ color: '#155724' }}>✅ Respuesta Exitosa:</h3>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>{response}</pre>
        </div>
      )}

      {error && (
        <div style={{ marginBottom: '20px', padding: '20px', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '8px' }}>
          <h3 style={{ color: '#721c24' }}>❌ Error:</h3>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>{error}</pre>
        </div>
      )}

      <div style={{ padding: '20px', background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '8px' }}>
        <h3>📝 Instrucciones:</h3>
        <ol>
          <li>Haz clic en "Limpiar Storage" primero</li>
          <li>Luego haz clic en "Probar Login"</li>
          <li>Revisa la consola del navegador (F12)</li>
          <li>Si es exitoso, ve a <a href="/dashboard">/dashboard</a></li>
        </ol>
        
        <h3 style={{ marginTop: '20px' }}>🔑 Credenciales de Prueba:</h3>
        <p><strong>Email:</strong> test@example.com</p>
        <p><strong>Password:</strong> test123456</p>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a href="/login" style={{ color: '#007bff' }}>← Volver al Login Normal</a>
      </div>
    </div>
  );
}

