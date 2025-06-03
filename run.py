from app import create_app
from dotenv import load_dotenv
import os

load_dotenv()  # ✅ Load .env automatically

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))  # Use PORT from Render, default to 5000 for local
    app.run(host="0.0.0.0", port=port, debug=True)
