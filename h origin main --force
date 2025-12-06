# Dockerfile pour Render - VS Code Server
# Version: 1.0.2 - Fixed build directory issue
FROM node:22-slim

# Installer les dépendances système nécessaires pour compiler VS Code
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances en premier (pour optimiser le cache Docker)
COPY package*.json ./

# Installer les dépendances npm
RUN npm ci

# Copier le reste du code source
COPY . .

# Compiler VS Code
RUN npm run compile && npm run compile-extensions-build

# Exposer le port (Render définit automatiquement $PORT)
EXPOSE $PORT

# Commande de démarrage
CMD ["node", "start-server.js"]