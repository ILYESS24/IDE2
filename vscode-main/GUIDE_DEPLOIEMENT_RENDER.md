# Guide de Déploiement VS Code sur Render

## 📋 Prérequis

1. Compte Render (gratuit disponible)
2. Repository Git (GitHub, GitLab, ou Bitbucket)
3. VS Code compilé et prêt

## 🚀 Méthode 1 : Déploiement via render.yaml (Recommandé)

### Étape 1 : Préparer le repository

Assurez-vous que votre code est sur GitHub/GitLab/Bitbucket.

### Étape 2 : Vérifier les fichiers de configuration

Les fichiers suivants sont déjà créés dans le projet :

- ✅ `render.yaml` - Configuration Render
- ✅ `start-server.js` - Script de démarrage
- ✅ `Dockerfile.render` - Alternative Docker
- ✅ `.renderignore` - Fichiers à ignorer

Le fichier `render.yaml` contient :

```yaml
services:
  - type: web
    name: vscode-server
    env: node
    plan: standard  # standard ou pro recommandé
    buildCommand: npm install && npm run compile && npm run compile-extensions-build
    startCommand: node start-server.js
    envVars:
      - key: NODE_ENV
        value: production
```

### Étape 3 : Déployer sur Render

1. Connectez-vous à [Render Dashboard](https://dashboard.render.com)
2. Cliquez sur **"New +"** → **"Blueprint"**
3. Connectez votre repository Git
4. Render détectera automatiquement le fichier `render.yaml`
5. Cliquez sur **"Apply"**

### Étape 4 : Attendre le build

- Le build peut prendre **15-30 minutes** (première fois)
- Render va :
  - Installer les dépendances (`npm install`)
  - Compiler VS Code (`npm run compile`)
  - Compiler les extensions (`npm run compile-extensions-build`)

---

## 🐳 Méthode 2 : Déploiement via Dockerfile

Si `render.yaml` ne fonctionne pas, utilisez le Dockerfile :

### Étape 1 : Créer le service

1. Render Dashboard → **"New +"** → **"Web Service"**
2. Connectez votre repository
3. Sélectionnez **"Docker"** comme environnement
4. Render utilisera automatiquement `Dockerfile.render`

### Étape 2 : Configuration

- **Name** : `vscode-server`
- **Region** : Choisissez la région la plus proche
- **Branch** : `main` ou `master`
- **Root Directory** : `.` (racine)
- **Dockerfile Path** : `Dockerfile.render`

---

## ⚙️ Configuration Manuelle (Alternative)

Si vous préférez configurer manuellement :

### 1. Créer un nouveau Web Service

1. Render Dashboard → **"New +"** → **"Web Service"**
2. Connectez votre repository Git

### 2. Paramètres de Build

- **Environment** : `Node`
- **Build Command** :
  ```bash
  npm install && npm run compile && npm run compile-extensions-build
  ```
- **Start Command** :
  ```bash
  node start-server.js
  ```
  
  Ou directement :
  ```bash
  node out/server-main.js --host 0.0.0.0 --port $PORT --accept-server-license-terms
  ```

### 3. Variables d'Environnement

Ajoutez ces variables dans **Environment** :

| Clé | Valeur |
|-----|--------|
| `NODE_ENV` | `production` |
| `VSCODE_SERVER_PORT` | `$PORT` (Render définit automatiquement) |
| `VSCODE_AGENT_FOLDER` | `/opt/render/project/src` |

### 4. Plan et Ressources

- **Plan** : 
  - **Starter** (gratuit) : 512 MB RAM, 0.5 CPU
  - **Standard** (recommandé) : 2 GB RAM, 1 CPU - $7/mois
  - **Pro** : 4 GB RAM, 2 CPU - $25/mois

⚠️ **Note** : Le plan Starter peut être insuffisant pour compiler VS Code. Utilisez au moins **Standard**.

### 5. Disque Persistant (Optionnel)

Pour sauvegarder les données VS Code :

1. **Settings** → **Disks**
2. Cliquez sur **"Create Disk"**
3. **Name** : `vscode-data`
4. **Mount Path** : `/opt/render/project/src/.vscode-data`
5. **Size** : 10 GB (minimum)

---

## 🔧 Optimisations

### Réduire le temps de build

Créez un fichier `.render-build-cache` pour mettre en cache les dépendances :

```bash
# .render-build-cache
node_modules/
out/
```

### Build séparé (Recommandé pour production)

1. **Build localement** :
   ```bash
   npm install
   npm run compile
   npm run compile-extensions-build
   ```

2. **Commit les fichiers compilés** :
   ```bash
   git add out/
   git commit -m "Add compiled files"
   ```

3. **Modifier render.yaml** :
   ```yaml
   buildCommand: echo "Using pre-compiled files"
   ```

⚠️ **Attention** : Cela augmente la taille du repository.

---

## 🌐 Accéder à VS Code

Une fois déployé :

1. Render vous donnera une URL : `https://vscode-server.onrender.com`
2. Ouvrez cette URL dans votre navigateur
3. VS Code devrait se charger

### Première connexion

- Vous devrez peut-être accepter les termes de licence
- Créez un mot de passe si demandé
- Connectez-vous avec votre compte

---

## 🔒 Sécurité

### Ajouter une authentification

1. **Settings** → **Environment**
2. Ajoutez :
   ```
   VSCODE_SERVER_AUTH=password
   VSCODE_SERVER_PASSWORD=votre-mot-de-passe-securise
   ```

### Utiliser HTTPS

Render fournit HTTPS automatiquement avec Let's Encrypt.

---

## 📊 Monitoring

### Logs

- **Dashboard** → Votre service → **"Logs"**
- Surveillez les erreurs de compilation
- Vérifiez les logs de démarrage

### Métriques

- **Dashboard** → Votre service → **"Metrics"**
- Surveillez :
  - CPU usage
  - Memory usage
  - Request count

---

## 🐛 Dépannage

### Build échoue

**Problème** : Out of memory
- **Solution** : Passez au plan Standard ou Pro

**Problème** : Timeout de build
- **Solution** : Utilisez des builds pré-compilés

### Service ne démarre pas

**Vérifiez** :
1. Les logs dans Render Dashboard
2. Que `out/server-main.js` existe
3. Que le port est correct (`$PORT`)

### Erreur "Cannot find module"

**Solution** :
```bash
# Dans Render Shell
npm install
npm run compile
```

---

## 💰 Coûts

### Plan Gratuit (Starter)
- ⚠️ **Limité** : Peut ne pas suffire pour compiler
- 750 heures/mois gratuites
- Service s'endort après 15 min d'inactivité

### Plan Standard ($7/mois)
- ✅ **Recommandé** pour VS Code
- 2 GB RAM
- Pas de mise en veille
- Support prioritaire

### Plan Pro ($25/mois)
- Pour usage intensif
- 4 GB RAM
- Meilleures performances

---

## 📝 Checklist de Déploiement

- [ ] Repository Git configuré
- [ ] Fichier `render.yaml` créé
- [ ] Variables d'environnement configurées
- [ ] Plan choisi (Standard recommandé)
- [ ] Build réussi
- [ ] Service démarré
- [ ] URL accessible
- [ ] Authentification configurée (optionnel)

---

## 🔗 Ressources

- [Documentation Render](https://render.com/docs)
- [VS Code Server](https://code.visualstudio.com/docs/remote/vscode-server)
- [Render Pricing](https://render.com/pricing)

---

## ⚠️ Notes Importantes

1. **Premier build** : Peut prendre 20-30 minutes
2. **Mémoire** : VS Code nécessite au moins 2 GB RAM pour compiler
3. **Disque** : Prévoir au moins 5 GB d'espace
4. **Timeout** : Les builds peuvent timeout sur le plan gratuit
5. **Mise en veille** : Le plan gratuit met le service en veille après 15 min

---

## 🎉 C'est prêt !

Une fois déployé, vous aurez VS Code accessible depuis n'importe où via votre URL Render.

**Bon déploiement ! 🚀**

