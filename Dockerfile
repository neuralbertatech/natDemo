# syntax=docker/dockerfile:1

# ---- Build stage: compile the CRA static bundle ----
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json ./
RUN npm install

# Build the production bundle.
COPY . .
RUN npm run build

# ---- Serve stage: static files via nginx ----
FROM nginx:1.27-alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
