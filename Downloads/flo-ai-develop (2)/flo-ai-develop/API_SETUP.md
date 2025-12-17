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
   ```env
   # Clé API OpenAI (OBLIGATOIRE pour la génération de workflows)
   OPENAI_API_KEY=sk-your-openai-api-key-here

   # Clé API Anthropic (optionnel)
   ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

   # Clé API Google/Gemini (optionnel)
   GOOGLE_API_KEY=your-google-api-key-here

   # Clé API DeepSeek (RECOMMANDÉ - moins cher que OpenAI)
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

- **OpenAI**: https://platform.openai.com/api-keys
- **DeepSeek**: https://platform.deepseek.com/api-keys (recommandé, moins cher)
- **Anthropic**: https://console.anthropic.com/
- **Google AI**: https://makersuite.google.com/app/apikey

## Vérification

Une fois l'API démarrée, visitez `http://localhost:8000/health` pour vérifier que tout fonctionne.

## Dépannage

Si vous avez encore des erreurs :
1. Vérifiez que vos clés API sont valides
2. Vérifiez que le fichier `.env` est dans le bon répertoire
3. Redémarrez l'API après avoir modifié `.env`
4. Vérifiez les logs de l'API pour plus de détails
