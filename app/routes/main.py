from flask import Blueprint, render_template, request, session, jsonify, current_app
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

# AI Chat Route (OpenAI & Groq Integration)
@main_bp.route('/ask', methods=['POST'])
@login_required
def ask_ai():
    user_input = request.json.get('prompt')
    provider = request.json.get('provider', 'openai')

    system_prompt = """
You are a helpful and knowledgeable assistant.
You can explain concepts, generate and explain code, answer general queries, and help with learning.

When coding-related questions are asked:
- ALWAYS wrap code inside full HTML blocks:
  For Python:
  <pre><code class='language-python'>[CODE]</code></pre>

  For R:
  <pre><code class='language-r'>[CODE]</code></pre>

- NEVER use Markdown triple backticks (```).
- Use \\n for newlines.
- Preserve indentation.
- Avoid escaping < > symbols inside code blocks.
- After code, always explain it in plain language.
"""

    if provider == 'groq':
        api_url = "https://api.groq.com/openai/v1/chat/completions"
        api_key = current_app.config['GROQ_API_KEY']
        model = "llama3-8b-8192"
    else:
        api_url = "https://api.openai.com/v1/chat/completions"
        api_key = current_app.config['OPENAI_API_KEY']
        model = "gpt-4o"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ]
    }

    try:
        response = requests.post(api_url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        reply = data['choices'][0]['message']['content']
        return jsonify({"response": reply})
    except Exception as e:
        return jsonify({"response": f"❌ Error: {str(e)}"})
