#!/usr/bin/env python3
"""Test script to check if all imports work"""

try:
    from aurora_ai.builder.agent_builder import AgentBuilder
    print("✓ AgentBuilder import successful")

    from aurora_ai.llm import OpenAI, Anthropic, Gemini
    print("✓ LLM imports successful")

    from aurora_ai.arium import auroraBuilder
    print("✓ Arium imports successful")

    from aurora_ai.models.agent import Agent
    print("✓ Agent model import successful")

    from aurora_ai.arium.memory import MessageMemory
    print("✓ MessageMemory import successful")

    print("\n🎉 All imports successful! The API should work now.")

except ImportError as e:
    print(f"❌ Import error: {e}")
    import traceback
    traceback.print_exc()
except Exception as e:
    print(f"❌ Other error: {e}")
    import traceback
    traceback.print_exc()
