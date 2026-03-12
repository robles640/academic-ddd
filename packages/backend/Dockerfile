# Backend (NestJS + TypeORM). Build context = repo root: docker build -f packages/backend/Dockerfile .
FROM node:20-alpine

WORKDIR /app

# Workspace and both package.json (npm ci resuelve workspaces)
COPY package.json package-lock.json* ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/

# Install dependencies
RUN npm ci

# Backend source (frontend no necesario para build del backend)
COPY packages/backend ./packages/backend

# Build (output: packages/backend/dist)
RUN npm run build -w backend

WORKDIR /app/packages/backend

ENV NODE_ENV=production
EXPOSE 3000

# Migraciones: opcional con script de entrada o variable RUN_MIGRATIONS
# La app lee TYPEORM_* y JWT_SECRET por env; no requiere archivo .env
CMD ["node", "dist/main.js"]
