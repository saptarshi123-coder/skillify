#!/bin/bash
cd "$(dirname "$0")"

# If virtual environment is not present, create and build it
if [ ! -d "venv" ]; then
    echo "Virtual environment 'venv' not found. Creating and building..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "Error: Failed to create virtual environment. Ensure python3-venv is installed."
        exit 1
    fi
    echo "Installing required packages from requirements.txt..."
    ./venv/bin/pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install requirements."
        exit 1
    fi
    echo "Virtual environment build complete."
fi

source venv/bin/activate

echo "Starting SKILLIFY Chatbot API on http://localhost:5001"
echo "Press Ctrl+C to stop"
echo ""
python3 app.py
