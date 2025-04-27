FROM node:latest

WORKDIR /app

# Establecer ARG para el token de GitHub Packages
ARG PACKAGES_TOKEN

# Copiar .npmrc y configurar el token
COPY .npmrc ./
RUN if [ -n "$PACKAGES_TOKEN" ]; then \
      sed -i "s|\${PACKAGES_TOKEN}|$PACKAGES_TOKEN|g" .npmrc; \
    fi

# Instalar dependencias
COPY package.json yarn.lock ./
RUN yarn install

# Copiar el resto del código y construir
COPY . .
RUN yarn build

EXPOSE 3001

CMD ["yarn", "start"]