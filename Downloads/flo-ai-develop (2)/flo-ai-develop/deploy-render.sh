#!/bin/bash
# Script de déploiement complet pour Flo AI sur Render

echo "🚀 Déploiement de Flo AI sur Render"
echo "==================================="

# Vérifier si Render CLI est installé
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI n'est pas installé."
    echo "   Installez-le depuis : https://docs.render.com/docs/cli"
    exit 1
fi

# Se connecter à Render
echo "🔐 Connexion à Render..."
render login

# Créer la base de données PostgreSQL
echo "🗄️  Création de la base de données PostgreSQL..."
render postgres create flo-ai-db --plan free --region oregon --version 16

# Créer le service API Python
echo "🐍 Création du service API Python..."
render web create flo-ai-api \
    --repo https://github.com/rootflo/flo-ai \
    --branch main \
    --runtime python3 \
    --build-command "pip install -r flo_ai/requirements.txt" \
    --start-command "cd flo_ai && python api.py" \
    --env-vars "PYTHON_VERSION=3.11,OPENAI_API_KEY=your_key_here,ANTHROPIC_API_KEY=your_key_here,GOOGLE_API_KEY=your_key_here" \
    --plan starter

# Créer le site statique pour le studio
echo "🎨 Création du site statique pour le Studio..."
render static create flo-ai-studio \
    --repo https://github.com/rootflo/flo-ai \
    --branch main \
    --build-command "cd studio && npm install && npm run build" \
    --publish-dir "./studio/dist" \
    --plan starter

echo "✅ Déploiement terminé !"
echo ""
echo "📋 Services créés :"
echo "   - flo-ai-api : API Python (Backend)"
echo "   - flo-ai-studio : Studio React (Frontend)"
echo "   - flo-ai-db : Base de données PostgreSQL"
echo ""
echo "🔧 N'oubliez pas de :"
echo "   1. Configurer vos clés API dans les variables d'environnement"
echo "   2. Mettre à jour l'URL de l'API dans le studio"
echo "   3. Tester les endpoints de l'API"
