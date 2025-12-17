# Configuration de l'API Aurora AI

## Erreur 400 - Clés API manquantes

L'erreur 400 que vous rencontrez signifie que les clés API nécessaires ne sont pas configurées.

## Configuration requise

1. **Créez un fichier `.env`** dans le répertoire racine du projet :
   ```bash
   cp .env.example .env  # Si le fichier existe
   # ou créez .env manuellement
   ```

2. **Configurez vos clés API dans `.env`** :

   ### Option 1: OpenRouter (RECOMMANDÉ - accès à tous les modèles)
   ```env
   # Clé API OpenRouter (RECOMMANDÉ - accès à tous les modèles via une seule API)
   OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key-here

   # Configuration OpenRouter (optionnel - valeurs par défaut ci-dessous)
   OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   OPENROUTER_MODEL=openai/gpt-4o-mini

   # Port du serveur
   PORT=8000
   ```

   **Modèles populaires sur OpenRouter :**
   - `openai/gpt-4o-mini` (recommandé - équilibré)
   - `openai/gpt-4o` (meilleur mais plus cher)
   - `anthropic/claude-3-haiku` (rapide et bon)
   - `anthropic/claude-3-sonnet` (excellent)
   - `google/gemini-pro` (bon rapport qualité/prix)

   ### Option 2: OpenAI direct
   ```env
   # Clé API OpenAI (OBLIGATOIRE pour la génération de workflows)
   OPENAI_API_KEY=sk-your-openai-api-key-here

   # Port du serveur
   PORT=8000
   ```

   ### Option 3: DeepSeek (moins cher)
   ```env
   # Clé API DeepSeek (optionnel - moins cher que OpenAI)
   DEEPSEEK_API_KEY=sk-your-deepseek-key-here
   DEEPSEEK_MODEL=deepseek-chat
   DEEPSEEK_BASE_URL=https://api.deepseek.com

   # Port du serveur
   PORT=8000
   ```

## Démarrage de l'API

### Avec uv (recommandé si installé) :
```bash
uv run python api.py
```

### Avec pip (si uv n'est pas installé) :
```bash
pip install -r requirements.txt
python api.py
```

### Avec Python directement :
```bash
python -m pip install -r requirements.txt
python api.py
```

## Obtenir les clés API

### 🏆 **OpenRouter (RECOMMANDÉ - Tous les modèles en 1)**
- **Site web** : https://openrouter.ai/
- **Avantages** : Accès à 100+ modèles (GPT-4, Claude, Gemini, etc.) via une seule API
- **Prix** : Crédits gratuits au départ, paiement à l'usage
- **Comment obtenir** :
  1. Créez un compte sur https://openrouter.ai/
  2. Allez dans "API Keys" et créez une nouvelle clé
  3. La clé commence par `sk-or-v1-`

### Autres options :
- **OpenAI**: https://platform.openai.com/api-keys
- **DeepSeek**: https://platform.deepseek.com/api-keys (moins cher)
- **Anthropic**: https://console.anthropic.com/
- **Google AI**: https://makersuite.google.com/app/apikey

## Vérification

Une fois l'API démarrée, visitez `http://localhost:8000/health` pour vérifier que tout fonctionne.

## Configuration sur Render (Déploiement)

Si vous déployez sur Render et obtenez une erreur 400 :

### 🔧 Configuration des variables d'environnement sur Render

1. **Allez sur votre dashboard Render** : https://dashboard.render.com/
2. **Sélectionnez votre service API** (flo-ai-api ou similaire)
3. **Allez dans "Environment"**
4. **Ajoutez ces variables** :

   ```
   OPENROUTER_API_KEY=sk-or-v1-votre-cle-ici
   OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   OPENROUTER_MODEL=openai/gpt-4o-mini
   PORT=10000
   ```

5. **Redémarrez le service** depuis l'onglet "Manual Deploy"

### 🚀 Script de déploiement automatique

Utilisez le script PowerShell mis à jour :
```powershell
.\DEPLOY-TO-RENDER-NOW.ps1
```

Il configurera automatiquement OpenRouter pour vous !

## Dépannage

Si vous avez encore des erreurs :
1. Vérifiez que vos clés API sont valides sur https://openrouter.ai/
2. Vérifiez que les variables d'environnement sont configurées sur Render
3. Vérifiez les logs Render pour plus de détails
4. Redémarrez le service après modification des variables
