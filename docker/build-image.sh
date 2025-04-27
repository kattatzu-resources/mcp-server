#!/bin/bash

# Colores para mensajes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Cambiar al directorio raíz del proyecto
cd ..

# Verificar si el package.json existe
if [ ! -f "package.json" ]; then
  echo -e "${RED}Error: No se encuentra package.json${NC}"
  exit 1
fi

# Extraer nombre y versión del package.json
if command -v jq &> /dev/null; then
  PACKAGE_NAME=$(jq -r '.name' package.json)
  PACKAGE_VERSION=$(jq -r '.version' package.json)
else
  PACKAGE_NAME=$(grep -m1 '"name"' package.json | sed 's/.*"name": *"\([^"]*\)".*/\1/')
  PACKAGE_VERSION=$(grep -m1 '"version"' package.json | sed 's/.*"version": *"\([^"]*\)".*/\1/')
fi

# Verificar datos extraídos
if [ -z "$PACKAGE_NAME" ] || [ -z "$PACKAGE_VERSION" ]; then
  echo -e "${RED}Error: No se pudo extraer nombre o versión de package.json${NC}"
  exit 1
fi

# Formatear nombre de imagen (compatible con BSD/macOS y Linux)
IMAGE_NAME=$(echo "$PACKAGE_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-_.')

# Verificar que el nombre no esté vacío
if [ -z "$IMAGE_NAME" ]; then
  echo -e "${RED}Error: El nombre de la imagen no puede estar vacío${NC}"
  echo -e "Contenido de package.json name: ${PACKAGE_NAME}"
  exit 1
fi

echo -e "Nombre de imagen: ${IMAGE_NAME}"
echo -e "Versión: ${PACKAGE_VERSION}"

# Verificar carpeta docker
if [ ! -f "docker/Dockerfile" ]; then
  echo -e "${RED}Error: No se encuentra Dockerfile${NC}"
  exit 1
fi

# Solicitar token de GitHub si no se proporciona como variable de entorno
if [ -z "$PACKAGES_TOKEN" ]; then
  echo -e "${YELLOW}No se encontró la variable de entorno PACKAGES_TOKEN${NC}"
  echo -n "Ingresa tu token de GitHub: "
  read -s PACKAGES_TOKEN
  echo ""

  if [ -z "$PACKAGES_TOKEN" ]; then
    echo -e "${RED}Error: Se requiere un token para acceder a GitHub Packages${NC}"
    exit 1
  fi
fi

# Construir la imagen desde el directorio raíz
if docker build -t "${IMAGE_NAME}:${PACKAGE_VERSION}" \
                --build-arg PACKAGES_TOKEN="$PACKAGES_TOKEN" \
                -f docker/Dockerfile .; then
  echo -e "${GREEN}Imagen ${IMAGE_NAME}:${PACKAGE_VERSION} construida con éxito${NC}"
else
  echo -e "${RED}Error al construir la imagen${NC}"
  exit 1
fi