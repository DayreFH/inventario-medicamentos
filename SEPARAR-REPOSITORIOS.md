# 📦 Guía: Separar Backend y Frontend en Repositorios Independientes

Esta guía te ayudará a crear dos repositorios separados en GitHub: uno para el backend y otro para el frontend.

---

## 📋 PASO A PASO

### **PASO 1: Crear Repositorios en GitHub**

1. Ve a https://github.com y inicia sesión
2. Haz clic en **"+"** → **"New repository"**
3. Crea el primer repositorio:
   - **Nombre**: `inventario-medicamentos-backend`
   - **Descripción**: "Backend API para Sistema de Inventario de Medicamentos"
   - **Visibilidad**: Private (recomendado) o Public
   - **NO marques** "Initialize with README" (ya tenemos uno)
   - Haz clic en **"Create repository"**
4. Crea el segundo repositorio:
   - **Nombre**: `inventario-medicamentos-frontend`
   - **Descripción**: "Frontend React para Sistema de Inventario de Medicamentos"
   - **Visibilidad**: Private (recomendado) o Public
   - **NO marques** "Initialize with README"
   - Haz clic en **"Create repository"**

**⚠️ IMPORTANTE:** Copia las URLs de ambos repositorios, las necesitarás después:
- Backend: `https://github.com/TU_USUARIO/inventario-medicamentos-backend.git`
- Frontend: `https://github.com/TU_USUARIO/inventario-medicamentos-frontend.git`

---

### **PASO 2: Preparar el Backend**

Abre PowerShell en la carpeta del proyecto actual y ejecuta:

```powershell
# Navegar a la carpeta del proyecto
cd "D:\SOFTWARE INVENTARIO MEDICAMENTO\inventario-medicamentos"

# Crear carpeta temporal para el backend
mkdir backend-temp
cd backend-temp

# Copiar todo el contenido del backend
Copy-Item -Path "..\backend\*" -Destination "." -Recurse -Force

# Inicializar git
git init

# Agregar todos los archivos
git add .

# Crear primer commit
git commit -m "Initial commit: Backend API"

# Agregar el repositorio remoto (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/inventario-medicamentos-backend.git

# Cambiar a rama main
git branch -M main

# Subir al repositorio
git push -u origin main

# Volver a la carpeta principal
cd ..
```

---

### **PASO 3: Preparar el Frontend**

En la misma terminal de PowerShell:

```powershell
# Crear carpeta temporal para el frontend
mkdir frontend-temp
cd frontend-temp

# Copiar todo el contenido del frontend
Copy-Item -Path "..\frontend\*" -Destination "." -Recurse -Force

# Inicializar git
git init

# Agregar todos los archivos
git add .

# Crear primer commit
git commit -m "Initial commit: Frontend React"

# Agregar el repositorio remoto (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/inventario-medicamentos-frontend.git

# Cambiar a rama main
git branch -M main

# Subir al repositorio
git push -u origin main

# Volver a la carpeta principal
cd ..
```

---

### **PASO 4: Limpiar Carpetas Temporales (Opcional)**

```powershell
# Eliminar carpetas temporales
Remove-Item -Path "backend-temp" -Recurse -Force
Remove-Item -Path "frontend-temp" -Recurse -Force
```

---

## 🎯 ALTERNATIVA: Script Automático

He creado un script que automatiza todo el proceso. Ejecuta:

```powershell
.\separar-repositorios.ps1
```

El script te pedirá:
1. Tu usuario de GitHub
2. Confirmación antes de crear los repositorios

---

## ✅ VERIFICACIÓN

Después de completar los pasos:

1. Ve a https://github.com/TU_USUARIO/inventario-medicamentos-backend
   - Deberías ver todos los archivos del backend
   - Debería tener un README.md

2. Ve a https://github.com/TU_USUARIO/inventario-medicamentos-frontend
   - Deberías ver todos los archivos del frontend
   - Debería tener un README.md

---

## 🔄 ACTUALIZACIONES FUTURAS

### **Actualizar Backend:**

```powershell
cd "D:\SOFTWARE INVENTARIO MEDICAMENTO\inventario-medicamentos\backend"
git add .
git commit -m "Descripción de los cambios"
git push
```

### **Actualizar Frontend:**

```powershell
cd "D:\SOFTWARE INVENTARIO MEDICAMENTO\inventario-medicamentos\frontend"
git add .
git commit -m "Descripción de los cambios"
git push
```

---

## 🚀 DESPLEGAR EN RAILWAY

Ahora que tienes repositorios separados:

### **Backend:**
1. Ve a Railway
2. "+ New Project" → "Deploy from GitHub Repo"
3. Selecciona `inventario-medicamentos-backend`
4. Railway detectará automáticamente `railway.json`

### **Frontend:**
1. Ve a Railway (o crea un nuevo proyecto)
2. "+ New Project" → "Deploy from GitHub Repo"
3. Selecciona `inventario-medicamentos-frontend`
4. Railway detectará automáticamente `railway.json`

---

## 📝 NOTAS IMPORTANTES

1. **Variables de Entorno:**
   - Cada repositorio tiene su propio `.env.example`
   - No olvides configurar las variables en Railway

2. **Dependencias:**
   - Cada repositorio tiene su propio `package.json`
   - Las dependencias están separadas

3. **Documentación:**
   - Cada repositorio tiene su propio README.md
   - La documentación está adaptada a cada proyecto

4. **Gitignore:**
   - Cada repositorio tiene su propio `.gitignore`
   - Los archivos sensibles están protegidos

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### **Error: "Repository not found"**
- Verifica que el repositorio exista en GitHub
- Verifica que tengas permisos de escritura
- Verifica que la URL sea correcta

### **Error: "Authentication failed"**
- Configura tus credenciales de Git:
  ```powershell
  git config --global user.name "Tu Nombre"
  git config --global user.email "tu@email.com"
  ```
- O usa un token de acceso personal de GitHub

### **Error: "Permission denied"**
- Asegúrate de estar autenticado en GitHub
- Verifica que tengas permisos en el repositorio

---

## ✅ CHECKLIST

- [ ] Repositorio backend creado en GitHub
- [ ] Repositorio frontend creado en GitHub
- [ ] Backend subido correctamente
- [ ] Frontend subido correctamente
- [ ] README.md presente en ambos repositorios
- [ ] .gitignore configurado en ambos
- [ ] Variables de entorno documentadas

---

**¡Listo! Ahora tienes dos repositorios separados y listos para desplegar en Railway.**

