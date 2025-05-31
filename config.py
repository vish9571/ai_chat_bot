import os
import datetime

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default-secret')
    SESSION_LIFETIME = datetime.timedelta(minutes=15)
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
