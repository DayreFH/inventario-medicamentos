# 🔒 Guía de Seguridad para Producción

Antes de lanzar tu aplicación públicamente, implementa estas medidas de seguridad.

---

## ⚠️ CRÍTICO - HACER ANTES DE LANZAR

### **1. Cambiar JWT_SECRET**

**❌ NO usar en producción:**
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**✅ Generar una nueva:**
```bash
node generate-jwt-secret.js
```

Debe ser:
- Mínimo 64 caracteres
- Completamente aleatoria
- Diferente a la de desarrollo

---

### **2. Usar Contraseñas Fuertes en MySQL**

**❌ NO usar:**
```
DATABASE_URL=mysql://root:password@localhost:3306/db
```

**✅ Usar:**
```
DATABASE_URL=mysql://appuser:X9$mK2@pL5#nQ8!wR@host:3306/db
```

Características:
- Mínimo 16 caracteres
- Mayúsculas, minúsculas, números, símbolos
- Sin palabras del diccionario

---

### **3. Configurar NODE_ENV**

**✅ SIEMPRE en producción:**
```env
NODE_ENV=production
```

Esto desactiva:
- Mensajes de error detallados
- Stack traces en respuestas
- Modo desarrollo de librerías

---

### **4. Variables de Entorno Sensibles**

**❌ NUNCA subir a GitHub:**
- `.env`
- `.env.local`
- `.env.production`
- Contraseñas
- API keys

**✅ Verificar .gitignore:**
```
node_modules/
.env
.env.*
*.log
```

---

## 🛡️ CONFIGURACIÓN DE SEGURIDAD ADICIONAL

### **5. Rate Limiting (Ya implementado ✅)**

Tu aplicación ya tiene rate limiting configurado en `backend/src/app.js`:

```javascript
// Límite general: 100 peticiones por 15 minutos
// Límite de login: 5 intentos por 15 minutos
```

**Puedes ajustarlo si es necesario:**
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // Reducir si quieres más seguridad
  // ...
});
```

---

### **6. CORS (Ya implementado ✅)**

Asegúrate de que `FRONTEND_URL` sea EXACTA:

**❌ Malo:**
```env
FRONTEND_URL=*  # Permite TODOS los orígenes
```

**✅ Bueno:**
```env
FRONTEND_URL=https://tu-app.vercel.app
```

---

### **7. HTTPS Obligatorio**

**Railway y Vercel ya proveen HTTPS automáticamente ✅**

Si usas VPS, configura SSL con Let's Encrypt:
```bash
sudo certbot --nginx -d tudominio.com
```

---

### **8. Headers de Seguridad**

Tu frontend en Vercel ya tiene headers configurados en `frontend/vercel.json`:

```json
{
  "headers": [
    {
      "key": "X-Content-Type-Options",
      "value": "nosniff"
    },
    {
      "key": "X-Frame-Options",
      "value": "DENY"
    },
    {
      "key": "X-XSS-Protection",
      "value": "1; mode=block"
    }
  ]
}
```

---

## 👤 GESTIÓN DE USUARIOS

### **9. Crear Usuario Administrador**

**Después del deployment, crea tu primer usuario admin:**

Opción 1: Desde el frontend (si permite registro)

Opción 2: Directamente en la base de datos:

```javascript
// Conectarte a Railway Shell o tu base de datos
// Ejecutar en Node.js:

import bcrypt from 'bcryptjs';

const password = await bcrypt.hash('TuContraseñaSegura123!', 10);
console.log(password);

// Luego insertar en la base de datos:
// INSERT INTO users (email, password, name, role) 
// VALUES ('admin@tuempresa.com', 'HASH_AQUI', 'Admin', 'admin');
```

---

### **10. Política de Contraseñas**

Implementar validaciones:
- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos un número
- Al menos un carácter especial

---

## 🗄️ BASE DE DATOS

### **11. Backups Automáticos**

**Railway**: Los backups están incluidos automáticamente ✅

**VPS**: Configurar backups diarios:
```bash
# Crear script de backup
sudo nano /root/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u usuario -p'password' nombre_bd > /backups/db_$DATE.sql
# Mantener solo últimos 7 días
find /backups -name "db_*.sql" -mtime +7 -delete
```

```bash
# Programar con cron (diario a las 2 AM)
sudo crontab -e
0 2 * * * /root/backup-db.sh
```

---

### **12. Usuario de Base de Datos Dedicado**

**❌ NO usar root en producción:**
```sql
-- Conectarse a MySQL como root
CREATE USER 'app_inventario'@'%' IDENTIFIED BY 'ContraseñaSegura123!';
GRANT SELECT, INSERT, UPDATE, DELETE ON inventario_medicamentos.* TO 'app_inventario'@'%';
FLUSH PRIVILEGES;
```

---

## 📊 MONITOREO

### **13. Logs de Seguridad**

Monitorear:
- Intentos de login fallidos
- Peticiones bloqueadas por rate limit
- Errores de autenticación
- Accesos no autorizados

En Railway:
1. Ve a tu servicio → "Observability"
2. Revisa los logs regularmente

---

### **14. Monitoreo de Uptime**

**UptimeRobot** (Gratis):
1. Ve a https://uptimerobot.com
2. Crea cuenta
3. Agrega tu URL para monitoreo
4. Recibe alertas si la app cae

---

### **15. Alertas de Errores**

**Sentry** (Gratis para proyectos pequeños):
1. https://sentry.io
2. Integra con tu app
3. Recibe notificaciones de errores en tiempo real

```bash
# Instalar Sentry
npm install @sentry/node @sentry/browser
```

---

## 🔐 SECRETOS Y CREDENCIALES

### **16. Rotar Credenciales Regularmente**

- JWT_SECRET: Cada 3-6 meses
- Contraseñas de BD: Cada 6 meses
- API Keys: Cuando sea necesario

### **17. Almacenamiento Seguro**

**✅ Guardar de forma segura:**
- Usar un gestor de contraseñas (1Password, LastPass, Bitwarden)
- No guardar en archivos de texto
- No enviar por email o WhatsApp sin cifrar

---

## 🚨 RESPUESTA A INCIDENTES

### **18. Plan de Respuesta**

Si detectas un ataque o vulnerabilidad:

1. **Inmediato (5 min):**
   - Deshabilitar el servicio temporalmente
   - Cambiar todas las contraseñas
   - Rotar JWT_SECRET

2. **Corto plazo (1 hora):**
   - Revisar logs
   - Identificar el problema
   - Implementar fix
   - Hacer deployment

3. **Seguimiento (24 horas):**
   - Monitorear comportamiento
   - Notificar a usuarios si es necesario
   - Documentar el incidente

---

## ✅ CHECKLIST DE SEGURIDAD

Antes de lanzar a producción:

- [ ] JWT_SECRET generado con 64+ caracteres aleatorios
- [ ] NODE_ENV=production configurado
- [ ] Contraseña fuerte de base de datos
- [ ] CORS configurado correctamente
- [ ] HTTPS habilitado (Railway/Vercel lo hacen automáticamente)
- [ ] Rate limiting configurado
- [ ] .env NO está en GitHub
- [ ] Usuario administrador creado
- [ ] Backups configurados (automático en Railway)
- [ ] Monitoreo de uptime configurado
- [ ] Logs de seguridad revisados
- [ ] Headers de seguridad configurados

---

## 📚 RECURSOS ADICIONALES

### **Auditorías de Seguridad:**
- **npm audit**: Revisa vulnerabilidades en dependencias
  ```bash
  npm audit
  npm audit fix
  ```

### **Herramientas:**
- **OWASP ZAP**: Scanner de seguridad web
- **Snyk**: Monitoreo de vulnerabilidades
- **Dependabot**: GitHub alerts automáticas

### **Mejores Prácticas:**
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Node.js Security: https://nodejs.org/en/docs/guides/security/

---

## 🔄 MANTENIMIENTO CONTINUO

### **Mensual:**
- [ ] Revisar logs de seguridad
- [ ] Actualizar dependencias: `npm update`
- [ ] Ejecutar `npm audit`

### **Trimestral:**
- [ ] Rotar JWT_SECRET
- [ ] Revisar políticas de acceso
- [ ] Actualizar Node.js a última versión LTS

### **Anual:**
- [ ] Auditoría de seguridad completa
- [ ] Revisar y actualizar políticas
- [ ] Capacitación del equipo

---

## ⚡ COMANDOS ÚTILES

```bash
# Revisar vulnerabilidades
npm audit

# Corregir vulnerabilidades automáticamente
npm audit fix

# Actualizar dependencias
npm update

# Ver versiones desactualizadas
npm outdated

# Generar nuevo JWT secret
node generate-jwt-secret.js
```

---

**🔒 La seguridad es un proceso continuo, no un evento único.**

Mantén tu aplicación actualizada y monitorea regularmente.


