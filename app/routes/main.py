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
    chat_history = request.json.get('history', [])
    provider = request.json.get('provider', 'openai')  # Default to OpenAI if not specified
    system_prompt = """ 
You are a helpful and expert AI coding assistant.

Your tasks:
- keep that in mind and avoid providing code examples unless explicitly requested or necessary for clarification.
- Make sure to provide code examples in code boxes
- Explain code clearly step-by-step.
- Detect and explain any errors, bugs, or improvements.
- Always output clean and fully functional code examples.
- ALWAYS format code using this HTML structure for frontend parsing:

For Python:
<pre><code class='language-python'>
# your code here
</code></pre>

For R:
<pre><code class='language-r'>
# your code here
</code></pre>

Formatting rules:
- NEVER use Markdown code blocks (no triple backticks).
- Use real \n newlines inside <pre><code> blocks.
- NEVER insert <br> tags inside code blocks.
- Preserve correct indentation and spacing.
- NEVER escape < and > symbols inside code blocks.
- After code, always provide a clear natural-language explanation.
- Always start your explanation on a new paragraph after the code block.

Your job is to behave like a professional AI coding tutor, always explaining thoroughly.
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
            *chat_history
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
