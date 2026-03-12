# Despliegue en Vercel (Frontend + Backend externo)

Guía paso a paso para registrarte en Vercel y desplegar este proyecto. En Vercel desplegamos el **frontend** (ideal para Vite/React). El **backend** (NestJS + PostgreSQL) se despliega en un servicio externo (Railway, Render, etc.) y se conecta mediante la variable `VITE_API_BASE`. Incluye **GitHub Actions** para tests unitarios y e2e antes de permitir merge/deploy.

---

## 1. Registro en Vercel

1. Entra en [vercel.com](https://vercel.com) y pulsa **Sign Up**.
2. Elige **Continue with GitHub** (recomendado para conectar el repo).
3. Autoriza a Vercel para acceder a tus repositorios.
4. No hace falta tarjeta para el plan **Hobby (gratuito)**.

### Plan Hobby (gratuito)

- **Sitios estáticos y Serverless**: Deploy ilimitados, ancho de banda generoso.
- **Límites**: 1 build concurrente; 100 GB-hora de ejecución de serverless; adecuado para frontends y APIs ligeras.
- **Dominio**: Puedes usar un dominio propio o el subdominio `*.vercel.app`.

---

## 2. Desplegar el frontend en Vercel

1. En el dashboard de Vercel: **Add New** → **Project**.
2. Importa el repositorio **academic-ddd** desde GitHub.
3. Configura el proyecto como **monorepo**:
   - **Root Directory**: `packages/frontend` (o deja la raíz y configura Framework Preset y paths).
   - Si usas **Root Directory** = `packages/frontend`:
     - **Framework Preset**: Vite.
     - **Build Command**: `npm run build` (se ejecuta dentro de `packages/frontend`; necesitas instalar dependencias desde la raíz).
   - Para monorepos con npm workspaces, suele ser mejor dejar **Root Directory** vacío y configurar todo en la raíz:
     - **Root Directory**: (vacío)
     - **Framework Preset**: Other o Vite.
     - **Build Command**: `npm ci && npm run build -w packages/frontend`
     - **Output Directory**: `packages/frontend/dist`
     - **Install Command**: `npm ci`

4. **Environment Variables** (en Vercel, pestaña del proyecto):
   - `VITE_API_BASE`: URL pública del backend. La primera vez puedes poner un placeholder (ej. `https://tu-api.railway.app`) y actualizarla cuando tengas el backend desplegado.

5. **Deploy**. Vercel asignará una URL (ej. `academic-ddd-xxx.vercel.app`). Cada push a `main` generará un nuevo deploy si tienes la integración con GitHub activada.

### Si Root Directory = `packages/frontend`

- **Install Command**: desde la raíz no se puede si el root del proyecto en Vercel es `packages/frontend`. En ese caso:
  - **Install**: `npm ci` (solo instala de `packages/frontend`); si el frontend no tiene todas las dependencias en su `package.json`, puede fallar.
  - Mejor: **Root Directory** vacío, **Build Command** = `npm ci && npm run build -w packages/frontend`, **Output Directory** = `packages/frontend/dist`.

---

## 3. Desplegar el backend (Railway o Render, gratuito)

Vercel no está pensado para una app NestJS con PostgreSQL persistente. Opciones recomendadas:

### Opción A: Railway

1. [railway.app](https://railway.app) → **Login with GitHub**.
2. **New Project** → **Deploy from GitHub repo** → elige **academic-ddd**.
3. **Settings** del servicio:
   - **Root Directory**: `packages/backend`
   - **Build Command**: `npm ci --prefix ../.. && npm run build -w packages/backend` (o desde raíz: `npm ci && npm run build -w packages/backend` si el contexto es la raíz).
   - **Start Command**: `node dist/main.js` (o `node packages/backend/dist/main.js` si ejecutas desde raíz).
4. Añade el **add-on PostgreSQL** en el mismo proyecto; Railway asigna variables `DATABASE_URL` o separadas. Adapta el backend para usar `TYPEORM_URL` o las variables que exponga Railway (o configura TYPEORM_HOST, PORT, etc. desde el panel).
5. Variables de entorno: `NODE_ENV=production`, `JWT_SECRET`, y las de TypeORM/Postgres.
6. Anota la URL pública del servicio (ej. `https://academic-ddd-production.up.railway.app`) y ponla en **Vercel** como `VITE_API_BASE` en el proyecto frontend.

### Opción B: Render

1. [render.com](https://render.com) → **Get Started** con GitHub.
2. **New** → **Web Service** → conecta el repo **academic-ddd**.
3. **Root Directory**: `packages/backend`.
4. **Build Command**: `npm install -g npm && npm ci --prefix ../.. && npm run build -w backend` (ajusta si el contexto es la raíz).
5. **Start Command**: `node dist/main.js`.
6. **Add PostgreSQL** (base de datos) en el mismo grupo; Render inyecta variables como `DATABASE_URL`. Configura en el backend el uso de esa URL o mapea a TYPEORM_*.
7. Añade `JWT_SECRET`, `NODE_ENV=production`, etc. en **Environment**.
8. Anota la URL del Web Service y úsala como `VITE_API_BASE` en Vercel.

---

## 4. GitHub Actions: tests antes de deploy

El workflow [.github/workflows/ci.yml](../../.github/workflows/ci.yml) ya define:

- **test-unit**: tests de backend y frontend.
- **test-e2e**: PostgreSQL en service container, build backend + frontend, arranque de API y frontend, Playwright (Chromium).

**Vercel** despliega automáticamente en cada push a `main`. Para que “solo se despliegue código probado”:

1. **Branch protection** en GitHub: **Settings** → **Branches** → **Add rule** para `main`:
   - **Require status checks to pass before merging**: marca el check **Tests unitarios** (y si expones el job e2e, también **Tests e2e**).
   - Así solo se hace merge cuando el CI pasa; el siguiente push a `main` será el que despliegue Vercel (y ya habrá pasado tests).

No necesitas un job extra en GitHub Actions para “desplegar a Vercel”: Vercel ya despliega al hacer push. Si quisieras desplegar solo tras CI (sin branch protection), podrías usar **Vercel Deploy Hook**: en el proyecto Vercel → **Settings** → **Git** → **Deploy Hook**; llamas a esa URL desde un job que tenga `needs: [test-unit, test-e2e]` en tu workflow.

Ejemplo de job para disparar un deploy hook (opcional):

```yaml
  deploy-vercel:
    needs: [test-unit, test-e2e]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Vercel Deploy
        run: |
          curl -X POST "${{ secrets.VERCEL_DEPLOY_HOOK_URL }}"
```

Crea el secret `VERCEL_DEPLOY_HOOK_URL` con la URL del deploy hook.

---

## 5. Opción: Backend con Docker (Railway / Render)

El **frontend** en Vercel no usa Docker. Para el **backend** puedes desplegarlo como **imagen Docker** en Railway o Render usando los mismos Dockerfiles del repo.

### Archivos Docker

- **Backend**: [packages/backend/Dockerfile](../../packages/backend/Dockerfile) — build desde raíz del repo.
- **Frontend** (si en algún momento lo sirves en otro host): [packages/frontend/Dockerfile](../../packages/frontend/Dockerfile) con `VITE_API_BASE`.
- **Compose**: [docker-compose.yml](../../docker-compose.yml) para pruebas locales.

### Railway con Docker

1. Railway → New Project → **Deploy from GitHub repo** (academic-ddd).
2. En el servicio, **Settings** → **Build**: elige **Dockerfile** y **Dockerfile Path** = `packages/backend/Dockerfile`, **Root Directory** = raíz (o deja que Railway use la raíz).
3. Añade el add-on **PostgreSQL** y configura las variables TYPEORM_* (o DATABASE_URL si adaptas el backend).
4. Variables: `NODE_ENV=production`, `JWT_SECRET`, etc. La URL pública del servicio es tu `VITE_API_BASE` en Vercel.

### Render con Docker

1. Render → **New** → **Web Service** → conecta el repo.
2. **Environment**: **Docker**.
3. **Dockerfile Path**: `packages/backend/Dockerfile` (context = repo root).
4. Añade **PostgreSQL** en el mismo grupo y enlaza las variables. Configura `JWT_SECRET` y el resto.
5. Usa la URL del Web Service como `VITE_API_BASE` en el proyecto frontend de Vercel.

### Pipeline: build de imágenes en GitHub Actions

El workflow [.github/workflows/docker-build.yml](../../.github/workflows/docker-build.yml) hace build y push a **ghcr.io** cuando el CI pasa. Si Railway o Render están configurados para pull desde **GitHub Container Registry**, puedes usar la imagen `ghcr.io/TU_ORG/academic-ddd-backend:latest` en lugar de build desde el repo (configuración depende de cada servicio).

---

## 6. Resumen de pasos

1. **Vercel** (frontend): Cuenta con GitHub, nuevo proyecto desde repo, monorepo con root en raíz, build `npm ci && npm run build -w packages/frontend`, output `packages/frontend/dist`, variable `VITE_API_BASE` = URL del backend.
2. **Backend**: Railway o Render, repo mismo, root `packages/backend`, build/start según guía, PostgreSQL añadido, variables de entorno y URL pública.
3. **Conectar**: En Vercel, `VITE_API_BASE` = URL del backend; redeploy del frontend si cambias la URL.
4. **CI**: Workflow con tests unitarios y e2e; branch protection para que solo se fusione cuando pasen los tests.

**Backend con Docker:** Despliega el backend como imagen Docker en Railway o Render (Dockerfile Path = `packages/backend/Dockerfile`). Opcional: usar imágenes construidas en GitHub Actions (ghcr.io) si el servicio soporta deploy desde registry.

---

## Tips para usar Vercel y backend de forma gratuita

- **Vercel Hobby**: Sin tarjeta, suficiente para el frontend; evita funciones serverless pesadas o muchas invocaciones si no quieres límites.
- **Railway**: Plan gratuito con límite de uso mensual; suficiente para un backend de pruebas/demo.
- **Render**: Tier gratuito para Web Services (se duerme tras inactividad); gratis para PostgreSQL pequeño. Ideal para backend + DB de desarrollo/demo.
- **Dominio**: En Vercel puedes añadir un dominio propio gratis (solo el dominio lo pagas a tu registrador).

---

## Mejores prácticas

- **CORS**: En el backend (NestJS), configura CORS con el origen del frontend en producción (ej. `https://tu-app.vercel.app`).
- **Secrets**: `JWT_SECRET` y credenciales de DB solo en variables de entorno del backend (Railway/Render), nunca en el repo ni en el frontend.
- **VITE_API_BASE**: Solo se usa en build; si cambias la URL del backend, hay que volver a desplegar el frontend en Vercel.
- **Rama**: Despliega solo desde `main` y exige que el CI pase antes de merge.
- **HTTPS**: Usa siempre `https://` en `VITE_API_BASE` y en producción.
