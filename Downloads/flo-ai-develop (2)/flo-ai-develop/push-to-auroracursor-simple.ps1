# Script simple pour pousser Flo AI vers flocursor.git

Write-Host "🚀 Push Flo AI vers flocursor.git" -ForegroundColor Cyan
Write-Host "=" * 40 -ForegroundColor Cyan

$repo_url = "https://github.com/ILYESS24/flocursor.git"

Write-Host "Repository cible : $repo_url" -ForegroundColor Yellow
Write-Host ""

# Créer un dossier temporaire
$temp_dir = "../flo-ai-flocursor"
if (Test-Path $temp_dir) {
    Write-Host "🗑️ Suppression du dossier temporaire..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $temp_dir
}

Write-Host "📁 Création du dossier temporaire..." -ForegroundColor Green
New-Item -ItemType Directory -Path $temp_dir -Force | Out-Null
Set-Location $temp_dir

# Initialiser Git
Write-Host "📦 Initialisation Git..." -ForegroundColor Green
git init
git config user.name "ILYESS24"
git config user.email "ILYESS24@users.noreply.github.com"

# Copier les fichiers
Write-Host "📋 Copie des fichiers..." -ForegroundColor Green
Copy-Item -Recurse -Path "../flo-ai-develop/flo-ai/*" -Destination "." -Force

# Créer .gitignore
Write-Host "📝 Création du .gitignore..." -ForegroundColor Green
@"
__pycache__/
*.pyc
node_modules/
.env
.DS_Store
"@ | Out-File -FilePath .gitignore -Encoding UTF8

# Ajouter et commiter
Write-Host "➕ Ajout des fichiers..." -ForegroundColor Green
git add .
git commit -m "🎉 Initial commit - Flo AI Complete Framework

🚀 Python framework for building AI agents with YAML
🎨 Visual Studio with drag-and-drop workflow designer
📦 Complete deployment configuration for Render
🔧 Multi-LLM support (OpenAI, Anthropic, Google)"

# Configurer le remote et pousser
Write-Host "🔗 Configuration du remote..." -ForegroundColor Green
git branch -M main
git remote add origin $repo_url

Write-Host "🚀 Push vers GitHub..." -ForegroundColor Green
$result = git push -u origin main 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ SUCCÈS ! Repository poussé vers flocursor.git" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 Repository : https://github.com/ILYESS24/flocursor" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎉 Flo AI est maintenant dans votre repository !" -ForegroundColor Magenta
} else {
    Write-Host ""
    Write-Host "❌ ÉCHEC du push :" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Vérifiez que le repository existe et que vous avez les droits d'accès" -ForegroundColor Yellow
}

# Retour au répertoire original
Set-Location -Path "../flo-ai-develop/flo-ai"
