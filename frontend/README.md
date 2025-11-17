# 💊 Sistema de Inventario de Medicamentos - Frontend

Aplicación web React para el sistema de gestión de inventario de medicamentos.

## 🚀 Tecnologías

- **React** 19.x
- **Vite** 7.x
- **React Router** 7.x
- **TanStack Query** 5.x
- **Chart.js** 4.x
- **Axios** 1.x

## 📋 Requisitos

- Node.js v20.19.0 o superior
- npm v10.x o superior

## 🔧 Instalación

```bash
# Instalar dependencias
npm install
```

## ⚙️ Configuración

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:4000/api
```

Para producción, usa la URL de tu backend desplegado:

```env
VITE_API_URL=https://tu-backend.railway.app/api
```

## 🏃 Ejecutar

```bash
# Modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Preview de producción
npm run preview
```

## 📁 Estructura

```
frontend/
├── src/
│   ├── api/           # Configuración de API
│   ├── components/     # Componentes reutilizables
│   ├── contexts/       # Contextos de React
│   ├── pages/          # Páginas de la aplicación
│   └── utils/          # Utilidades
├── public/             # Archivos estáticos
└── vite.config.js      # Configuración de Vite
```

## 🎨 Páginas

- `/` - Home
- `/login` - Inicio de sesión
- `/dashboard` - Dashboard principal
- `/medicines` - Gestión de medicamentos
- `/suppliers` - Proveedores
- `/customers` - Clientes
- `/receipts` - Recibos de compra
- `/sales` - Ventas
- `/reports` - Reportes financieros
- `/exchange-rates` - Tasas de cambio
- `/exchange-rates-mn` - Tasas de cambio MN
- `/shipping-rates` - Tasas de envío
- `/utility-rates` - Tasas de utilidad

## 🔒 Autenticación

La aplicación usa JWT para autenticación. El token se almacena en `localStorage` y se envía automáticamente en todas las peticiones.

## 🚀 Deployment

### Railway

Este proyecto está configurado para Railway. Ver `railway.json` para detalles.

1. Conecta tu repositorio a Railway
2. Configura la variable `VITE_API_URL` con la URL de tu backend
3. Railway detectará automáticamente la configuración

### Vercel

También puedes usar Vercel. Ver `vercel.json` para detalles.

1. Conecta tu repositorio a Vercel
2. Configura la variable `VITE_API_URL`
3. Vercel desplegará automáticamente

### Variables de Entorno en Producción

```env
VITE_API_URL=https://tu-backend.railway.app/api
```

## 📚 Scripts Disponibles

```bash
npm run dev      # Desarrollo
npm run build    # Compilar para producción
npm run preview  # Preview de producción
npm run lint     # Linter
```

## 🔗 Backend

El backend de esta aplicación está en un repositorio separado:
- Repositorio Backend: `inventario-medicamentos-backend`

## 📄 Licencia

Privado - Uso interno
