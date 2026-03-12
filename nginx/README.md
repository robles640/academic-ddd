# Nginx para academic.site.com

## Uso

1. **Copiar la configuración** al servidor (ej. EC2 o VPS):
   ```bash
   sudo cp academic.site.com.conf /etc/nginx/sites-available/
   sudo ln -s /etc/nginx/sites-available/academic.site.com.conf /etc/nginx/sites-enabled/
   ```

2. **Crear el directorio** de los estáticos del frontend y subir el build:
   ```bash
   sudo mkdir -p /var/www/academic.site.com
   # Subir el contenido de packages/frontend/dist (build con VITE_API_BASE=https://academic.site.com/api)
   ```

3. **Comprobar y recargar Nginx**:
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

4. **DNS**: Apuntar `academic.site.com` (A o CNAME) a la IP del servidor.

5. **HTTPS con Let's Encrypt** (cuando el dominio apunte al servidor):
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d academic.site.com
   ```
   Luego descomentar en el `.conf` el bloque `server { listen 443 ssl ... }` y el `server { listen 80; return 301 ... }`, o dejar que certbot modifique el sitio.

## Variables de entorno del frontend (build)

- `VITE_API_BASE=https://academic.site.com/api` (producción con este Nginx).

## Backend

El backend debe estar escuchando en `127.0.0.1:3000` (o en el mismo host en el puerto 3000). Nginx hace proxy de `/api/*` al backend sin el prefijo `/api`.
