# Script PowerShell pour pousser Flo AI vers le repository flocursor.git

Write-Host "🚀 Push Flo AI vers https://github.com/ILYESS24/flocursor.git" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

$repo_url = "https://github.com/ILYESS24/flocursor.git"

Write-Host ""
Write-Host "📝 Informations du repository cible :" -ForegroundColor Yellow
Write-Host "   Repository : flocursor"
Write-Host "   URL : $repo_url"
Write-Host ""

# Vérifier si on veut continuer
$confirm = Read-Host "Continuer et pousser vers ce repository ? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Opération annulée" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Préparation du push..." -ForegroundColor Green

# Créer un dossier temporaire pour le nouveau repo
$temp_dir = "../flo-ai-flocursor"
if (Test-Path $temp_dir) {
    Write-Host "🗑️  Suppression du dossier temporaire existant..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $temp_dir
}

Write-Host "📁 Création du dossier temporaire..." -ForegroundColor Green
New-Item -ItemType Directory -Path $temp_dir -Force | Out-Null
Set-Location $temp_dir

# Initialiser le nouveau repository
Write-Host "📦 Initialisation du nouveau repository..." -ForegroundColor Green
git init
git config user.name "ILYESS24"
git config user.email "ILYESS24@users.noreply.github.com"

# Copier tous les fichiers du projet original
Write-Host "📋 Copie des fichiers..." -ForegroundColor Green
Copy-Item -Recurse -Path "../flo-ai-develop/flo-ai/*" -Destination "." -Force

# Créer .gitignore si nécessaire
if (!(Test-Path ".gitignore")) {
    Write-Host "📝 Création du .gitignore..." -ForegroundColor Green
    @"
# Python
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
Thumbs.db

# Render deployment
.render/
"@ | Out-File -FilePath .gitignore -Encoding UTF8
}

# Ajouter tous les fichiers
Write-Host "➕ Ajout des fichiers..." -ForegroundColor Green
git add .

# Créer le commit initial
Write-Host "📝 Création du commit initial..." -ForegroundColor Green
git commit -m @"
🎉 Initial commit - Flo AI Complete Framework

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
- Python framework with multi-LLM support (OpenAI, Anthropic, Google)
- React/TypeScript visual studio with drag-and-drop designer
- Complete deployment configuration for Render
- REST API for agent interactions and workflows
- Multi-agent workflow orchestration (Arium)
- Tool system with @flo_tool decorator
- Docker and production deployment scripts
- OpenTelemetry monitoring and tracing

🚀 Deployment Ready:
- Render (Web Service + Static Site + PostgreSQL)
- Railway, Fly.io, or any cloud platform
- Docker containers for local development
- Production-grade API with health checks

📋 Quick Start:
1. Deploy to Render following DEPLOYMENT.md
2. Access the visual studio at your Render URL
3. Start building AI agents and workflows!

🔧 Tech Stack:
- Backend: Python, FastAPI, OpenTelemetry
- Frontend: React, TypeScript, Tailwind CSS
- Database: PostgreSQL
- Deployment: Render, Docker
- AI: Multi-LLM support (GPT, Claude, Gemini)

🤝 Contributing:
- Follow DEPLOYMENT.md for production deployment
- Use PUSH_TO_NEW_REPO.md to fork and deploy
- Check examples/ for usage patterns
"@

# Ajouter le remote
Write-Host "🔗 Ajout du remote origin..." -ForegroundColor Green
git branch -M main
git remote add origin $repo_url

# Pousser vers GitHub
Write-Host "🚀 Push vers GitHub..." -ForegroundColor Green
try {
    git push -u origin main
    Write-Host ""
    Write-Host "✅ SUCCÈS ! Repository poussé vers flocursor.git" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 URLs du repository :" -ForegroundColor Cyan
    Write-Host "   Homepage : https://github.com/ILYESS24/flocursor"
    Write-Host "   Clone : git clone $repo_url"
    Write-Host ""
    Write-Host "📋 Prochaines étapes :" -ForegroundColor Yellow
    Write-Host "   1. Allez sur https://github.com/ILYESS24/flocursor"
    Write-Host "   2. Vérifiez que tous les fichiers sont présents"
    Write-Host "   3. Configurez la description et les topics du repo"
    Write-Host "   4. Déployez sur Render en suivant DEPLOYMENT.md"
    Write-Host "   5. Partagez votre repository avec la communauté !"
    Write-Host ""
    Write-Host "🎉 Flo AI est maintenant dans votre repository flocursor !" -ForegroundColor Magenta
}
catch {
    Write-Host ""
    Write-Host "❌ ÉCHEC du push. Détails de l'erreur :" -ForegroundColor Red
    Write-Host $Error[0].Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Solutions possibles :" -ForegroundColor Yellow
    Write-Host "   1. Vérifiez que le repository https://github.com/ILYESS24/flocursor existe"
    Write-Host "   2. Vérifiez que vous avez les droits d'écriture sur ce repository"
    Write-Host "   3. Vérifiez votre connexion internet"
    Write-Host "   4. Essayez de vous authentifier avec un Personal Access Token"
    Write-Host ""
    Write-Host "🔧 Commandes pour corriger manuellement :" -ForegroundColor Cyan
    Write-Host "   cd $temp_dir"
    Write-Host "   git log --oneline  # Vérifier le commit"
    Write-Host "   git remote -v       # Vérifier le remote"
    Write-Host "   git push -u origin main  # Réessayer le push"
}

# Retourner au répertoire original
Set-Location -Path "../flo-ai-develop/flo-ai"
