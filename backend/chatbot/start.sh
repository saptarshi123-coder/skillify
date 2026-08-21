#!/bin/bash
cd "$(dirname "$0")"
echo "Starting SKILLIFY Chatbot API on http://localhost:5001"
echo "Press Ctrl+C to stop"
echo ""
python3 chatbot.py
