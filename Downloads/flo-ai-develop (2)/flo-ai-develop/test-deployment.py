#!/usr/bin/env python3
"""
Script de test pour vérifier le déploiement de Flo AI sur Render
"""
import requests
import json
import sys
from typing import Dict, Any

def test_api_health(base_url: str) -> bool:
    """Test du health check de l'API"""
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✅ API Health Check: OK")
            print(f"   Status: {data.get('status')}")
            print(f"   Version: {data.get('version')}")
            providers = data.get('providers', {})
            print(f"   OpenAI: {'✅' if providers.get('openai') else '❌'}")
            print(f"   Anthropic: {'✅' if providers.get('anthropic') else '❌'}")
            print(f"   Gemini: {'✅' if providers.get('gemini') else '❌'}")
            return True
        else:
            print(f"❌ API Health Check: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API Health Check: Erreur - {e}")
        return False

def test_agent_chat(base_url: str) -> bool:
    """Test du chat avec un agent"""
    try:
        payload = {
            "prompt": "Bonjour, peux-tu te présenter en une phrase ?",
            "model": "gpt-4o-mini",
            "provider": "openai",
            "temperature": 0.7
        }

        response = requests.post(
            f"{base_url}/agent/chat",
            json=payload,
            timeout=30
        )

        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success':
                print("✅ Agent Chat: OK")
                print(f"   Response: {data.get('response', '')[:100]}...")
                return True
            else:
                print(f"❌ Agent Chat: API Error - {data.get('error', 'Unknown')}")
                return False
        else:
            print(f"❌ Agent Chat: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Agent Chat: Erreur - {e}")
        return False

def test_simple_workflow(base_url: str) -> bool:
    """Test d'un workflow simple"""
    try:
        payload = {
            "task": "Créer un plan pour développer une application web simple",
        }

        response = requests.post(
            f"{base_url}/workflow/simple",
            json=payload,
            timeout=60
        )

        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success':
                print("✅ Simple Workflow: OK")
                print(f"   Steps: {data.get('workflow_steps', 0)}")
                return True
            else:
                print(f"❌ Simple Workflow: API Error - {data.get('error', 'Unknown')}")
                return False
        else:
            print(f"❌ Simple Workflow: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Simple Workflow: Erreur - {e}")
        return False

def main():
    """Fonction principale de test"""
    print("🧪 Test du déploiement Flo AI sur Render")
    print("=" * 50)

    # Demander l'URL de base
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = input("Entrez l'URL de votre API Render (ex: https://flo-ai-api.onrender.com): ").strip()

    if not base_url.startswith(('http://', 'https://')):
        base_url = f"https://{base_url}"

    print(f"\n🔗 Test de l'API: {base_url}")
    print("-" * 30)

    # Tests
    tests = [
        ("Health Check", test_api_health),
        ("Agent Chat", test_agent_chat),
        ("Simple Workflow", test_simple_workflow),
    ]

    results = []
    for test_name, test_func in tests:
        print(f"\n🧪 Test: {test_name}")
        success = test_func(base_url)
        results.append((test_name, success))

    # Résumé
    print("\n" + "=" * 50)
    print("📊 RÉSULTATS DES TESTS")
    print("=" * 50)

    all_passed = True
    for test_name, success in results:
        status = "✅ PASSÉ" if success else "❌ ÉCHOUÉ"
        print(f"{test_name}: {status}")
        if not success:
            all_passed = False

    print("\n" + "=" * 50)
    if all_passed:
        print("🎉 TOUS LES TESTS SONT PASSÉS !")
        print("Votre déploiement Flo AI est opérationnel.")
    else:
        print("⚠️  CERTAINS TESTS ONT ÉCHOUÉ")
        print("Vérifiez vos variables d'environnement et la configuration.")

    print("\n💡 Prochaines étapes:")
    print("1. Testez le Studio: https://flo-ai-studio.onrender.com")
    print("2. Configurez vos clés API dans les variables d'environnement")
    print("3. Personnalisez les workflows selon vos besoins")

if __name__ == "__main__":
    main()
