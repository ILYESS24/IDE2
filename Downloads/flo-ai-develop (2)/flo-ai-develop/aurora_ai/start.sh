#!/bin/bash
# Start script for Render deployment

# Install dependencies
pip install -r requirements.txt

# Set default port if not provided
export PORT=${PORT:-8000}

# Start the FastAPI application
python api.py
