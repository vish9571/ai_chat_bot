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
            {"role": "system", "content": system_prompt},
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

@main_bp.route('/explain', methods=['POST'])
@login_required
def explain_code():
    payload = request.json
    code = payload.get("code")
    output = payload.get("output")
    language = payload.get("language")
    provider = payload.get("provider", "openai")

    system_prompt = f"""
You are an expert coding assistant.
Your job is to deeply analyze the provided {language} code and its output.
Explain step-by-step:
- What the code is doing.
- What the output means.
- If there's any issue, bug or improvement possible, highlight it.
- Provide improved code suggestions when possible.
Always format code suggestions using:
<pre><code class='language-{language}'>...</code></pre>
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

    chat_payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Code:\n{code}\n\nOutput:\n{output}"}
        ]
    }

    try:
        response = requests.post(api_url, headers=headers, json=chat_payload)
        response.raise_for_status()
        data = response.json()
        reply = data['choices'][0]['message']['content']
        return jsonify({"response": reply})
    except Exception as e:
        return jsonify({"response": f"❌ Error: {str(e)}"})