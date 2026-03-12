# Despliegue en DigitalOcean (App Platform o Droplet)

Guía paso a paso para registrarte en DigitalOcean y desplegar este proyecto (monorepo frontend + backend) en **App Platform** (PaaS) o en un **Droplet** (VPS), con **GitHub Actions** para tests unitarios y e2e antes de desplegar.

---

## 1. Registro en DigitalOcean

1. Entra en [digitalocean.com](https://www.digitalocean.com) y pulsa **Sign Up**.
2. Regístrate con email o con GitHub (recomendado para conectar el repo después).
3. Verifica tu email.
4. Añade un método de pago (tarjeta o PayPal). DigitalOcean suele ofrecer **créditos de bienvenida** (ej. 200 USD por 60 días) para cuentas nuevas.
5. Accede al panel: [cloud.digitalocean.com](https://cloud.digitalocean.com).

### Uso gratuito y económico

- **Créditos de bienvenida**: Comprueba en la cuenta si tienes créditos (ej. 200 USD). Con eso puedes usar App Platform y bases de datos durante meses en proyectos pequeños.
- **App Platform**:
  - **Static Site**: plan gratuito (512 MB, 1 GB transferencia/mes) para sitios estáticos; ideal para el **frontend** de este proyecto.
  - **Web Service** (backend): desde ~5 USD/mes por un contenedor básico; los créditos lo cubren.
- **Bases de datos**: Managed PostgreSQL desde ~15 USD/mes, o usa un **Database** de DO con el crédito. Para ahorrar al máximo, puedes desplegar solo el frontend en DO (gratis) y el backend en Railway/Render (tier gratuito) y conectar ambos.
- **Droplets** (VPS): desde ~4–6 USD/mes (1 GB RAM). Con un Droplet puedes instalar Node, PostgreSQL, Nginx y desplegar la app tú mismo (similar a EC2 en AWS); los créditos de bienvenida cubren varios meses.

---

## 2. Crear la aplicación en App Platform

1. En el panel de DigitalOcean: **Apps** → **Create App**.
2. Elige **GitHub** (o GitLab/Bitbucket), autoriza y selecciona el repositorio **academic-ddd** y la rama **main**.
3. DigitalOcean detectará el monorepo. Debes definir **dos componentes**: uno para el backend y otro para el frontend.

### Componente 1: Backend (API)

- **Type**: Web Service.
- **Source**: mismo repo, rama `main`.
- **Source Directory**: `packages/backend` (o deja vacío y usa **Run Command** con `cd packages/backend && ...` si el contexto debe ser la raíz).
- **Build Command** (si Source Directory = `packages/backend`):
  ```bash
  npm install -g npm@latest && npm ci --prefix ../.. && npm run build -w backend
  ```
  Si el build se ejecuta con **root** = raíz del repo (Source Directory vacío):
  ```bash
  npm ci && npm run build -w packages/backend
  ```
- **Run Command**:
  ```bash
  node dist/main.js
  ```
  (Si el directorio de trabajo del run es `packages/backend`, usa `node dist/main.js`; si es la raíz, `node packages/backend/dist/main.js`.)
- **HTTP Port**: 3000.
- **Environment Variables** (añade en la pestaña del componente):
  - `NODE_ENV`: production
  - `PORT`: 8080 (App Platform suele inyectar PORT; si usan 8080, pon 8080 o deja que la app use `process.env.PORT`).
  - `JWT_SECRET`: (genera uno seguro)
  - `TYPEORM_HOST`, `TYPEORM_PORT`, `TYPEORM_USERNAME`, `TYPEORM_PASSWORD`, `TYPEORM_DATABASE`: según la base de datos (ver siguiente sección).
  - `STUDENT_DEFAULT_PASSWORD`: TempStudent1! (o el que uses)

### Base de datos PostgreSQL en DigitalOcean

1. **Databases** → **Create Database Cluster** → elige **PostgreSQL**, plan básico (el más barato o el que cubran tus créditos).
2. Una vez creado, anota **Host**, **Port**, **User**, **Password** y **Database**.
3. Crea la base de datos si no existe (por defecto suele crearse una).
4. En el **App** → componente Backend → **Environment Variables**, añade:
   - `TYPEORM_HOST`: (host del cluster)
   - `TYPEORM_PORT`: 25060 (puerto por defecto DO)
   - `TYPEORM_USERNAME`: (usuario)
   - `TYPEORM_PASSWORD`: (contraseña)
   - `TYPEORM_DATABASE`: defaultdb (o el nombre que hayas creado)

Para que las migraciones se ejecuten en cada deploy, en **Build Command** puedes añadir:

```bash
npm ci && npm run build -w packages/backend && npm run migrations:run -w packages/backend
```

(Asegúrate de que las variables TYPEORM_* estén disponibles en la fase de build; en App Platform suelen estarlo.)

### Componente 2: Frontend (Static Site)

- **Type**: Static Site.
- **Source**: mismo repo, rama `main`.
- **Source Directory**: `packages/frontend`.
- **Build Command**:
  ```bash
  npm ci --prefix ../.. && npm run build -w frontend
  ```
  (Si el contexto de build es la raíz del repo, `npm ci && npm run build -w packages/frontend`.)
- **Output Directory**: `dist` (relativo a `packages/frontend`).
- **Environment Variables** (build):
  - `VITE_API_BASE`: URL pública del backend. Tras crear el backend en App Platform, copia la URL (ej. `https://api-tu-app-xxxxx.ondigitalocean.app`) y ponla aquí.

### Conectar frontend y backend

- En el componente **Frontend**, en variables de **build**, define `VITE_API_BASE` con la URL del **Backend** (la que te asigne App Platform).
- La primera vez tendrás que hacer un deploy del backend, anotar la URL y actualizar `VITE_API_BASE` en el frontend y volver a desplegar.

### Monorepo: “Include source files outside of the Root Directory”

- Si usas **Source Directory** = `packages/backend` o `packages/frontend`, en la configuración del componente activa la opción **Include source files outside of the Root Directory** (o equivalente) para que el build pueda ejecutar `npm ci` desde la raíz y acceder a los workspaces.

---

## 3. Opción: Despliegue en Droplet (VPS)

Si prefieres un servidor bajo tu control (como en AWS EC2), crea un **Droplet** en DigitalOcean, instala Node.js, PostgreSQL y Nginx, y despliega la app manualmente o con GitHub Actions por SSH.

### 3.1. Crear el Droplet

1. En el panel: **Droplets** → **Create Droplet**.
2. **Imagen**: Ubuntu 22.04 LTS (o 24.04).
3. **Plan**: Basic, 1 GB RAM / 1 CPU (suficiente para desarrollo o tráfico bajo). Los créditos de bienvenida suelen cubrirlo.
4. **Región**: La más cercana a tus usuarios.
5. **Autenticación**: SSH key (recomendado) o contraseña. Si usas clave, añádela en "SSH Key" y guárdala para GitHub Actions (secret `SSH_PRIVATE_KEY`).
6. **Hostname**: ej. `academic-ddd`.
7. Crear Droplet y anotar la **IP pública**.

### 3.2. Conectar por SSH

```bash
ssh root@TU_IP_DROPLET
# o, si creaste usuario: ssh usuario@TU_IP_DROPLET
```

### 3.3. Instalar Node.js, Git, Nginx y PostgreSQL

```bash
# Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# PostgreSQL
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Nginx
sudo apt install -y nginx
```

### 3.4. Configurar PostgreSQL

```bash
sudo -u postgres psql -c "CREATE USER academic WITH PASSWORD 'PON_AQUI_UN_PASSWORD_SEGURO';"
sudo -u postgres psql -c "CREATE DATABASE academic OWNER academic;"
```

### 3.5. Clonar el repo y configurar la app

```bash
cd /var/www  # o /home/tu_usuario
git clone https://github.com/TU_USUARIO/academic-ddd.git
cd academic-ddd
```

Crear `packages/backend/.env`:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=genera_un_secreto_largo_y_aleatorio
TYPEORM_HOST=localhost
TYPEORM_PORT=5432
TYPEORM_USERNAME=academic
TYPEORM_PASSWORD=PON_AQUI_UN_PASSWORD_SEGURO
TYPEORM_DATABASE=academic
STUDENT_DEFAULT_PASSWORD=TempStudent1!
```

Build y arrancar el backend con PM2:

```bash
npm ci
npm run build -w backend
sudo npm install -g pm2
cd packages/backend && pm2 start dist/main.js --name api
cd ../..
pm2 startup
pm2 save
```

Build del frontend (con la URL donde estará la app, ej. `https://academic.site.com`):

```bash
VITE_API_BASE=https://academic.site.com/api npm run build -w frontend
```

### 3.6. Nginx: servir frontend y proxy al backend

En el repo hay una configuración de ejemplo en [nginx/](../../nginx/). Copia el `.conf` al Droplet y adapta `server_name` y `root`:

```bash
# En el Droplet, crear directorio para estáticos y copiar el build
sudo mkdir -p /var/www/academic.site.com
sudo cp -r /var/www/academic-ddd/packages/frontend/dist/* /var/www/academic.site.com/

# Copiar config Nginx (o crearla a mano según nginx/academic.site.com.conf)
sudo nano /etc/nginx/sites-available/academic
# Pegar la config con server_name academic.site.com; root /var/www/academic.site.com; location /api/ proxy_pass http://127.0.0.1:3000/;

sudo ln -s /etc/nginx/sites-available/academic /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Para HTTPS con Let's Encrypt, sigue la [sección 7](#7-https-con-lets-encrypt-dominio-propio-en-droplet--vps).

### 3.7. Deploy con Docker (opcional)

En el Droplet puedes usar Docker en lugar de Node/PM2: instala Docker, haz `docker login ghcr.io`, pull de las imágenes construidas por [.github/workflows/docker-build.yml](../../.github/workflows/docker-build.yml) y ejecuta backend y frontend con `docker run` (o `docker compose`). Las variables de entorno del backend se pasan con `-e` o un archivo `.env` en el servidor.

### 3.8. Deploy automático desde GitHub Actions (Droplet)

Para que un push a `main` (tras pasar CI) actualice el Droplet por SSH:

1. En GitHub: **Settings** → **Secrets and variables** → **Actions**: añade `DROPLET_HOST` (IP del Droplet), `DROPLET_USER` (ej. `root`), `SSH_PRIVATE_KEY` (contenido de la clave privada).
2. Añade un job en tu workflow que, tras los tests, se conecte por SSH y ejecute `cd academic-ddd && git pull && npm ci && npm run build -w backend && pm2 restart api`, y vuelva a generar el build del frontend y copie `packages/frontend/dist/*` a `/var/www/academic.site.com/` (o use `docker pull` y `docker run` si desplegaste con Docker).

---

## 4. GitHub Actions: tests y despliegue automático

Queremos que **solo se despliegue** si los tests unitarios y e2e pasan. App Platform puede desplegar automáticamente en cada push a `main`; para que el deploy “espere” a CI tienes las opciones siguientes. Si usas **Droplet**, el deploy se hace por SSH (ver [3.8](#38-deploy-automático-desde-github-actions-droplet)).

### Opción A: Deploy automático de App Platform + CI por separado

- **CI**: El workflow [.github/workflows/ci.yml](../../.github/workflows/ci.yml) se ejecuta en cada push/PR y corre tests unitarios y e2e.
- **App Platform**: Conectado al repo, hace deploy en cada push a `main`. No “espera” al CI.
- **Práctica**: Protege la rama `main` (Settings → Branches → Branch protection): exige que el **check de CI** pase antes de hacer merge. Así solo entran a `main` commits que ya pasaron tests, y después App Platform despliega ese commit.

### Opción B: Deploy desde GitHub Actions (API de App Platform)

Puedes disparar un deploy de App Platform desde el workflow cuando CI pase:

1. En DigitalOcean: **API** → **Tokens** → **Generate New Token**. Guarda el token.
2. En GitHub: **Settings** → **Secrets and variables** → **Actions** → crea el secret `DIGITALOCEAN_ACCESS_TOKEN` con ese token.
3. Añade un job al final de [.github/workflows/ci.yml](../../.github/workflows/ci.yml) (o en un workflow que se dispare con `workflow_run` cuando `ci.yml` termine con éxito):

```yaml
  deploy-digitalocean:
    name: Deploy to DigitalOcean App Platform
    needs: [test-unit, test-e2e]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger App Platform deploy
        run: |
          APP_ID="TU_APP_ID"   # Lo ves en la URL del App en DO: cloud.digitalocean.com/apps/<APP_ID>
          curl -X POST "https://api.digitalocean.com/v2/apps/$APP_ID/deployments" \
            -H "Authorization: Bearer ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{"force_build": true}'
```

Sustituye `TU_APP_ID` por el ID de tu aplicación. Así el deploy a producción solo se pide después de que pasen los tests.

---

## 5. Opción: Despliegue con Docker (App Platform o Droplet)

### Archivos Docker del proyecto

- **Backend**: [packages/backend/Dockerfile](../../packages/backend/Dockerfile) — contexto = raíz del repo.
- **Frontend**: [packages/frontend/Dockerfile](../../packages/frontend/Dockerfile) — multi-stage con ARG `VITE_API_BASE`.
- **Compose**: [docker-compose.yml](../../docker-compose.yml) para desarrollo local.
- Workflow [.github/workflows/docker-build.yml](../../.github/workflows/docker-build.yml): build y push a **GitHub Container Registry** cuando CI pasa.

### DigitalOcean App Platform con Dockerfile

App Platform permite usar **Dockerfile** en lugar de build commands:

1. **Backend**: Crea un componente tipo **Web Service**, Source = repo + rama. En **Dockerfile Path** pon `packages/backend/Dockerfile` y **Docker Build Context** = raíz (`.`). Puerto 3000. Añade las variables de entorno (JWT_SECRET, TYPEORM_*, etc.) y conecta la base de datos gestionada.
2. **Frontend**: Componente **Web Service** con Dockerfile Path = `packages/frontend/Dockerfile`, Build Context = raíz. En **Build Arguments** (o variables de build) define `VITE_API_BASE` con la URL pública del backend. Expón el puerto 80.

Si usas **Container Registry** de DigitalOcean: en GitHub Actions, tras el CI, haz build de las imágenes, push a **DOCR** (DigitalOcean Container Registry) y en App Platform crea los componentes desde **Image** (registry) en lugar de desde GitHub. Así el pipeline es: CI → build Docker → push a DOCR → deploy desde registry (manual o con API).

### Pipeline: CI → Docker build → push a DOCR (opcional)

Para push a DigitalOcean Container Registry añade en el workflow de Docker (o en uno separado) login a DOCR y push:

```yaml
- name: Login to DOCR
  uses: docker/login-action@v3
  with:
    registry: registry.digitalocean.com
    username: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
    password: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
- name: Push to DOCR
  run: |
    docker tag ghcr.io/${{ github.repository_owner }}/academic-ddd-backend:latest registry.digitalocean.com/TU_REGISTRY/academic-backend:latest
    docker push registry.digitalocean.com/TU_REGISTRY/academic-backend:latest
```

Luego en App Platform eliges **Deploy from Container Registry** y la imagen `registry.digitalocean.com/TU_REGISTRY/academic-backend:latest`.

---

## 6. Resumen de pasos

**Sin Docker:**  
1. **Registro**: Cuenta DigitalOcean, método de pago, uso de créditos de bienvenida si aplica.
2. **Base de datos**: Crear cluster PostgreSQL y anotar credenciales.
3. **App**: Crear App desde GitHub, dos componentes (Web Service backend + Static Site frontend), variables de entorno y `VITE_API_BASE` apuntando al backend.
4. **Monorepo**: Build commands que usen `npm ci` desde la raíz y `npm run build -w packages/backend` / `-w packages/frontend`; migraciones en build o en un job de release.
5. **CI**: Workflow con tests unitarios y e2e (ver [.github/workflows/ci.yml](../../.github/workflows/ci.yml)).
6. **Deploy**: Protección de rama + deploy automático de App Platform, o job en CI que llame a la API de deploy cuando los tests pasen.

**Con Docker:** App Platform con Dockerfile Path (`packages/backend/Dockerfile` y `packages/frontend/Dockerfile`) y build context = raíz; o CI → build imágenes → push a DOCR → App Platform desde Container Registry.

**Droplet:** Crear Droplet (Ubuntu), instalar Node, PostgreSQL, Nginx, clonar repo, `.env` en backend, build, PM2 para API, Nginx para estáticos y proxy `/api` al backend; opcional Docker o deploy por SSH desde GitHub Actions. HTTPS: [sección 7](#7-https-con-lets-encrypt-dominio-propio-en-droplet--vps).

---

## 7. HTTPS con Let's Encrypt (dominio propio en Droplet / VPS)

Si despliegas en un **Droplet** (o cualquier VPS) con Nginx y usas un dominio propio (ej. `academic.site.com`), puedes obtener un certificado SSL gratuito con **Let's Encrypt** y configurar la renovación automática.

### Requisitos

- El dominio debe apuntar ya al Droplet (registro A o CNAME con la IP del servidor).
- Nginx instalado y el `server` bloque para tu dominio en marcha (puerto 80 accesible para la validación).

### Crear el certificado (primera vez)

Conéctate por SSH al Droplet y ejecuta:

```bash
# Instalar certbot y el plugin para Nginx (Ubuntu/Debian)
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Obtener e instalar el certificado para tu dominio (certbot modifica la config de Nginx)
sudo certbot --nginx -d academic.site.com
```

Certbot pedirá un email para avisos de renovación y, si quieres, aceptar los términos. Elegir **redirect** para forzar HTTP → HTTPS.

Para **varios subdominios** en el mismo certificado:

```bash
sudo certbot --nginx -d academic.site.com -d www.academic.site.com
```

### Renovar el certificado automáticamente

Let's Encrypt emite certificados por 90 días. Certbot instala un **timer** (systemd) o un **cron** que intenta renovar solo.

**Comprobar que el timer está activo (systemd):**

```bash
sudo systemctl status certbot.timer
```

**Probar la renovación en seco (sin aplicar cambios):**

```bash
sudo certbot renew --dry-run
```

**Renovación manual (por si alguna vez falla el automático):**

```bash
sudo certbot renew
sudo systemctl reload nginx
```

**Cron alternativo** (si no usas el timer de certbot): muchas instalaciones añaden en `/etc/cron.d/certbot` algo como:

```cron
0 0,12 * * * root certbot renew -q --deploy-hook "systemctl reload nginx"
```

O en crontab del root:

```bash
sudo crontab -e
# Añadir línea (renovar dos veces al día y recargar nginx si hay nuevo cert):
0 0,12 * * * certbot renew -q --deploy-hook "systemctl reload nginx"
```

### Resumen de comandos

| Acción | Comando |
|--------|--------|
| Instalar certbot (Nginx) | `sudo apt install -y certbot python3-certbot-nginx` |
| Obtener certificado para un dominio | `sudo certbot --nginx -d academic.site.com` |
| Probar renovación | `sudo certbot renew --dry-run` |
| Renovar manualmente | `sudo certbot renew` + `sudo systemctl reload nginx` |
| Ver estado del timer de renovación | `sudo systemctl status certbot.timer` |

**Nota:** Si usas solo **App Platform** (sin Droplet), App Platform ya sirve HTTPS en `*.ondigitalocean.app`. Para **dominio propio** en App Platform, añade el dominio en la App (Settings → Domains) y DigitalOcean puede encargarse del certificado; no necesitas certbot. Esta sección aplica cuando despliegas en un **Droplet** (o VPS) con Nginx.

---

## Tips para usar DigitalOcean de forma gratuita o barata

- **Créditos**: Aprovecha los créditos de bienvenida; con 200 USD puedes tener backend + DB varios meses.
- **Solo frontend gratis**: Despliega solo el **Static Site** (frontend) en App Platform en plan gratuito y el backend en **Railway** o **Render** (tier gratuito) con PostgreSQL; configura `VITE_API_BASE` con la URL de ese backend.
- **Database**: Si no quieres pagar DB en DO, usa un Postgres gratuito (Neon, Supabase, Railway) y pon sus variables en el componente Backend.
- **Alertas**: Configura alertas de gasto en la cuenta para no superar el presupuesto.

---

## Mejores prácticas

- **Secrets**: No subas `.env` al repo; usa solo variables de entorno en App Platform (y en GitHub Secrets para CI).
- **Rama**: Despliega solo desde `main` (o `master`) y exige que el CI pase antes de merge.
- **Variables**: `NODE_ENV=production` y un `JWT_SECRET` fuerte en producción.
- **HTTPS**: App Platform sirve HTTPS por defecto; usa siempre `VITE_API_BASE` con `https://`.
- **Migraciones**: Ejecuta migraciones en el build o en un script de release para no olvidarlas.
