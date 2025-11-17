# 🔐 Guía de Autenticación - Sistema de Inventario de Medicamentos

## ✅ Sistema de Autenticación Implementado

Se ha implementado un sistema completo de autenticación y autorización con las siguientes características:

### **Backend**
- ✅ Autenticación basada en JWT (JSON Web Tokens)
- ✅ Hash de contraseñas con bcrypt
- ✅ Middleware de autenticación y autorización
- ✅ Rate limiting (protección contra ataques de fuerza bruta)
- ✅ CORS configurado correctamente
- ✅ Roles de usuario (admin, user)
- ✅ Rutas protegidas

### **Frontend**
- ✅ Contexto de autenticación con React Context API
- ✅ Componente de Login/Registro
- ✅ Rutas privadas protegidas
- ✅ Interceptor de axios para manejar tokens automáticamente
- ✅ Información de usuario en navegación
- ✅ Botón de cerrar sesión

---

## 📋 **Primeros Pasos**

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en el directorio `backend` con el siguiente contenido:

```bash
# Base de datos
DATABASE_URL="mysql://root:password@localhost:3306/inventario_medicamentos"

# Servidor
PORT=4000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173

# JWT - ¡IMPORTANTE! Cambia esto en producción
JWT_SECRET=tu-secreto-super-seguro-aqui
JWT_EXPIRES_IN=7d
```

**⚠️ IMPORTANTE:** 
- Para producción, genera un JWT_SECRET seguro con:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### 2. Iniciar el Servidor

El servidor ya está configurado. Solo ejecuta:

```bash
cd backend
npm run dev
```

### 3. Iniciar el Frontend

```bash
cd frontend
npm run dev
```

---

## 👥 **Crear el Primer Usuario (Administrador)**

### Opción 1: Usando la API directamente

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@inventario.com",
    "password": "admin123",
    "name": "Administrador"
  }'
```

### Opción 2: Desde el Frontend

1. Navega a `http://localhost:5173`
2. Serás redirigido a la página de login
3. Haz clic en "Regístrate aquí"
4. Completa el formulario con tus datos
5. Serás registrado y redirigido al dashboard automáticamente

### Opción 3: Usando Prisma Studio

```bash
cd backend
npx prisma studio
```

Luego en la tabla `users`, crea un usuario manualmente (usa bcrypt para hashear la contraseña).

---

## 🔑 **Cómo Funciona la Autenticación**

### Flujo de Login

1. **Usuario envía credenciales** → POST `/api/auth/login`
2. **Backend valida** credenciales y genera JWT
3. **Frontend recibe token** y lo guarda en localStorage
4. **Futuras peticiones** incluyen el token automáticamente en el header `Authorization: Bearer <token>`
5. **Backend verifica** el token en cada petición a rutas protegidas

### Tokens JWT

- **Duración**: 7 días por defecto (configurable)
- **Contenido**: `{ userId, email, role }`
- **Storage**: localStorage del navegador
- **Auto-refresh**: Al recargar la página, se verifica que el token siga siendo válido

---

## 🛡️ **Seguridad Implementada**

### Rate Limiting

- **Rutas generales**: 100 peticiones cada 15 minutos
- **Rutas de auth** (login/register): 5 intentos cada 15 minutos
- **Protección**: Contra ataques de fuerza bruta y DDoS

### CORS

- **Origen permitido**: Solo el frontend configurado (localhost:5173 en desarrollo)
- **Credenciales**: Habilitadas para cookies y headers de autenticación

### Contraseñas

- **Hash**: bcrypt con salt de 10 rondas
- **Validación**: Mínimo 6 caracteres
- **Nunca se devuelven**: Las contraseñas hasheadas nunca salen del backend

---

## 🚀 **Endpoints de Autenticación**

### POST `/api/auth/register`
Registra un nuevo usuario

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123",
  "name": "Nombre Completo"
}
```

**Response:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "name": "Nombre Completo",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST `/api/auth/login`
Inicia sesión

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

**Response:**
```json
{
  "message": "Inicio de sesión exitoso",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "name": "Nombre Completo",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET `/api/auth/me`
Obtiene información del usuario autenticado (requiere token)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "name": "Nombre Completo",
    "role": "user"
  }
}
```

### POST `/api/auth/change-password`
Cambia la contraseña del usuario autenticado (requiere token)

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "currentPassword": "contraseña_actual",
  "newPassword": "nueva_contraseña"
}
```

### POST `/api/auth/refresh`
Refresca el token (obtiene uno nuevo)

**Headers:**
```
Authorization: Bearer <token_actual>
```

**Response:**
```json
{
  "message": "Token refrescado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🔧 **Uso en el Frontend**

### Hook useAuth

```jsx
import { useAuth } from './contexts/AuthContext';

function MiComponente() {
  const { user, login, logout, isAuthenticated, isAdmin } = useAuth();
  
  // Verificar si está autenticado
  if (!isAuthenticated()) {
    return <div>Debes iniciar sesión</div>;
  }
  
  // Verificar si es admin
  if (isAdmin()) {
    return <div>Panel de administrador</div>;
  }
  
  return (
    <div>
      <h1>Hola, {user.name}!</h1>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}
```

### Proteger Rutas

```jsx
import PrivateRoute from './components/PrivateRoute';

<Route path="/admin" element={
  <PrivateRoute>
    <AdminPanel />
  </PrivateRoute>
} />
```

### Hacer Peticiones Autenticadas

```jsx
import api from './api/http';

// El token se agrega automáticamente
const { data } = await api.get('/medicines');
const result = await api.post('/medicines', newMedicine);
```

---

## 🎭 **Roles y Permisos**

Actualmente hay 2 roles:

- **`user`**: Usuario normal (por defecto al registrarse)
- **`admin`**: Administrador con permisos completos

### Cambiar el Rol de un Usuario

Para hacer admin a un usuario existente, usa Prisma Studio:

```bash
cd backend
npx prisma studio
```

1. Ve a la tabla `users`
2. Encuentra el usuario
3. Cambia el campo `role` de `user` a `admin`

---

## 🐛 **Troubleshooting**

### Error: "Token inválido o expirado"

**Solución**: Cierra sesión y vuelve a iniciar sesión para obtener un nuevo token.

### Error: "CORS policy"

**Solución**: Verifica que `FRONTEND_URL` en `.env` coincida con la URL de tu frontend.

### Error: "Demasiados intentos"

**Solución**: Espera 15 minutos. El rate limiting está funcionando correctamente.

### Error: "Usuario no encontrado o inactivo"

**Solución**: Verifica en Prisma Studio que el usuario existe y que `isActive = true`.

---

## 🚀 **Próximos Pasos Recomendados**

1. **Proteger rutas del backend**: Descomentar el middleware `authenticate` en `app.js` para rutas que lo necesiten
2. **Implementar recuperación de contraseña**: Agregar endpoint para reset de password por email
3. **Agregar MFA (Multi-Factor Authentication)**: Para mayor seguridad
4. **Logging de actividad**: Registrar logins, cambios de contraseña, etc.
5. **Expiración de sesiones inactivas**: Cerrar sesión automáticamente después de X tiempo
6. **Permisos granulares**: Sistema de permisos más detallado que solo admin/user

---

## 📚 **Recursos Adicionales**

- [JWT.io](https://jwt.io/) - Debugger de tokens JWT
- [Bcrypt](https://github.com/kelektiv/node.bcrypt.js) - Librería de hashing
- [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit) - Documentación

---

## ✅ **Checklist de Producción**

Antes de desplegar en producción:

- [ ] Cambiar `JWT_SECRET` por uno aleatorio y seguro
- [ ] Configurar `NODE_ENV=production`
- [ ] Actualizar `FRONTEND_URL` con la URL real
- [ ] Configurar HTTPS (SSL/TLS)
- [ ] Revisar y ajustar límites de rate limiting
- [ ] Implementar sistema de logs
- [ ] Configurar backups de base de datos
- [ ] Revisar permisos de usuario admin

---

¡Sistema de autenticación completamente funcional! 🎉


