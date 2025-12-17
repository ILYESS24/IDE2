#!/usr/bin/env python3
"""Simple API test to isolate the issue"""

import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("🚀 Starting Simple Aurora AI API Test...")

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from cache import cached_ai_response

logger.info("✅ Basic imports successful")

# Rate limiting
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Test API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info("✅ FastAPI setup successful")

# Models
class TestRequest(BaseModel):
    message: str

# Routes
@app.get("/health")
@limiter.limit("10/minute")
async def health(request: Request):
    logger.info("Health check called")
    return {"status": "healthy", "message": "Simple API working"}

@app.post("/test")
@limiter.limit("5/minute")
async def test_endpoint(request: Request, data: TestRequest):
    logger.info(f"Test endpoint called with: {data.message}")
    return {"response": f"Echo: {data.message}", "status": "success"}

logger.info("✅ Routes defined")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))  # Different port to avoid conflicts
    logger.info(f"🌐 Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
