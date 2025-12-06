# DOCKERFILE POUR RENDER - VERSION FINALE CORRECTE
# ====================================================
# Cette version utilise npm install au lieu de npm ci
# Créé le: 2025-12-06 19:30 UTC
# Commit: FORCE_REBUILD_2025

FROM node:22-slim

# Installation des dépendances système
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

# Configuration du workspace
WORKDIR /app

# Copie des fichiers package.json en premier
COPY package*.json ./

# INSTALLATION NPM - VERSION CORRECTE: npm install
RUN npm install

# Copie du code source
COPY . .

# Compilation de VS Code
RUN npm run compile && npm run compile-extensions-build

# Exposition du port
EXPOSE $PORT

# Commande de démarrage
CMD ["node", "start-server.js"]