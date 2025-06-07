import os
import datetime

basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, '..', 'test.db')

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default-secret')
    SESSION_LIFETIME = datetime.timedelta(minutes=15)
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY')

    # Handle DATABASE_URL override (for Render production)
    db_url = os.environ.get('DATABASE_URL', f'sqlite:///{db_path}')
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://")

    SQLALCHEMY_DATABASE_URI = db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
