from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')
    CORS(app)

    from app.auth.routes import auth_bp
    from app.routes.main import main_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)

    return app
