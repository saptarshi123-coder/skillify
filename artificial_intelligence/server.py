"""
Skillify AI - Artificial Intelligence Server Runner
===================================================
Provides a runner for the AI FastAPI & CV Generator services.

Usage:
    # Run the CV generator & AI FastAPI server
    python artificial_intelligence/server.py
"""

import sys
import os

# Add cv_generator and quiz_engine to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
cv_gen_dir = os.path.join(current_dir, "cv_generator")
quiz_engine_dir = os.path.join(current_dir, "quiz_engine")

# cv_generator must be placed FIRST in sys.path so its internal modules resolve properly
if quiz_engine_dir not in sys.path:
    sys.path.append(quiz_engine_dir)
if cv_gen_dir not in sys.path:
    sys.path.insert(0, cv_gen_dir)

try:
    import server as cv_server
    app = cv_server.create_app()
except Exception as e1:
    try:
        from cv_generator.server import create_app
        app = create_app()
    except Exception as e2:
        print(f"Notice: CV Generator server import fallback: {e1} / {e2}")
        from fastapi import FastAPI
        app = FastAPI(title="Skillify AI Backend")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Starting Skillify AI Backend server on http://{host}:{port} ...")
    uvicorn.run(app, host=host, port=port)
