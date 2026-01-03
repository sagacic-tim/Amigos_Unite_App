# amigos_unite_app/Dockerfile

# ---------- Build stage ----------
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Runtime stage (Nginx serving static files + proxy to Rails API) ----------
FROM nginx:alpine

# Create directory where we'll mount mkcert TLS files
RUN mkdir -p /etc/nginx/certs

# Copy built SPA into the default Nginx web root
COPY --from=build /app/dist /usr/share/nginx/html

# Our custom HTTPS + /api proxy config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Nginx will listen on 443 inside the container (HTTPS)
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
