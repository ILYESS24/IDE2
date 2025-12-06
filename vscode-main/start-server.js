#!/usr/bin/env node
/**
 * Script de démarrage pour Render
 * Gère automatiquement le port depuis la variable d'environnement $PORT
 */

const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0';

const serverPath = path.join(__dirname, 'out', 'server-main.js');

console.log(`Starting VS Code Server on ${HOST}:${PORT}`);
console.log(`Server path: ${serverPath}`);

const server = spawn('node', [
  serverPath,
  '--host', HOST,
  '--port', PORT.toString(),
  '--accept-server-license-terms'
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    VSCODE_SERVER_PORT: PORT.toString()
  }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Gérer les signaux de terminaison
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.kill('SIGINT');
});

