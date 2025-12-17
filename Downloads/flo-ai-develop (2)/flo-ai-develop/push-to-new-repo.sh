#!/bin/bash
# Script pour pousser Flo AI vers un nouveau repository GitHub

echo "🚀 Push Flo AI vers un nouveau repository GitHub"
echo "================================================"

# Demander le nom du nouveau repository
read -p "Entrez le nom du nouveau repository : " repo_name
read -p "Entrez votre nom d'utilisateur GitHub : " github_user

# URL du nouveau repository
repo_url="https://github.com/${github_user}/${repo_name}.git"

echo ""
echo "📝 Informations du nouveau repository :"
echo "   Repository : $repo_name"
echo "   URL : $repo_url"
echo ""

# Vérifier si on veut continuer
read -p "Continuer ? (y/N) : " confirm
if [[ $confirm != "y" && $confirm != "Y" ]]; then
    echo "❌ Opération annulée"
    exit 1
fi

echo ""
echo "🔄 Création du nouveau repository..."

# Créer un dossier temporaire pour le nouveau repo
temp_dir="../flo-ai-new"
if [ -d "$temp_dir" ]; then
    echo "🗑️  Suppression du dossier temporaire existant..."
    rm -rf "$temp_dir"
fi

echo "📁 Création du dossier temporaire..."
mkdir -p "$temp_dir"
cd "$temp_dir"

# Initialiser le nouveau repository
echo "📦 Initialisation du nouveau repository..."
git init
git config user.name "$github_user"
git config user.email "${github_user}@users.noreply.github.com"

# Copier tous les fichiers du projet original
echo "📋 Copie des fichiers..."
cp -r ../flo-ai-develop/flo-ai/* ./

# Créer .gitignore si nécessaire
if [ ! -f ".gitignore" ]; then
    echo "# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db" > .gitignore
fi

# Ajouter tous les fichiers
echo "➕ Ajout des fichiers..."
git add .

# Créer le commit initial
echo "📝 Création du commit initial..."
git commit -m "🎉 Initial commit - Flo AI Complete Framework

🚀 Flo AI is a Python framework that makes building production-ready AI agents as easy as writing YAML.

✨ Key Features:
- 🔌 Truly Composable: Build complex AI systems by combining components
- 🏗️ Production-Ready: Built-in best practices and optimizations
- 📝 YAML-First: Define entire agent architecture in simple YAML
- 🧠 LLM-Powered Routing: Intelligent routing decisions by LLMs
- 🤝 Team-Oriented: Create and manage teams of AI agents
- 📊 OpenTelemetry Integration: Built-in observability

🎨 Flo AI Studio - Visual Workflow Designer:
- Drag-and-drop interface for creating agent workflows
- Export workflows as production-ready YAML configurations

📦 Includes:
- Python framework with multi-LLM support
- React/TypeScript visual studio
- Complete deployment configuration for Render
- REST API for agent interactions
- Multi-agent workflow orchestration
- Docker and production deployment scripts"

# Ajouter le remote
echo "🔗 Ajout du remote origin..."
git branch -M main
git remote add origin "$repo_url"

# Pousser vers GitHub
echo "🚀 Push vers GitHub..."
if git push -u origin main; then
    echo ""
    echo "✅ SUCCÈS ! Repository poussé vers GitHub"
    echo ""
    echo "🔗 URLs du nouveau repository :"
    echo "   Homepage : https://github.com/${github_user}/${repo_name}"
    echo "   Clone : git clone $repo_url"
    echo ""
    echo "📋 Prochaines étapes :"
    echo "   1. Allez sur https://github.com/${github_user}/${repo_name}"
    echo "   2. Configurez la description et les topics"
    echo "   3. Activez les GitHub Pages si souhaité"
    echo "   4. Déployez sur Render en suivant DEPLOYMENT.md"
    echo ""
    echo "🎉 Votre nouveau repository Flo AI est prêt !"
else
    echo ""
    echo "❌ ÉCHEC du push. Vérifiez :"
    echo "   - Le repository existe sur GitHub"
    echo "   - Vous avez les droits d'écriture"
    echo "   - L'URL du repository est correcte"
    echo ""
    echo "💡 Commandes pour corriger manuellement :"
    echo "   cd $temp_dir"
    echo "   git remote set-url origin $repo_url"
    echo "   git push -u origin main"
fi

# Retourner au répertoire original
cd - > /dev/null
