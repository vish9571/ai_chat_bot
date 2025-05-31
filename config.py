import os
import datetime

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///data.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_LIFETIME = datetime.timedelta(minutes=15)  # 15 minute auto logout

