#!/usr/bin/env python3
"""Test script to check API startup issues"""

import os
import sys

print("🧪 Testing API startup...")

try:
    # Test basic imports
    print("📦 Testing imports...")
    from fastapi import FastAPI
    from pydantic import BaseModel
    print("✅ FastAPI imports OK")

    # Test cache import
    from cache import cached_ai_response, ai_cache
    print("✅ Cache imports OK")

    # Test Aurora imports step by step
    print("  Testing Aurora imports...")
    from aurora_ai.models.agent import Agent
    print("  ✅ Agent model OK")

    from aurora_ai.llm import OpenAI, Anthropic, Gemini
    print("  ✅ LLM modules OK")

    from aurora_ai.arium import auroraBuilder
    print("  ✅ Arium builder OK")

    from aurora_ai.arium.memory import MessageMemory
    print("  ✅ MessageMemory OK")

    print("✅ All Aurora imports OK")

    # Test rate limiting
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    limiter = Limiter(key_func=get_remote_address)
    print("✅ Rate limiting OK")

    # Test basic FastAPI app creation
    app = FastAPI(title="Test API")
    print("✅ FastAPI app creation OK")

    # Test middleware setup
    from fastapi.middleware.cors import CORSMiddleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    print("✅ CORS middleware OK")

    # Test limiter state setup
    app.state.limiter = limiter
    print("✅ Limiter state setup OK")

    # Test route addition
    @app.get("/test")
    async def test_endpoint():
        return {"status": "ok"}

    print("✅ Route addition OK")

    print("\n🎉 All startup components working!")
    print("🚀 API should be able to start now")

except Exception as e:
    print(f"❌ Startup test failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
