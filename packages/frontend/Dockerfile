# Frontend (Vite/React). Build context = repo root: docker build -f packages/frontend/Dockerfile .
# VITE_API_BASE se define en build time: --build-arg VITE_API_BASE=https://api.ejemplo.com

# Stage 1: build
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE=http://localhost:3000
ENV VITE_API_BASE=$VITE_API_BASE

COPY package.json package-lock.json* ./
COPY packages/frontend/package.json ./packages/frontend/

RUN npm ci

COPY packages/frontend ./packages/frontend

RUN npm run build -w frontend

# Stage 2: serve with nginx
FROM nginx:alpine AS runner

COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
