"""
Skillify AI Chatbot - Flask Server Entry Point
==============================================
Runs the AI conversational assistant service on port 5001.
Handles real-time chat, NLP intent classification, humor banter,
learning corrections, and acts as an orchestrator for quiz and CV generation.
"""

from chatbot import create_app

# Initialize Flask application instance with CORS and all registered route blueprints
app = create_app()

if __name__ == '__main__':
    # Start the local development server on port 5001
    print("Starting Skillify AI Chatbot microservice on http://0.0.0.0:5001 ...")
    app.run(debug=True, host='0.0.0.0', port=5001)
