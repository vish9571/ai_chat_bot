import json
import bcrypt
import re
from functools import wraps
from flask import Blueprint, render_template, request, redirect, url_for, session, flash

auth_bp = Blueprint('auth', __name__)

# Helpers to load/save users (JSON flat file for now)

def load_users():
    try:
        with open('users.json', 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        return {}

def save_user(username, hashed_password):
    users = load_users()
    users[username] = hashed_password.decode('utf-8')
    with open('users.json', 'w') as file:
        json.dump(users, file, indent=4)

def is_strong_password(password: str) -> bool:
    return (
        len(password) >= 9 and
        re.search(r'[A-Z]', password) and
        re.search(r'\\d', password) and
        re.search(r'[^A-Za-z0-9]', password)
    )

# Login Required Decorator (used for protected routes later)
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function

# Registration route
@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        raw_password = request.form['password']
        confirm_password = request.form['confirm_password']
        users = load_users()

        if username in users:
            return render_template('register.html', error='Username already exists.')
        if raw_password != confirm_password:
            return render_template('register.html', error='Passwords do not match.')
        if not is_strong_password(raw_password):
            return render_template('register.html', error='Weak password.')

        hashed_password = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt())
        save_user(username, hashed_password)
        flash('Registration successful. Please log in.')
        return redirect(url_for('auth.login'))

    return render_template('register.html')

# Login route
@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        users = load_users()
        username = request.form['username']
        password = request.form['password'].encode('utf-8')

        if username in users:
            stored_hash = users[username].encode('utf-8')
            if bcrypt.checkpw(password, stored_hash):
                session['user'] = username
                return redirect(url_for('main.home'))

        return render_template('login.html', error='Invalid username or password')
    return render_template('login.html')

# Logout route
@auth_bp.route('/logout')
@login_required
def logout():
    session.clear()
    return redirect(url_for('auth.login'))
