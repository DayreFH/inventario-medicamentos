# 💊 Sistema de Inventario de Medicamentos

Sistema completo de gestión de inventario de medicamentos con frontend React y backend Node.js.

---

## 🚀 DESPLIEGUE A INTERNET

### **📖 Guías Disponibles:**

| Guía | Descripción | Tiempo | Dificultad |
|------|-------------|--------|------------|
| **[DEPLOYMENT-RESUMEN.md](./DEPLOYMENT-RESUMEN.md)** | ⭐ **Empieza aquí** - Resumen ejecutivo | 5 min lectura | ⭐☆☆☆☆ |
| **[README-DEPLOYMENT.md](./README-DEPLOYMENT.md)** | Guía rápida Railway + Vercel | 20-30 min | ⭐⭐☆☆☆ |
| **[DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)** | Guía completa con todas las opciones | 30-60 min | ⭐⭐⭐☆☆ |
| **[HOSTING-DOMINICANA.md](./HOSTING-DOMINICANA.md)** | Opciones de hosting en RD | Variable | ⭐⭐⭐⭐☆ |
| **[SECURITY-PRODUCTION.md](./SECURITY-PRODUCTION.md)** | Seguridad para producción | 15 min lectura | ⭐⭐⭐☆☆ |

---

## 🎯 OPCIÓN RECOMENDADA: Railway + Vercel

**✅ Ventajas:**
- 100% Gratis para empezar
- SSL automático (HTTPS)
- Despliegue en 20-30 minutos
- No requiere conocimientos avanzados
- Actualización automática desde GitHub

**📖 Lee:** [README-DEPLOYMENT.md](./README-DEPLOYMENT.md)

---

## 💻 DESARROLLO LOCAL

### **Requisitos:**
- ✅ Node.js v20.19.0 (instalado)
- ✅ npm v10.8.2 (instalado)
- ✅ MySQL 8.0 (instalado)

### **Inicio Rápido:**

#### **Windows (Script automático):**
```bash
# Doble clic en:
start-dev.bat
```

#### **Manual:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### **URLs Locales:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- Prisma Studio: `npm run prisma:studio` (en carpeta backend)

---

## 📁 ESTRUCTURA DEL PROYECTO

```
inventario-medicamentos/
├── backend/                # API Node.js + Express + Prisma
│   ├── src/
│   │   ├── routes/        # Endpoints de la API
│   │   ├── middleware/    # Autenticación, etc
│   │   ├── services/      # Lógica de negocio
│   │   └── index.js       # Punto de entrada
│   ├── prisma/
│   │   └── schema.prisma  # Esquema de base de datos
│   └── package.json
│
├── frontend/              # Aplicación React + Vite
│   ├── src/
│   │   ├── pages/         # Páginas de la app
│   │   ├── components/    # Componentes reutilizables
│   │   ├── contexts/      # Contextos de React
│   │   └── api/          # Configuración de API
│   └── package.json
│
└── Guías de deployment/   # ← ARCHIVOS IMPORTANTES
    ├── DEPLOYMENT-RESUMEN.md
    ├── README-DEPLOYMENT.md
    ├── DEPLOYMENT-GUIDE.md
    ├── HOSTING-DOMINICANA.md
    └── SECURITY-PRODUCTION.md
```

---

## 🔧 TECNOLOGÍAS

### **Backend:**
- Node.js 20.x
- Express 5.x
- Prisma ORM
- MySQL 8.0
- JWT para autenticación
- bcryptjs para hash de contraseñas

### **Frontend:**
- React 19.x
- Vite 7.x
- React Router 7.x
- TanStack Query
- Chart.js para gráficos
- Axios para peticiones HTTP

---

## 🔑 CONFIGURACIÓN

### **Backend (.env):**
```env
DATABASE_URL="mysql://usuario:password@localhost:3306/inventario_meds"
NODE_ENV=development
PORT=4000
JWT_SECRET=tu-clave-secreta
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### **Frontend (.env):**
```env
VITE_API_URL=http://localhost:4000/api
```

### **Generar JWT Secret:**
```bash
node generate-jwt-secret.js
```

---

## 📊 CARACTERÍSTICAS

### **Gestión de Medicamentos:**
- ✅ Registro de medicamentos con código, nombre, forma farmacéutica
- ✅ Control de stock y vencimientos
- ✅ Precios de compra y venta
- ✅ Márgenes de utilidad configurables

### **Compras y Ventas:**
- ✅ Registro de recibos de compra
- ✅ Registro de ventas
- ✅ Control de lotes y fechas de vencimiento
- ✅ Historial completo

### **Finanzas:**
- ✅ Tasas de cambio (USD/DOP)
- ✅ Tasas de envío nacional/internacional
- ✅ Márgenes de utilidad
- ✅ Reportes financieros

### **Usuarios:**
- ✅ Autenticación con JWT
- ✅ Roles (admin, user)
- ✅ Protección de rutas
- ✅ Rate limiting

### **Reportes:**
- ✅ Gráficos de ventas
- ✅ Medicamentos por vencer
- ✅ Stock bajo
- ✅ Análisis financiero

---

## 🚀 COMANDOS ÚTILES

### **Backend:**
```bash
npm run dev              # Modo desarrollo con hot-reload
npm start                # Producción
npm run prisma:studio    # Interfaz visual de BD
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:push      # Sincronizar esquema con BD
```

### **Frontend:**
```bash
npm run dev              # Modo desarrollo
npm run build            # Compilar para producción
npm run preview          # Preview de producción
npm run lint             # Linter
```

---

## 🔒 SEGURIDAD

Antes de subir a producción, revisa:

1. **[SECURITY-PRODUCTION.md](./SECURITY-PRODUCTION.md)** - Guía de seguridad
2. Cambiar JWT_SECRET a una clave segura
3. Usar contraseñas fuertes
4. Configurar NODE_ENV=production
5. Implementar HTTPS

---

## 📚 GUÍAS PASO A PASO

### **Para Principiantes:**
1. ⭐ Lee [DEPLOYMENT-RESUMEN.md](./DEPLOYMENT-RESUMEN.md) primero
2. Sigue [README-DEPLOYMENT.md](./README-DEPLOYMENT.md)
3. Usa Railway + Vercel (gratis y fácil)

### **Para Intermedios:**
1. Lee [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) completo
2. Elige entre múltiples opciones de hosting
3. Considera VPS si necesitas más control

### **Para Hosting en República Dominicana:**
1. Lee [HOSTING-DOMINICANA.md](./HOSTING-DOMINICANA.md)
2. Compara proveedores locales
3. Sigue la guía de configuración VPS

---

## 💰 COSTOS ESTIMADOS

| Opción | Costo Mensual | Ideal Para |
|--------|---------------|------------|
| **Railway + Vercel** | GRATIS - $5 | ⭐ Proyectos pequeños/medianos |
| **Render** | GRATIS - $7 | Alternativa simple |
| **DigitalOcean VPS** | $6 - $12 | Mayor control |
| **Hosting Dominicano** | $15 - $30 | Hosting local RD |

---

## 🆘 SOPORTE

### **Problemas de Instalación Local:**
- Verifica que Node.js y MySQL estén instalados
- Revisa que las variables de entorno estén correctas
- Consulta los logs de error

### **Problemas de Deployment:**
- Revisa los logs en Railway/Vercel
- Verifica las variables de entorno en producción
- Asegúrate de que las URLs sean correctas
- Consulta la sección de problemas comunes en las guías

### **Recursos:**
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs

---

## ✅ CHECKLIST DE DEPLOYMENT

- [ ] Proyecto funcionando en local
- [ ] Cuenta de GitHub creada
- [ ] Repositorio creado y código subido
- [ ] Leída la guía de deployment
- [ ] JWT_SECRET generado
- [ ] Base de datos creada en Railway
- [ ] Backend desplegado en Railway
- [ ] Variables de entorno configuradas
- [ ] Frontend desplegado en Vercel
- [ ] CORS configurado correctamente
- [ ] Aplicación probada y funcionando
- [ ] Medidas de seguridad implementadas

---

## 📞 CONTACTO Y CONTRIBUCIÓN

Este proyecto fue desarrollado como sistema de gestión para inventario de medicamentos.

### **Mejoras Futuras:**
- [ ] Dashboard de métricas
- [ ] Notificaciones por email
- [ ] Exportación a Excel/PDF
- [ ] App móvil
- [ ] Modo offline

---

## 📄 LICENCIA

Este proyecto es privado y de uso interno.

---

## 🎉 ¡COMIENZA AHORA!

1. **Desarrollo Local:** Ejecuta `start-dev.bat` (Windows) o sigue las instrucciones arriba
2. **Deployment:** Lee [DEPLOYMENT-RESUMEN.md](./DEPLOYMENT-RESUMEN.md) y sigue los pasos

---

**¿Listo para subir tu aplicación a internet?**

👉 **[Empieza aquí: DEPLOYMENT-RESUMEN.md](./DEPLOYMENT-RESUMEN.md)**

---

*Sistema de Inventario de Medicamentos - v1.0.0*


