# syntax=docker/dockerfile:1

# ---- Build stage: compile the CRA static bundle ----
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies first for better layer caching.
# npm ci installs exactly what package-lock.json pins, for reproducible builds.
COPY package.json package-lock.json ./
RUN npm ci

# Build the production bundle.
# DISABLE_ESLINT_PLUGIN: skip CRA's build-time ESLint step. The ESLint tooling
# pinned in package-lock.json is newer than react-scripts 5 expects and errors
# out on the bundled config ("jest/globals" env unknown), which fails the build.
# CI=false: don't treat any remaining warnings as fatal errors.
ENV DISABLE_ESLINT_PLUGIN=true
ENV CI=false
COPY . .
RUN npm run build

# ---- Serve stage: static files via nginx ----
FROM nginx:1.27-alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
