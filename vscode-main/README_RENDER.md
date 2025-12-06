# 🚀 Déploiement VS Code sur Render - Guide Rapide

## ⚡ Démarrage Rapide

### 1. Préparer le repository
```bash
# Assurez-vous que tous les fichiers sont commités
git add .
git commit -m "Add Render configuration"
git push
```

### 2. Déployer sur Render

**Option A : Via Blueprint (Recommandé)**
1. Allez sur [Render Dashboard](https://dashboard.render.com)
2. Cliquez sur **"New +"** → **"Blueprint"**
3. Connectez votre repository GitHub/GitLab
4. Render détectera automatiquement `render.yaml`
5. Cliquez sur **"Apply"**

**Option B : Via Web Service**
1. **"New +"** → **"Web Service"**
2. Connectez votre repository
3. Configurez :
   - **Build Command** : `npm install && npm run compile && npm run compile-extensions-build`
   - **Start Command** : `node start-server.js`
   - **Plan** : `Standard` (minimum recommandé)

### 3. Attendre le build
- ⏱️ **Premier build** : 20-30 minutes
- 📊 Surveillez les logs dans Render Dashboard

### 4. Accéder à VS Code
- Une fois déployé, vous obtiendrez une URL : `https://vscode-server.onrender.com`
- Ouvrez cette URL dans votre navigateur

---

## 📋 Fichiers de Configuration

| Fichier | Description |
|---------|-------------|
| `render.yaml` | Configuration principale Render |
| `start-server.js` | Script de démarrage du serveur |
| `Dockerfile.render` | Alternative Docker (si nécessaire) |
| `.renderignore` | Fichiers à exclure du déploiement |

---

## ⚙️ Configuration Recommandée

### Plan Render
- **Starter** (Gratuit) : ⚠️ Peut être insuffisant pour compiler
- **Standard** ($7/mois) : ✅ **Recommandé** - 2 GB RAM
- **Pro** ($25/mois) : Pour usage intensif - 4 GB RAM

### Variables d'Environnement
Aucune variable supplémentaire nécessaire - tout est géré automatiquement.

---

## 🔧 Dépannage

### Build échoue
- **Erreur "Out of memory"** → Passez au plan Standard/Pro
- **Timeout** → Le build peut prendre 30+ minutes

### Service ne démarre pas
- Vérifiez les logs dans Render Dashboard
- Assurez-vous que `out/server-main.js` existe après le build

### Port non défini
- Render définit automatiquement `$PORT`
- Le script `start-server.js` gère cela automatiquement

---

## 📚 Documentation Complète

Pour plus de détails, consultez : **[GUIDE_DEPLOIEMENT_RENDER.md](./GUIDE_DEPLOIEMENT_RENDER.md)**

---

## ✅ Checklist

- [ ] Repository Git configuré
- [ ] Fichiers de configuration commités
- [ ] Service créé sur Render
- [ ] Build réussi
- [ ] Service démarré
- [ ] URL accessible

**Bon déploiement ! 🎉**

