# 🇩🇴 Opciones de Hosting en República Dominicana

Si prefieres usar servicios de hosting dominicanos para tu Sistema de Inventario de Medicamentos.

---

## 🏢 PROVEEDORES DOMINICANOS

### **1. Hosting Dominicano (hosting.do)**

**Website**: https://www.hosting.do

**Servicios:**
- ✅ Hosting compartido
- ✅ VPS (Servidores Virtuales)
- ✅ Servidores dedicados
- ✅ Dominio .do

**Precios:**
- VPS Básico: ~$15-25 USD/mes
- VPS Intermedio: ~$30-50 USD/mes

**Ideal para:**
- Empresas que necesitan hosting local
- Cumplimiento con regulaciones dominicanas
- Menor latencia para usuarios en RD

---

### **2. Dataport**

**Website**: https://www.dataport.com.do

**Servicios:**
- ✅ VPS
- ✅ Cloud hosting
- ✅ Servidores dedicados
- ✅ Soporte técnico en español

**Precios:**
- Desde ~$20 USD/mes

---

### **3. Claro Empresas**

**Website**: https://empresas.claro.com.do

**Servicios:**
- ✅ Soluciones empresariales
- ✅ Data center local
- ✅ Soporte 24/7

**Ideal para:**
- Empresas establecidas
- Aplicaciones críticas

---

### **4. Red IT Dominican**

**Website**: https://www.redit.do

**Servicios:**
- ✅ VPS
- ✅ Hosting web
- ✅ Dominios

---

## 🖥️ CONFIGURACIÓN EN VPS DOMINICANO

Si contratas un VPS con cualquier proveedor dominicano, sigue estos pasos:

### **Requisitos del servidor:**
- Ubuntu 22.04 LTS
- Mínimo 2GB RAM
- 20GB almacenamiento
- Node.js 20.x
- MySQL 8.0
- Nginx

### **Script de instalación automática:**

Conéctate a tu VPS por SSH y ejecuta:

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Instalar Nginx
sudo apt install -y nginx

# Instalar PM2 (gestor de procesos Node.js)
sudo npm install -g pm2

# Instalar Git
sudo apt install -y git

# Instalar Certbot (SSL gratuito)
sudo apt install -y certbot python3-certbot-nginx
```

### **Desplegar la aplicación:**

```bash
# Clonar tu repositorio
cd /var/www
sudo git clone https://github.com/TU_USUARIO/inventario-medicamentos.git
cd inventario-medicamentos

# Configurar backend
cd backend
sudo npm install
sudo npx prisma generate

# Crear archivo .env
sudo nano .env
# (pega tu configuración de producción)

# Crear la base de datos
mysql -u root -p
CREATE DATABASE inventario_medicamentos;
CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'TU_PASSWORD_SEGURO';
GRANT ALL PRIVILEGES ON inventario_medicamentos.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Ejecutar migraciones
sudo npx prisma db push

# Iniciar backend con PM2
pm2 start src/index.js --name inventario-backend
pm2 save
pm2 startup

# Configurar frontend
cd ../frontend
sudo npm install

# Crear archivo .env
sudo nano .env.production
# Agregar: VITE_API_URL=https://tudominio.com/api

# Compilar frontend
sudo npm run build

# Copiar archivos compilados
sudo cp -r dist/* /var/www/html/
```

### **Configurar Nginx:**

```bash
sudo nano /etc/nginx/sites-available/inventario
```

Pega esta configuración:

```nginx
# Frontend
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;
    root /var/www/html;
    index index.html;

    # Frontend - SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API - Proxy reverso
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activar el sitio:

```bash
sudo ln -s /etc/nginx/sites-available/inventario /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **Configurar SSL (HTTPS):**

```bash
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

---

## 💰 COMPARACIÓN DE COSTOS

| Proveedor | Tipo | Costo Mensual | Ventajas |
|-----------|------|---------------|----------|
| **Railway + Vercel** | Cloud | GRATIS - $5 | Más fácil, SSL incluido |
| **Render** | Cloud | GRATIS - $7 | Todo en uno |
| **Hosting.do VPS** | VPS Local | $15 - $25 | Hosting dominicano |
| **Dataport** | VPS Local | $20+ | Soporte local |
| **DigitalOcean** | VPS Global | $6 - $12 | Más barato, global |

---

## ✅ RECOMENDACIÓN

### **Para empezar:**
👉 **Railway + Vercel** (GRATIS, fácil, sin configuración de servidor)

### **Para producción pequeña/mediana:**
👉 **DigitalOcean** ($6/mes, más económico que VPS dominicanos)

### **Si necesitas hosting local obligatoriamente:**
👉 **Hosting.do** o **Dataport** (soporte en RD, data center local)

### **Para empresas grandes:**
👉 **VPS dedicado** o **Claro Empresas**

---

## 📞 SOPORTE TÉCNICO

Si contratas un VPS y necesitas ayuda con la configuración:

1. La mayoría de proveedores dominicanos ofrecen:
   - Soporte por teléfono
   - WhatsApp Business
   - Email técnico

2. Para configuración del servidor:
   - Puedes contratar un administrador de sistemas
   - Costo aproximado: $50-100 USD por configuración inicial

---

## 🌐 DOMINIO .DO

Para registrar un dominio .do (ejemplo: `inventario-meds.do`):

1. **NIC-DO**: https://www.nic.do
2. **Hosting.do**: https://www.hosting.do
3. **Dataport**: https://www.dataport.com.do

**Costo**: ~$35-50 USD/año

---

## 📋 CHECKLIST PARA VPS DOMINICANO

- [ ] Contratar VPS (mínimo 2GB RAM)
- [ ] Configurar acceso SSH
- [ ] Instalar Node.js, MySQL, Nginx
- [ ] Clonar repositorio
- [ ] Configurar variables de entorno
- [ ] Crear base de datos
- [ ] Ejecutar migraciones de Prisma
- [ ] Compilar frontend
- [ ] Configurar Nginx
- [ ] Obtener certificado SSL
- [ ] Configurar dominio
- [ ] Configurar PM2 para auto-inicio
- [ ] Configurar backups automáticos

---

## 🔒 SEGURIDAD ADICIONAL

Para servidores VPS, configura:

```bash
# Firewall
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable

# Fail2ban (protección contra ataques)
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
```

---

## 📊 MONITOREO

Herramientas recomendadas:

1. **PM2 Plus**: Monitoreo de Node.js (gratis para 1 servidor)
2. **UptimeRobot**: Monitoreo de uptime (gratis)
3. **Netdata**: Dashboard de sistema (gratis)

```bash
# Instalar Netdata
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

---

¿Prefieres hosting local dominicano o hosting cloud internacional?

**Ventajas Cloud (Railway/Vercel):**
- ✅ Más barato o gratis
- ✅ Mantenimiento automático
- ✅ Escalabilidad automática
- ✅ SSL incluido
- ✅ Backups automáticos

**Ventajas Hosting Dominicano:**
- ✅ Soporte local en español
- ✅ Data en República Dominicana
- ✅ Cumplimiento con leyes locales
- ✅ Menor latencia para usuarios RD


