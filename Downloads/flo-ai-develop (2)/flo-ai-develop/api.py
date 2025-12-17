"""
Aurora AI API - FastAPI application for Render deployment
"""
print("🚀 Starting Aurora AI API...")
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import asyncio
from typing import Optional, Dict, Any
import json

print("📦 Loading Aurora AI imports...")
# Aurora AI imports
from aurora_ai.builder.agent_builder import AgentBuilder
print("✓ AgentBuilder imported")
from aurora_ai.llm import OpenAI, Anthropic, Gemini
print("✓ LLM modules imported")
from aurora_ai.arium import auroraBuilder
print("✓ Arium imported")
from aurora_ai.models.agent import Agent
print("✓ Agent model imported")
from aurora_ai.arium.memory import MessageMemory
print("✓ MessageMemory imported")

print("🔧 Creating FastAPI app...")
app = FastAPI(
    title="Aurora AI API",
    description="Aurora AI Agent Framework API",
    version="1.0.0"
)
print("✓ FastAPI app created")

# CORS middleware
print("🔒 Setting up CORS middleware...")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print("✓ CORS configured")

# Request/Response models
print("📝 Defining request/response models...")
class AgentRequest(BaseModel):
    prompt: str
    model: str = "gpt-4o-mini"
    provider: str = "openai"
    temperature: float = 0.7

class WorkflowRequest(BaseModel):
    yaml_config: str
    inputs: list[str]

class SimpleWorkflowRequest(BaseModel):
    task: str
    agents_config: Optional[Dict[str, Any]] = None

class StudioAIWorkflowRequest(BaseModel):
    prompt: str
print("✓ Models defined")

@app.get("/")
async def root():
    """Health check endpoint"""
    print("📡 Root endpoint called")
    return {"message": "Flo AI API is running!", "status": "healthy"}

@app.get("/health")
async def health():
    """Detailed health check"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "providers": {
            "openrouter": bool(os.getenv("OPENROUTER_API_KEY")),
            "openai": bool(os.getenv("OPENAI_API_KEY")),
            "deepseek": bool(os.getenv("DEEPSEEK_API_KEY")),
            "anthropic": bool(os.getenv("ANTHROPIC_API_KEY")),
            "gemini": bool(os.getenv("GOOGLE_API_KEY")),
        }
    }

@app.post("/agent/chat")
async def chat_with_agent(request: AgentRequest):
    """Simple agent chat endpoint"""
    try:
        # Create LLM based on provider
        llm = None
        if request.provider == "openai":
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise HTTPException(status_code=400, detail="OpenAI API key not configured")
            llm = OpenAI(model=request.model, temperature=request.temperature, api_key=api_key)
        elif request.provider == "anthropic":
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if not api_key:
                raise HTTPException(status_code=400, detail="Anthropic API key not configured")
            llm = Anthropic(model=request.model, temperature=request.temperature, api_key=api_key)
        elif request.provider == "gemini":
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise HTTPException(status_code=400, detail="Google API key not configured")
            llm = Gemini(model=request.model, temperature=request.temperature, api_key=api_key)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported provider: {request.provider}")

        # Create agent
        agent = (
            AgentBuilder()
            .with_name("API Agent")
            .with_prompt("You are a helpful AI assistant.")
            .with_llm(llm)
            .build()
        )

        # Run agent
        response = await agent.run(request.prompt)
        return {"response": response, "status": "success"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/studio/ai-workflow")
async def generate_studio_workflow(request: StudioAIWorkflowRequest):
    """
    Generate an Aurora YAML workflow from a natural language description.

    This uses the configured LLM (OpenAI-compatible, e.g. OpenAI or DeepSeek)
    with the API key provided in environment variables.
    """
    try:
        # Check for API keys in order of preference: OpenRouter -> DeepSeek -> OpenAI
        openrouter_key = os.getenv("OPENROUTER_API_KEY")
        deepseek_key = os.getenv("DEEPSEEK_API_KEY")
        openai_key = os.getenv("OPENAI_API_KEY")

        if openrouter_key:
            # OpenRouter - accès à tous les modèles via une seule API
            llm = OpenAI(
                model=os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini"),
                api_key=openrouter_key,
                temperature=0.2,
                base_url=os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
            )
        elif deepseek_key:
            # DeepSeek is OpenAI-compatible but uses its own base URL and model name
            llm = OpenAI(
                model=os.getenv("DEEPSEEK_MODEL", "deepseek-chat"),
                api_key=deepseek_key,
                temperature=0.2,
                base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
            )
        elif openai_key:
            llm = OpenAI(model="gpt-4o-mini", api_key=openai_key, temperature=0.2)
        else:
            raise HTTPException(
                status_code=400,
                detail="No LLM API key configured. Set OPENROUTER_API_KEY, DEEPSEEK_API_KEY, or OPENAI_API_KEY",
            )

        system_prompt = """
You are an expert AI workflow architect for Aurora AI Studio.
Given a natural language description of an automation or multi‑agent workflow,
you MUST respond with a VALID YAML document in the following schema, and nothing else:

metadata:
  name: "short-workflow-name"
  version: "1.0.0"
  description: "One sentence description of the workflow"

arium:
  agents:
    - id: "agent_id_1"
      name: "Human friendly name"
      job: "Clear description of what this agent does"
      model:
        provider: "openai"
        name: "gpt-4o-mini"

  workflow:
    start: "agent_id_1"
    edges:
      - from: "agent_id_1"
        to: ["agent_id_2"]
      - from: "agent_id_2"
        to: ["agent_id_3"]
    end: ["agent_id_3"]

Rules:
- Use only fields shown in the schema above.
- Use simple lowercase ids without spaces.
- Make sure every `from` and `to` id exists in `agents`.
- Do NOT wrap the YAML in markdown fences. Return ONLY raw YAML.
"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": request.prompt},
        ]

        yaml_workflow = await llm.generate(messages)  # type: ignore[arg-type]

        # Ensure it's a plain string
        if isinstance(yaml_workflow, dict):
            yaml_text = json.dumps(yaml_workflow)
        else:
            yaml_text = str(yaml_workflow)

        return {"status": "success", "yaml": yaml_text}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/workflow/simple")
async def run_simple_workflow(request: SimpleWorkflowRequest):
    """Run a simple multi-agent workflow"""
    try:
        # Check API key
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=400, detail="OpenAI API key not configured")

        llm = OpenAI(model="gpt-4o-mini", api_key=api_key)

        # Default agents configuration
        default_config = {
            "planner": {
                "prompt": "You are a project planner. Create detailed plans with numbered steps.",
                "role": "planner"
            },
            "developer": {
                "prompt": "You are a software developer. Implement solutions based on plans.",
                "role": "developer"
            },
            "reviewer": {
                "prompt": "You are a code reviewer. Review and provide feedback on implementations.",
                "role": "reviewer"
            }
        }

        agents_config = request.agents_config or default_config

        # Create agents
        agents = []
        for name, config in agents_config.items():
            agent = Agent(
                name=name,
                system_prompt=config["prompt"],
                llm=llm
            )
            agents.append(agent)

        # Simple routing logic
        def simple_router(memory):
            messages = memory.get()
            if len(messages) < 2:
                return "developer"
            elif len(messages) < 4:
                return "reviewer"
            else:
                return "reviewer"  # End with reviewer

        # Build workflow
        workflow = (
            auroraBuilder()
            .add_agents(agents)
            .start_with(agents[0])  # Start with planner
            .add_edge(agents[0], agents[1:], simple_router)
            .end_with(agents[-1])  # End with reviewer
            .build()
        )

        # Run workflow
        result = await workflow.run([request.task])

        return {
            "result": result,
            "status": "success",
            "workflow_steps": len(agents)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/workflow/yaml")
async def run_yaml_workflow(request: WorkflowRequest):
    """Run workflow from YAML configuration"""
    try:
        # Create workflow from YAML
        workflow = auroraBuilder.from_yaml(yaml_str=request.yaml_config)

        # Run workflow
        result = await workflow.build_and_run(request.inputs)

        return {"result": result, "status": "success"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("🌐 Starting uvicorn server...")
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"🚀 Server will run on http://0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
