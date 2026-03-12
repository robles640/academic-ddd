# Guías de despliegue a producción

Este proyecto (monorepo **frontend** Vite/React + **backend** NestJS/PostgreSQL) se puede desplegar en varias plataformas. En todas las guías se asume que antes de desplegar se ejecutan **tests unitarios** y **tests e2e** con **GitHub Actions**.

## Workflow de CI (tests)

El archivo [../.github/workflows/ci.yml](../.github/workflows/ci.yml) define:

- **Tests unitarios**: backend (`npm run test -w backend`) y frontend (`npm run test -w frontend`).
- **Tests e2e**: PostgreSQL en service container, build de backend y frontend, migraciones, arranque de API (puerto 3000) y frontend (puerto 5173), y ejecución de Playwright (Chromium).

Se ejecuta en cada **push** y **pull request** a la rama `main`. Los despliegues automáticos (por plataforma) o los jobs de deploy en GitHub Actions pueden depender de que estos jobs pasen.

## Guías por plataforma

| Plataforma      | Documento | Resumen |
|-----------------|------------|--------|
| **AWS (EC2)**   | [DEPLOY-AWS.md](DEPLOY-AWS.md) | Registro en AWS, creación de instancia EC2 (t2.micro), PostgreSQL en el servidor, Nginx + PM2, deploy vía SSH desde GitHub Actions. Incluye uso gratuito (Free Tier) y buenas prácticas. |
| **DigitalOcean**| [DEPLOY-DIGITALOCEAN.md](DEPLOY-DIGITALOCEAN.md) | Registro en DigitalOcean, App Platform con dos componentes (backend + frontend estático), base de datos gestionada, opción de disparar deploy desde GitHub Actions. Incluye créditos de bienvenida y uso económico. |
| **Vercel**      | [DEPLOY-VERCEL.md](DEPLOY-VERCEL.md) | Registro en Vercel, despliegue del frontend en Vercel (monorepo), backend en Railway o Render con PostgreSQL. Branch protection y CI para que solo se despliegue código probado. Incluye plan gratuito y buenas prácticas. |

## Despliegue con Docker

En las tres guías se incluye una **opción con Docker**:

- **Backend**: [packages/backend/Dockerfile](../packages/backend/Dockerfile) — build desde la raíz del repo (`docker build -f packages/backend/Dockerfile .`).
- **Frontend**: [packages/frontend/Dockerfile](../packages/frontend/Dockerfile) — multi-stage (build Vite + nginx), ARG `VITE_API_BASE`.
- **Local**: [docker-compose.yml](../docker-compose.yml) — postgres, backend y frontend.
- **CI**: El workflow [.github/workflows/docker-build.yml](../.github/workflows/docker-build.yml) construye y publica las imágenes en **GitHub Container Registry** (ghcr.io) cuando el workflow **CI** (tests unitarios + e2e) termina con éxito en `main`.

Cada guía (AWS, DigitalOcean, Vercel) explica cómo usar estas imágenes en su plataforma (EC2 con pull, App Platform con Dockerfile o registry, Railway/Render con Dockerfile).

## Requisitos comunes

- Repositorio en **GitHub** con el código del proyecto.
- **Variables de entorno** en producción:
  - Backend: `NODE_ENV`, `PORT`, `JWT_SECRET`, `TYPEORM_*`, `STUDENT_DEFAULT_PASSWORD`.
  - Frontend (build): `VITE_API_BASE` con la URL pública del backend.
- No subir `.env` ni claves privadas al repositorio; usar **Secrets** de GitHub y variables de la plataforma.
