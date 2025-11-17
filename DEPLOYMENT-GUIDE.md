# 🚀 Guía de Deployment - Sistema de Inventario de Medicamentos

Esta guía te ayudará a subir tu aplicación a internet paso a paso.

---

## 📋 TABLA DE CONTENIDOS

1. [Opción 1: Railway + Vercel (RECOMENDADA - GRATIS)](#opción-1-railway--vercel-recomendada)
2. [Opción 2: Render (Todo en uno)](#opción-2-render)
3. [Opción 3: VPS Profesional](#opción-3-vps-profesional)
4. [Preparación Inicial](#preparación-inicial)

---

## 🎯 OPCIÓN 1: RAILWAY + VERCEL (RECOMENDADA)

### **Ventajas:**
- ✅ 100% Gratis para empezar ($5 crédito mensual en Railway)
- ✅ SSL automático (HTTPS)
- ✅ Despliegue automático desde GitHub
- ✅ Fácil de configurar

### **Stack:**
- **Base de Datos MySQL**: Railway
- **Backend (API)**: Railway
- **Frontend**: Vercel

---

## 📝 PREPARACIÓN INICIAL

### **Paso 0: Crear cuenta en GitHub**

1. Ve a https://github.com y crea una cuenta (si no tienes)
2. Instala Git en tu computadora: https://git-scm.com/downloads
3. Configura Git:
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### **Paso 1: Subir el proyecto a GitHub**

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
# Inicializar repositorio Git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "Preparación para deployment"

# Crear repositorio en GitHub (ve a github.com/new)
# Luego conecta tu repositorio local:
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git branch -M main
git push -u origin main
```

---

## 🚂 PARTE 1: DESPLEGAR BASE DE DATOS Y BACKEND EN RAILWAY

### **Paso 1: Crear cuenta en Railway**

1. Ve a https://railway.app
2. Haz clic en "Start a New Project"
3. Inicia sesión con GitHub

### **Paso 2: Crear base de datos MySQL**

1. En Railway, haz clic en "+ New"
2. Selecciona "Database" → "Add MySQL"
3. Espera a que se cree la base de datos
4. Haz clic en la base de datos → pestaña "Variables"
5. **Copia el valor de `DATABASE_URL`** (lo necesitarás después)

### **Paso 3: Desplegar el Backend**

1. En Railway, haz clic en "+ New"
2. Selecciona "GitHub Repo"
3. Conecta tu repositorio de GitHub
4. Selecciona tu repositorio `inventario-medicamentos`

### **Paso 4: Configurar Variables de Entorno del Backend**

1. Haz clic en tu servicio de backend
2. Ve a la pestaña "Variables"
3. Agrega las siguientes variables:

```
DATABASE_URL=mysql://usuario:password@host:3306/database
# ⬆️ Pega el DATABASE_URL que copiaste de la base de datos

NODE_ENV=production

PORT=4000

JWT_SECRET=GENERA_UNA_CLAVE_SEGURA_AQUI
# ⬆️ Genera una clave con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

JWT_EXPIRES_IN=7d

FRONTEND_URL=https://tu-app.vercel.app
# ⬆️ Lo cambiarás después de desplegar el frontend
```

### **Paso 5: Configurar el Build**

1. En Railway, haz clic en tu servicio backend
2. Ve a "Settings" → "Build"
3. Configura:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`

### **Paso 6: Ejecutar Migraciones**

1. En Railway, haz clic en tu servicio backend
2. Ve a la pestaña "Deployments"
3. Espera a que termine el deployment
4. Ve a "Settings" → "Service"
5. Copia la URL pública (algo como: `https://tu-backend.railway.app`)

### **Paso 7: Crear las tablas de la base de datos**

En Railway, abre la terminal del servicio backend:

1. Haz clic en tu servicio backend
2. Ve a "Deployments" → "View Logs"
3. Haz clic en el botón de terminal (Shell)
4. Ejecuta:
```bash
cd backend
npx prisma db push
```

✅ **Backend desplegado correctamente!**

---

## ▲ PARTE 2: DESPLEGAR FRONTEND EN VERCEL

### **Paso 1: Crear cuenta en Vercel**

1. Ve a https://vercel.com
2. Haz clic en "Sign Up"
3. Inicia sesión con GitHub

### **Paso 2: Importar el proyecto**

1. Haz clic en "Add New" → "Project"
2. Selecciona tu repositorio `inventario-medicamentos`
3. Configura el proyecto:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### **Paso 3: Configurar Variables de Entorno**

En Vercel, antes de desplegar:

1. Expande "Environment Variables"
2. Agrega:
```
VITE_API_URL=https://tu-backend.railway.app/api
```
⬆️ Pega la URL de tu backend de Railway + `/api`

### **Paso 4: Desplegar**

1. Haz clic en "Deploy"
2. Espera a que termine el deployment (2-3 minutos)
3. **Copia la URL de tu frontend** (algo como: `https://inventario-medicamentos.vercel.app`)

### **Paso 5: Actualizar CORS en el Backend**

1. Vuelve a Railway
2. Abre tu servicio backend
3. Ve a "Variables"
4. Actualiza `FRONTEND_URL` con la URL de Vercel:
```
FRONTEND_URL=https://inventario-medicamentos.vercel.app
```

✅ **¡Aplicación completamente desplegada!**

---

## 🎉 VERIFICACIÓN FINAL

1. Abre tu aplicación en: `https://tu-app.vercel.app`
2. Verifica que la página cargue correctamente
3. Intenta hacer login o registrar un usuario
4. Verifica que el backend responda correctamente

---

## 🔧 SOLUCIÓN DE PROBLEMAS COMUNES

### **Error: "Failed to connect to database"**
- Verifica que `DATABASE_URL` esté correctamente configurada en Railway
- Asegúrate de que el backend pueda conectarse a la base de datos

### **Error: "CORS"**
- Verifica que `FRONTEND_URL` en Railway coincida exactamente con tu URL de Vercel
- No incluyas `/` al final de la URL

### **Error: "API not responding"**
- Verifica que `VITE_API_URL` en Vercel termine en `/api`
- Verifica que el backend esté corriendo en Railway

### **Backend se reinicia constantemente**
- Revisa los logs en Railway → "Deployments" → "View Logs"
- Verifica que las variables de entorno estén correctas

---

## 🔄 ACTUALIZACIONES FUTURAS

### **Actualizar el Backend:**
```bash
git add .
git commit -m "Actualización del backend"
git push
```
Railway se actualiza automáticamente.

### **Actualizar el Frontend:**
```bash
git add .
git commit -m "Actualización del frontend"
git push
```
Vercel se actualiza automáticamente.

---

## 💰 COSTOS

### **Railway:**
- **Gratis**: $5 USD de crédito mensual
- **Hobby**: $5 USD/mes
- **Pro**: Desde $20 USD/mes

### **Vercel:**
- **Hobby**: Gratis ilimitado
- **Pro**: $20 USD/mes

### **Estimado:**
Tu aplicación debería funcionar **GRATIS** con los créditos de Railway si el tráfico es bajo/moderado.

---

## 🌐 OPCIÓN 2: RENDER (TODO EN UNO)

Si prefieres usar un solo servicio:

### **Ventajas:**
- ✅ Todo en un solo lugar
- ✅ Tier gratuito generoso
- ✅ Fácil de usar

### **Desventajas:**
- ⚠️ Servicios gratuitos "duermen" después de 15 min de inactividad
- ⚠️ Primer request después de dormir es lento (15-30 segundos)

### **Pasos rápidos:**

1. Ve a https://render.com
2. Crea cuenta con GitHub
3. Crea un **PostgreSQL Database** (gratis) o **MySQL** (de pago)
4. Crea un **Web Service** para el backend:
   - Conecta tu repo de GitHub
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate && npx prisma db push`
   - Start Command: `npm start`
   - Agrega las variables de entorno
5. Crea un **Static Site** para el frontend:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Agrega `VITE_API_URL`

---

## 🖥️ OPCIÓN 3: VPS PROFESIONAL

Para aplicaciones en producción con muchos usuarios:

### **Proveedores recomendados:**
- **DigitalOcean**: Desde $4 USD/mes
- **Linode**: Desde $5 USD/mes
- **Vultr**: Desde $2.50 USD/mes
- **AWS Lightsail**: Desde $3.50 USD/mes

### **Configuración requerida:**
- Ubuntu 22.04 LTS
- Node.js 20.x
- MySQL 8.0
- Nginx (reverse proxy)
- Certbot (SSL gratis con Let's Encrypt)
- PM2 (process manager)

*Esta opción requiere conocimientos de administración de servidores Linux.*

---

## 📞 SOPORTE

Si tienes problemas durante el deployment:

1. Revisa los logs en Railway/Vercel
2. Verifica las variables de entorno
3. Asegúrate de que las URLs no tengan typos
4. Verifica que el repositorio de GitHub esté actualizado

---

## ✅ CHECKLIST FINAL

- [ ] Proyecto subido a GitHub
- [ ] Base de datos MySQL creada en Railway
- [ ] Backend desplegado en Railway
- [ ] Variables de entorno configuradas en Railway
- [ ] Tablas de base de datos creadas (prisma db push)
- [ ] Frontend desplegado en Vercel
- [ ] VITE_API_URL configurada en Vercel
- [ ] FRONTEND_URL actualizada en Railway
- [ ] Aplicación accesible y funcionando
- [ ] Login/Registro funcionando
- [ ] HTTPS activo en ambos servicios

---

¡Felicidades! Tu aplicación está en línea 🎉


