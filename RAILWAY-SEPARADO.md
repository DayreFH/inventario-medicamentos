# 🚂 Guía de Deployment en Railway - Backend y Frontend Separados

Esta guía te ayudará a desplegar el backend y frontend como **proyectos independientes** en Railway.

---

## 📋 ESTRUCTURA DE PROYECTOS

Tendrás **2 proyectos separados** en Railway:

1. **Proyecto Backend** → Contiene: API + Base de Datos MySQL
2. **Proyecto Frontend** → Contiene: Aplicación React

---

## 🎯 PARTE 1: DESPLEGAR BACKEND + BASE DE DATOS

### **Paso 1: Crear Proyecto Backend en Railway**

1. Ve a https://railway.app
2. Haz clic en **"+ New Project"**
3. Nombra el proyecto: **"inventario-backend"** (o el nombre que prefieras)
4. Haz clic en **"Deploy from GitHub Repo"**
5. Selecciona tu repositorio: `inventario-medicamentos`
6. Railway detectará automáticamente el servicio

### **Paso 2: Configurar el Servicio Backend**

1. Railway debería detectar automáticamente que es un proyecto Node.js
2. Si no, haz clic en el servicio → **"Settings"**
3. Configura:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`

### **Paso 3: Crear Base de Datos MySQL**

1. En el mismo proyecto, haz clic en **"+ New"**
2. Selecciona **"Database"** → **"Add MySQL"**
3. Espera a que se cree la base de datos (30 segundos)
4. Haz clic en la base de datos → pestaña **"Variables"**
5. **Copia el valor de `DATABASE_URL`** (lo necesitarás)

### **Paso 4: Configurar Variables de Entorno del Backend**

1. Haz clic en tu servicio **backend**
2. Ve a la pestaña **"Variables"**
3. Haz clic en **"+ New Variable"** y agrega:

```
DATABASE_URL = (pega el DATABASE_URL de la base de datos)
NODE_ENV = production
PORT = 4000
JWT_SECRET = (genera uno con: node generate-jwt-secret.js)
JWT_EXPIRES_IN = 7d
FRONTEND_URL = https://TU-FRONTEND.up.railway.app
```

**⚠️ IMPORTANTE:** 
- `FRONTEND_URL` lo actualizarás después de desplegar el frontend
- Por ahora pon un placeholder o déjalo vacío temporalmente

### **Paso 5: Esperar el Deployment**

1. Railway comenzará a construir automáticamente
2. Ve a **"Deployments"** para ver el progreso
3. Espera a que termine (2-3 minutos)

### **Paso 6: Crear las Tablas de la Base de Datos**

1. Una vez que el backend esté desplegado, haz clic en el servicio backend
2. Ve a **"Deployments"** → Haz clic en el deployment más reciente
3. Haz clic en el botón **"Shell"** (terminal)
4. Ejecuta:

```bash
npx prisma db push
```

5. Espera a que termine (debería decir "The database is already in sync" o crear las tablas)

### **Paso 7: Obtener URL del Backend**

1. Haz clic en tu servicio backend
2. Ve a **"Settings"** → **"Networking"**
3. Haz clic en **"Generate Domain"** (si no tiene uno)
4. **Copia la URL** (algo como: `https://inventario-backend.up.railway.app`)
5. Esta será tu URL del backend: `https://TU-BACKEND.up.railway.app`

✅ **Backend desplegado correctamente!**

---

## 🎨 PARTE 2: DESPLEGAR FRONTEND

### **Paso 1: Crear Proyecto Frontend en Railway**

1. En Railway, haz clic en **"+ New Project"** (nuevo proyecto, separado del backend)
2. Nombra el proyecto: **"inventario-frontend"** (o el nombre que prefieras)
3. Haz clic en **"Deploy from GitHub Repo"**
4. Selecciona el **mismo repositorio**: `inventario-medicamentos`
5. Railway detectará automáticamente el servicio

### **Paso 2: Configurar el Servicio Frontend**

1. Haz clic en el servicio → **"Settings"**
2. Configura:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### **Paso 3: Configurar Variables de Entorno del Frontend**

1. Haz clic en tu servicio **frontend**
2. Ve a la pestaña **"Variables"**
3. Haz clic en **"+ New Variable"** y agrega:

```
VITE_API_URL = https://TU-BACKEND.up.railway.app/api
```

**⚠️ IMPORTANTE:** 
- Reemplaza `TU-BACKEND.up.railway.app` con la URL real de tu backend
- Debe terminar en `/api`

### **Paso 4: Esperar el Deployment**

1. Railway comenzará a construir automáticamente
2. Ve a **"Deployments"** para ver el progreso
3. Espera a que termine (2-3 minutos)

### **Paso 5: Obtener URL del Frontend**

1. Haz clic en tu servicio frontend
2. Ve a **"Settings"** → **"Networking"**
3. Haz clic en **"Generate Domain"** (si no tiene uno)
4. **Copia la URL** (algo como: `https://inventario-frontend.up.railway.app`)
5. Esta será tu URL del frontend: `https://TU-FRONTEND.up.railway.app`

✅ **Frontend desplegado correctamente!**

---

## 🔄 PARTE 3: CONECTAR BACKEND Y FRONTEND

### **Paso 1: Actualizar FRONTEND_URL en el Backend**

1. Vuelve a tu **proyecto backend** en Railway
2. Haz clic en el servicio backend → **"Variables"**
3. Actualiza `FRONTEND_URL` con la URL real de tu frontend:

```
FRONTEND_URL = https://TU-FRONTEND.up.railway.app
```

4. Railway se redesplegará automáticamente

### **Paso 2: Verificar que Todo Funciona**

1. Abre tu navegador en la URL del frontend
2. Deberías ver la aplicación cargando
3. Intenta hacer login o registrar un usuario
4. Si hay errores, revisa la consola del navegador (F12)

---

## 📊 RESUMEN DE CONFIGURACIÓN

### **Proyecto 1: Backend**
- **Nombre**: `inventario-backend`
- **Root Directory**: `backend`
- **Build Command**: `npm install && npx prisma generate`
- **Start Command**: `npm start`
- **Variables**:
  - `DATABASE_URL` (de la base de datos)
  - `NODE_ENV=production`
  - `PORT=4000`
  - `JWT_SECRET` (generar uno seguro)
  - `JWT_EXPIRES_IN=7d`
  - `FRONTEND_URL` (URL del frontend)

### **Proyecto 2: Frontend**
- **Nombre**: `inventario-frontend`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Variables**:
  - `VITE_API_URL` (URL del backend + `/api`)

### **Base de Datos**
- **Ubicación**: Dentro del proyecto backend
- **Tipo**: MySQL
- **Variable**: `DATABASE_URL` (automática)

---

## 🔍 VERIFICACIÓN Y PRUEBAS

### **Probar el Backend:**

Abre en tu navegador:
```
https://TU-BACKEND.up.railway.app/api/health
```

Deberías ver:
```json
{"ok":true}
```

### **Probar el Frontend:**

Abre en tu navegador:
```
https://TU-FRONTEND.up.railway.app
```

Deberías ver la página de login o la aplicación.

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### **Error: "Failed to connect to database"**
- Verifica que `DATABASE_URL` esté correctamente configurada
- Asegúrate de que la base de datos esté en el mismo proyecto que el backend
- Verifica que ejecutaste `npx prisma db push` en el shell

### **Error: "CORS" en el navegador**
- Verifica que `FRONTEND_URL` en el backend sea EXACTAMENTE igual a tu URL de frontend
- No incluyas `/` al final de la URL
- Asegúrate de que el backend se haya redesplegado después de cambiar `FRONTEND_URL`

### **Error: "API not responding"**
- Verifica que `VITE_API_URL` termine en `/api`
- Verifica que el backend esté corriendo (revisa los logs)
- Asegúrate de que la URL del backend sea correcta

### **Frontend muestra página en blanco**
- Revisa la consola del navegador (F12) para ver errores
- Verifica que `VITE_API_URL` esté correctamente configurada
- Revisa los logs del frontend en Railway

### **Backend se reinicia constantemente**
- Revisa los logs en Railway → "Deployments" → "View Logs"
- Verifica que todas las variables de entorno estén correctas
- Asegúrate de que la base de datos esté accesible

---

## 🔄 ACTUALIZACIONES FUTURAS

### **Actualizar Backend:**
```bash
git add .
git commit -m "Actualización del backend"
git push
```
Railway se actualizará automáticamente.

### **Actualizar Frontend:**
```bash
git add .
git commit -m "Actualización del frontend"
git push
```
Railway se actualizará automáticamente.

---

## 💰 COSTOS

### **Railway:**
- **Gratis**: $5 USD de crédito mensual
- **Hobby**: $5 USD/mes
- **Pro**: Desde $20 USD/mes

### **Estimado:**
Con dos servicios (backend + frontend) y una base de datos:
- **Backend**: ~$2-3 USD/mes
- **Frontend**: ~$2-3 USD/mes
- **Base de Datos**: ~$1-2 USD/mes
- **Total**: ~$5-8 USD/mes (puede estar cubierto por el crédito gratuito)

---

## ✅ CHECKLIST FINAL

- [ ] Proyecto backend creado en Railway
- [ ] Base de datos MySQL creada
- [ ] Backend desplegado y funcionando
- [ ] Tablas de base de datos creadas (`npx prisma db push`)
- [ ] URL del backend copiada
- [ ] Proyecto frontend creado en Railway (separado)
- [ ] Frontend desplegado y funcionando
- [ ] `VITE_API_URL` configurada en frontend
- [ ] `FRONTEND_URL` configurada en backend
- [ ] Aplicación accesible y funcionando
- [ ] Login/Registro funcionando
- [ ] HTTPS activo en ambos servicios

---

## 🎉 ¡LISTO!

Tu aplicación está desplegada con backend y frontend en proyectos separados en Railway.

**Ventajas de esta configuración:**
- ✅ Escalado independiente
- ✅ Monitoreo separado
- ✅ Logs independientes
- ✅ Actualizaciones independientes
- ✅ Mejor organización

---

**¿Necesitas ayuda con algún paso específico?** Revisa los logs en Railway o consulta la documentación oficial: https://docs.railway.app

