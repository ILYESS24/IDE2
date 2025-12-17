# Script PowerShell pour déployer Flo AI sur Render

Write-Host "🚀 Déploiement automatique Flo AI sur Render" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# Vérifier si Render CLI est installé
if (!(Get-Command render -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Render CLI n'est pas installé." -ForegroundColor Red
    Write-Host "   Téléchargez-le depuis : https://docs.render.com/docs/cli" -ForegroundColor Yellow
    Write-Host "   Puis installez-le et reconnectez-vous." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Render CLI détecté" -ForegroundColor Green

# Demander les informations nécessaires
$repo_url = Read-Host "URL de votre repository GitHub (ex: https://github.com/ILYESS24/flocursor)"
$openai_key = Read-Host "Votre clé OpenAI API (laissez vide si vous la configurerez plus tard)"
$anthropic_key = Read-Host "Votre clé Anthropic API (optionnel)"
$google_key = Read-Host "Votre clé Google AI API (optionnel)"

Write-Host ""
Write-Host "🔧 Configuration du déploiement :" -ForegroundColor Yellow
Write-Host "   Repository : $repo_url"
Write-Host "   OpenAI Key : $(if ($openai_key) { '✅ Configuré' } else { '⚠️ À configurer plus tard' })"
Write-Host ""

$confirm = Read-Host "Continuer le déploiement ? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Déploiement annulé" -ForegroundColor Red
    exit 1
}

# Se connecter à Render
Write-Host ""
Write-Host "🔐 Connexion à Render..." -ForegroundColor Green
render login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Échec de la connexion à Render" -ForegroundColor Red
    exit 1
}

# Créer la base de données
Write-Host ""
Write-Host "🗄️ Création de la base de données PostgreSQL..." -ForegroundColor Green
render postgres create flo-ai-db --plan free --region oregon --version 16

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Échec de la création de la base de données" -ForegroundColor Red
    exit 1
}

# Préparer les variables d'environnement pour l'API
$env_vars = "PYTHON_VERSION=3.11"
if ($openai_key) { $env_vars += ",OPENAI_API_KEY=$openai_key" }
if ($anthropic_key) { $env_vars += ",ANTHROPIC_API_KEY=$anthropic_key" }
if ($google_key) { $env_vars += ",GOOGLE_API_KEY=$google_key" }

# Créer le service API
Write-Host ""
Write-Host "🐍 Création du service API Python..." -ForegroundColor Green
$api_command = @"
render web create flo-ai-api --repo $repo_url --runtime python3 --build-command "pip install -r flo_ai/requirements.txt" --start-command "cd flo_ai && python api.py" --env-vars "$env_vars" --plan starter
"@

Invoke-Expression $api_command

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Échec de la création du service API" -ForegroundColor Red
    exit 1
}

# Créer le site statique
Write-Host ""
Write-Host "🎨 Création du site statique Studio..." -ForegroundColor Green
$studio_command = @"
render static create flo-ai-studio --repo $repo_url --build-command "cd studio && npm install && npm run build" --publish-dir "./studio/dist" --plan free
"@

Invoke-Expression $studio_command

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Échec de la création du site statique" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ DÉPLOIEMENT RÉUSSI !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Services créés :" -ForegroundColor Cyan
Write-Host "   🗄️ flo-ai-db : Base de données PostgreSQL"
Write-Host "   🐍 flo-ai-api : API Python (Backend)"
Write-Host "   🎨 flo-ai-studio : Studio React (Frontend)"
Write-Host ""
Write-Host "⏱️ Temps d'attente : 5-10 minutes pour le premier déploiement" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔗 URLs (seront disponibles après déploiement) :" -ForegroundColor Cyan
Write-Host "   Studio : https://flo-ai-studio.onrender.com"
Write-Host "   API : https://flo-ai-api.onrender.com"
Write-Host "   Health Check : https://flo-ai-api.onrender.com/health"
Write-Host ""
Write-Host "⚠️ Actions requises :" -ForegroundColor Yellow
if (!$openai_key) {
    Write-Host "   1. Ajouter OPENAI_API_KEY dans les variables d'environnement de flo-ai-api"
}
Write-Host "   2. Attendre que les déploiements soient terminés"
Write-Host "   3. Tester l'API avec : curl https://flo-ai-api.onrender.com/health"
Write-Host "   4. Vérifier le Studio dans votre navigateur"
Write-Host ""
Write-Host "📚 Documentation complète : RENDER_DEPLOYMENT_COMPLETE.md" -ForegroundColor Magenta
Write-Host ""
Write-Host "🎉 Flo AI est maintenant déployé sur Render !" -ForegroundColor Magenta
