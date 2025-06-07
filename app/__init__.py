import os
from flask import Flask
from flask_cors import CORS
from app.models import db

def create_app():
    base_dir = os.path.abspath(os.path.dirname(__file__))
    project_root = os.path.abspath(os.path.join(base_dir, '..'))

    app = Flask(
        __name__,
        template_folder=os.path.join(project_root, 'templates'),
        static_folder=os.path.join(project_root, 'static')
    )

    app.config.from_object('config.Config')
    CORS(app)

    db.init_app(app)   # ✅ Important: init SQLAlchemy here

    from app.auth.routes import auth_bp
    from app.routes.main import main_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)

    app.permanent_session_lifetime = app.config['SESSION_LIFETIME']

    return app
