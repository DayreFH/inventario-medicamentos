# 🌐 Guía Rápida de Deployment

## 🚀 Opción Más Rápida: Railway + Vercel (GRATIS)

### ⏱️ Tiempo estimado: 20-30 minutos

---

## 📋 LISTA DE PASOS RÁPIDOS

### **Paso 1: Preparar GitHub** (5 min)

```bash
# En PowerShell, dentro de la carpeta del proyecto:
git init
git add .
git commit -m "Primer commit para deployment"

# Crear repo en GitHub: https://github.com/new
# Luego ejecutar:
git remote add origin https://github.com/TU_USUARIO/inventario-medicamentos.git
git branch -M main
git push -u origin main
```

### **Paso 2: Railway - Base de Datos** (3 min)

1. Ir a https://railway.app (Login con GitHub)
2. "+ New" → "Database" → "Add MySQL"
3. Click en la base de datos → "Variables" → **Copiar `DATABASE_URL`**

### **Paso 3: Railway - Backend** (5 min)

1. "+ New" → "GitHub Repo" → Seleccionar tu repositorio
2. Click en el servicio → "Settings":
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm start`

3. Ir a "Variables" y agregar:
```
DATABASE_URL=(pegar el que copiaste)
NODE_ENV=production
PORT=4000
JWT_SECRET=(generar con: node generate-jwt-secret.js)
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://PENDIENTE.vercel.app
```

4. Esperar deployment
5. Abrir terminal en Railway y ejecutar:
```bash
cd backend
npx prisma db push
```

6. **Copiar la URL del backend** (Settings → Domain)

### **Paso 4: Vercel - Frontend** (5 min)

1. Ir a https://vercel.com (Login con GitHub)
2. "Add New" → "Project" → Seleccionar tu repo
3. Configurar:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   
4. Environment Variables:
```
VITE_API_URL=https://TU-BACKEND.railway.app/api
```

5. Click "Deploy"
6. **Copiar la URL del frontend**

### **Paso 5: Actualizar CORS** (2 min)

1. Volver a Railway
2. Abrir tu servicio backend → "Variables"
3. Actualizar `FRONTEND_URL` con la URL de Vercel
4. Guardar (se redesplegará automáticamente)

---

## ✅ ¡LISTO!

Abre tu aplicación en la URL de Vercel y empieza a usarla.

---

## 🔑 Variables de Entorno Necesarias

### **Backend (Railway):**
```env
DATABASE_URL=mysql://user:pass@host:3306/db
NODE_ENV=production
PORT=4000
JWT_SECRET=tu-clave-secreta-64-caracteres
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://tu-app.vercel.app
```

### **Frontend (Vercel):**
```env
VITE_API_URL=https://tu-backend.railway.app/api
```

---

## 🆘 Problemas Comunes

### El backend no inicia:
- Revisa los logs en Railway → "Deployments" → "View Logs"
- Verifica que `DATABASE_URL` esté correcta

### Error CORS:
- `FRONTEND_URL` debe ser EXACTAMENTE igual a tu URL de Vercel
- Sin barra `/` al final

### Frontend no conecta con Backend:
- `VITE_API_URL` debe terminar en `/api`
- Verifica que el backend esté corriendo

---

## 📚 Guía Completa

Para instrucciones detalladas, opciones alternativas y solución de problemas, consulta [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)

---

## 💰 Costos

- **Railway**: $5 USD crédito mensual (suficiente para proyectos pequeños)
- **Vercel**: GRATIS ilimitado
- **Total**: GRATIS para empezar

---

## 🔄 Actualizaciones

Para actualizar tu aplicación después del primer deployment:

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

Railway y Vercel se actualizarán automáticamente.


