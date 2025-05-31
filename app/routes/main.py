from flask import Blueprint, render_template, request, session, jsonify
from app.auth.routes import login_required
import requests
import os

main_bp = Blueprint('main', __name__)

# Home Route
@main_bp.route('/')
@login_required
def home():
    user = session.get('user', 'Guest')
    return render_template('home.html', user=user)

# Python Terminal Route
@main_bp.route('/python')
@login_required
def python_terminal():
    user = session.get('user', 'Guest')
    return render_template('python_terminal.html', user=user)

# R Terminal Route
@main_bp.route('/r')
@login_required
def r_terminal():
    user = session.get('user', 'Guest')
    return render_template('r_terminal.html', user=user)

# AI Chat Route (OpenAI Integration)
@main_bp.route('/ask', methods=['POST'])
@login_required
def ask_ai():
    user_input = request.json.get('prompt')
    provider = request.json.get('provider', 'openai')  # Default to OpenAI if not specified

    if provider == 'openai':
        headers = {
            "Authorization": f"Bearer {os.environ.get('OPENAI_API_KEY')}",
            "Content-Type": "application/json"
        }
        url = "https://api.openai.com/v1/chat/completions"
        model = "gpt-4o"
    elif provider == 'groq':
        headers = {
            "Authorization": f"Bearer {os.environ.get('GROQ_API_KEY')}",
            "Content-Type": "application/json"
        }
        url = "https://api.groq.com/openai/v1/chat/completions"
        model = "llama3-8b-8192"
    else:
        return jsonify({"response": "❌ Invalid provider selected."})

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a helpful AI assistant."},
            {"role": "user", "content": user_input}
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        reply = data['choices'][0]['message']['content']
        return jsonify({"response": reply})
    except Exception as e:
        return jsonify({"response": f"❌ Error: {str(e)}"})
