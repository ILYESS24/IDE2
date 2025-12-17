# Script PowerShell pour pousser Flo AI vers un nouveau repository GitHub

Write-Host "🚀 Push Flo AI vers un nouveau repository GitHub" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# Demander le nom du nouveau repository
$repo_name = Read-Host "Entrez le nom du nouveau repository"
$github_user = Read-Host "Entrez votre nom d'utilisateur GitHub"

# URL du nouveau repository
$repo_url = "https://github.com/${github_user}/${repo_name}.git"

Write-Host ""
Write-Host "📝 Informations du nouveau repository :" -ForegroundColor Yellow
Write-Host "   Repository : $repo_name"
Write-Host "   URL : $repo_url"
Write-Host ""

# Vérifier si on veut continuer
$confirm = Read-Host "Continuer ? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Opération annulée" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Création du nouveau repository..." -ForegroundColor Green

# Créer un dossier temporaire pour le nouveau repo
$temp_dir = "../flo-ai-new"
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
git config user.name $github_user
git config user.email "${github_user}@users.noreply.github.com"

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
- Python framework with multi-LLM support
- React/TypeScript visual studio
- Complete deployment configuration for Render
- REST API for agent interactions
- Multi-agent workflow orchestration
- Docker and production deployment scripts

Deployment ready for:
- Render (Web Service + Static Site + PostgreSQL)
- Railway, Fly.io, or any cloud platform
- Docker containers
- Local development

🚀 Quick start:
1. Clone this repository
2. Follow DEPLOYMENT.md for production deployment
3. Start building AI agents and workflows!
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
    Write-Host "✅ SUCCÈS ! Repository poussé vers GitHub" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 URLs du nouveau repository :" -ForegroundColor Cyan
    Write-Host "   Homepage : https://github.com/${github_user}/${repo_name}"
    Write-Host "   Clone : git clone $repo_url"
    Write-Host ""
    Write-Host "📋 Prochaines étapes :" -ForegroundColor Yellow
    Write-Host "   1. Allez sur https://github.com/${github_user}/${repo_name}"
    Write-Host "   2. Configurez la description et les topics"
    Write-Host "   3. Activez les GitHub Pages si souhaité"
    Write-Host "   4. Déployez sur Render en suivant DEPLOYMENT.md"
    Write-Host ""
    Write-Host "🎉 Votre nouveau repository Flo AI est prêt !" -ForegroundColor Magenta
}
catch {
    Write-Host ""
    Write-Host "❌ ÉCHEC du push. Vérifiez :" -ForegroundColor Red
    Write-Host "   - Le repository existe sur GitHub"
    Write-Host "   - Vous avez les droits d'écriture"
    Write-Host "   - L'URL du repository est correcte"
    Write-Host ""
    Write-Host "💡 Commandes pour corriger manuellement :" -ForegroundColor Yellow
    Write-Host "   cd $temp_dir"
    Write-Host "   git remote set-url origin $repo_url"
    Write-Host "   git push -u origin main"
}

# Retourner au répertoire original
Set-Location -Path "../flo-ai-develop/flo-ai"
