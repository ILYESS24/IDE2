# 🚀 Déploiement de Flo AI sur Render

Ce guide explique comment déployer complètement Flo AI sur Render avec tous ses composants.

## 📋 Architecture déployée

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Flo AI Studio │    │   Flo AI API    │    │ PostgreSQL DB   │
│   (React App)   │◄──►│  (FastAPI)      │◄──►│   (Render)      │
│   Static Site   │    │ Web Service     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Déploiement étape par étape

### 1. Prérequis

- Compte Render (https://render.com)
- Clés API pour les LLM (OpenAI, Anthropic, Google)
- Repository GitHub avec ce code

### 2. Créer la base de données PostgreSQL

1. Allez sur https://dashboard.render.com
2. Cliquez sur "New" → "PostgreSQL"
3. Configurez :
   - **Name** : `flo-ai-db`
   - **Plan** : Free ou Starter
   - **Region** : Oregon (US West)
   - **Version** : 16

### 3. Déployer l'API Python (Backend)

1. Cliquez sur "New" → "Web Service"
2. Connectez votre repository GitHub
3. Configurez :
   - **Name** : `flo-ai-api`
   - **Runtime** : Python 3
   - **Build Command** : `pip install -r aurora_ai/requirements.txt`
   - **Start Command** : `cd aurora_ai && python api.py`
   - **Plan** : Starter ($7/mois)

4. **Variables d'environnement** :
   ```
   PYTHON_VERSION=3.11
   OPENAI_API_KEY=your_openai_key
   ANTHROPIC_API_KEY=your_anthropic_key
   GOOGLE_API_KEY=your_google_key
   DATABASE_URL=postgresql://[from-db-service]
   ```

### 4. Déployer le Studio (Frontend)

1. Cliquez sur "New" → "Static Site"
2. Connectez votre repository GitHub
3. Configurez :
   - **Name** : `flo-ai-studio`
   - **Build Command** : `cd studio && npm install && npm run build`
   - **Publish Directory** : `./studio/dist`
   - **Plan** : Free

4. **Variables d'environnement** (optionnel) :
   ```
   API_URL=https://flo-ai-api.onrender.com
   ```

### 5. Configuration finale

#### Mettre à jour l'API URL dans le Studio

Modifiez `studio/src/lib/config.ts` (ou créez-le) :

```typescript
export const config = {
  API_BASE_URL: process.env.API_URL || 'https://flo-ai-api.onrender.com',
};
```

#### Configurer CORS dans l'API

Dans `aurora_ai/api.py`, mettez à jour CORS :

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://flo-ai-studio.onrender.com",
        "http://localhost:5173"  # Pour le développement local
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🔧 Endpoints API disponibles

Une fois déployé, votre API sera accessible à :

### Health Check
```
GET https://flo-ai-api.onrender.com/health
```

### Chat avec un agent
```
POST https://flo-ai-api.onrender.com/agent/chat
Content-Type: application/json

{
  "prompt": "Explique-moi comment fonctionne l'IA",
  "model": "gpt-4o-mini",
  "provider": "openai",
  "temperature": 0.7
}
```

### Workflow simple
```
POST https://flo-ai-api.onrender.com/workflow/simple
Content-Type: application/json

{
  "task": "Créer une API REST pour gérer des utilisateurs",
  "agents_config": {
    "planner": {"prompt": "Tu es un planificateur..."},
    "developer": {"prompt": "Tu es un développeur..."}
  }
}
```

### Workflow YAML
```
POST https://flo-ai-api.onrender.com/workflow/yaml
Content-Type: application/json

{
  "yaml_config": "...votre config YAML...",
  "inputs": ["Votre tâche ici"]
}
```

## 🎯 Utilisation

1. **Studio** : https://flo-ai-studio.onrender.com
   - Interface visuelle pour créer des workflows
   - Drag & drop des agents
   - Export YAML

2. **API** : https://flo-ai-api.onrender.com
   - Endpoints REST pour intégrer Flo AI
   - Support multi-LLM
   - Workflows programmables

## 🔐 Sécurité

- Gardez vos clés API privées
- Utilisez HTTPS en production
- Configurez CORS correctement
- Surveillez les logs Render

## 🚀 Déploiement automatique

Utilisez le script `deploy-render.sh` pour un déploiement automatisé :

```bash
chmod +x deploy-render.sh
./deploy-render.sh
```

## 📊 Monitoring

Render fournit :
- Logs en temps réel
- Métriques de performance
- Alertes automatiques
- Backups de base de données

## 💡 Prochaines étapes

- [ ] Tester tous les endpoints
- [ ] Configurer un domaine personnalisé
- [ ] Ajouter de l'authentification
- [ ] Configurer les backups
- [ ] Monitorer les coûts

---

**🎉 Votre Flo AI est maintenant déployé sur Render !**
