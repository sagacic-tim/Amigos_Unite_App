# amigos_unite_app/Dockerfile

# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build


# ---------- Runtime stage (static Nginx only; TLS handled by VPS host Nginx) ----------
FROM nginx:alpine

# Copy built SPA into the default Nginx web root
COPY --from=build /app/dist /usr/share/nginx/html

# Production Nginx config for SPA routing (no TLS here)
COPY docker/nginx.prod.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

