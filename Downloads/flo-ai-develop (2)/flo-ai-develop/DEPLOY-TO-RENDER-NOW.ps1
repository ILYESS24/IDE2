# 🚀 SCRIPT DE DÉPLOIEMENT COMPLET AURORA AI
# Ce script fait TOUT automatiquement

Write-Host "🚀 DÉPLOIEMENT COMPLET AURORA AI SUR RENDER" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Vérifier Render CLI
if (!(Get-Command render -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Render CLI n'est pas installé !" -ForegroundColor Red
    Write-Host "   Installez-le : npm install -g render-cli" -ForegroundColor Yellow
    exit 1
}

# Demander la clé OpenRouter (recommandé)
$openrouter_key = Read-Host "🔑 Entrez votre clé OpenRouter API (sk-or-v1-...)"

if (-not $openrouter_key -or -not $openrouter_key.StartsWith("sk-or-v1-")) {
    Write-Host "❌ Clé OpenRouter invalide !" -ForegroundColor Red
    Write-Host "   Obtenez-la sur : https://openrouter.ai/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Clé OpenRouter configurée" -ForegroundColor Green

# 1. Connexion Render
Write-Host ""
Write-Host "🔐 Connexion à Render..." -ForegroundColor Yellow
render login
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Échec connexion Render" -ForegroundColor Red
    exit 1
}

# 2. Base de données
Write-Host ""
Write-Host "🗄️ Création base de données..." -ForegroundColor Yellow
render postgres create aurora-ai-db --plan free --region oregon --version 16
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Échec création DB" -ForegroundColor Red
    exit 1
}

# 3. API Python (avec Docker)
Write-Host ""
Write-Host "🐳 Déploiement API Python (Docker)..." -ForegroundColor Yellow
$api_cmd = @"
render web create flo-ai-api --repo https://github.com/ILYESS24/IDE2 --env-vars "OPENROUTER_API_KEY=$openrouter_key,OPENROUTER_BASE_URL=https://openrouter.ai/api/v1,OPENROUTER_MODEL=openai/gpt-4o-mini" --plan starter
"@
Invoke-Expression $api_cmd
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Échec déploiement API" -ForegroundColor Red
    exit 1
}

# 4. Studio React
Write-Host ""
Write-Host "🎨 Déploiement Studio React..." -ForegroundColor Yellow
$studio_cmd = @"
render static create flo-ai-studio --repo https://github.com/ILYESS24/IDE2 --build-command "cd studio && npm install && npm run build" --publish-dir "./studio/dist" --env-vars "API_URL=https://flo-ai-api.onrender.com,VITE_API_URL=https://flo-ai-api.onrender.com"
"@
Invoke-Expression $studio_cmd
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Échec déploiement Studio" -ForegroundColor Red
    exit 1
}

# SUCCÈS !
Write-Host ""
Write-Host "🎉 DÉPLOIEMENT RÉUSSI !" -ForegroundColor Green
Write-Host "=" * 40 -ForegroundColor Green
Write-Host ""
Write-Host "🔗 APPLICATIONS DISPONIBLES :" -ForegroundColor Cyan
Write-Host ""
Write-Host "   🌐 STUDIO VISUEL :" -ForegroundColor White
Write-Host "      https://flo-ai-studio.onrender.com" -ForegroundColor Green
Write-Host ""
Write-Host "   🤖 API BACKEND :" -ForegroundColor White
Write-Host "      https://flo-ai-api.onrender.com" -ForegroundColor Green
Write-Host ""
Write-Host "   💚 HEALTH CHECK :" -ForegroundColor White
Write-Host "      https://flo-ai-api.onrender.com/health" -ForegroundColor Green
Write-Host ""
Write-Host "⏱️ TEMPS D'ATTENTE :" -ForegroundColor Yellow
Write-Host "   Les services mettent 5-10 minutes à se déployer" -ForegroundColor White
Write-Host ""
Write-Host "🧪 POUR TESTER :" -ForegroundColor Magenta
Write-Host "   Ouvrez : https://flo-ai-api.onrender.com/health" -ForegroundColor White
Write-Host ""
Write-Host "💰 COÛT MENSUEL :" -ForegroundColor Yellow
Write-Host "   API Python : $7/mois" -ForegroundColor White
Write-Host "   Studio React : $0/mois (gratuit)" -ForegroundColor Green
Write-Host "   Base de données : $0/mois (gratuit)" -ForegroundColor Green
Write-Host "   TOTAL : $7/mois" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 FONCTIONNALITÉS :" -ForegroundColor Magenta
Write-Host "   ✅ Agents IA multi-modèles" -ForegroundColor Green
Write-Host "   ✅ Interface drag-and-drop" -ForegroundColor Green
Write-Host "   ✅ Workflows complexes" -ForegroundColor Green
Write-Host "   ✅ API REST complète" -ForegroundColor Green
Write-Host "   ✅ Base de données PostgreSQL" -ForegroundColor Green
Write-Host "   ✅ Monitoring et logs" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 VOTRE FLO AI EST PRÊT !" -ForegroundColor Magenta
Write-Host ""
Write-Host "📞 Support : Vérifiez les logs avec 'render logs flo-ai-api'" -ForegroundColor Yellow
