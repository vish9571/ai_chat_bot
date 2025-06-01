import os
from flask import Flask
from flask_cors import CORS

def create_app():
    # ✅ Calculate absolute path to the /app folder
    basedir = os.path.abspath(os.path.dirname(__file__))

    # ✅ Tell Flask where to find templates and static folders
    app = Flask(
        __name__,
        static_folder=os.path.join(basedir, 'static'),
        template_folder=os.path.join(basedir, 'templates')
    )

    # ✅ Load your config
    app.config.from_object('config.Config')

    # ✅ CORS enabled if needed
    CORS(app)

    # ✅ Import & register blueprints
    from app.auth.routes import auth_bp
    from app.routes.main import main_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)

    return app
