import os
from flask import Flask
from dotenv import load_dotenv

def create_app():
    # Load environment variables
    load_dotenv()
    
    # Initialize Watchtower (Flask app)
    app = Flask(__name__)
    
    # Initialize External Services
    from services.ai import init_ai
    init_ai()
    
    import posthog
    posthog.project_api_key = os.getenv("POSTHOG_API_KEY", "placeholder_key")
    posthog.host = os.getenv("POSTHOG_HOST", "https://app.posthog.com")
    
    # Import Blueprints
    from routes.core import core_bp
    from routes.docs import docs_bp
    from routes.github import github_bp
    from routes.billing import billing_bp
    
    # Register Blueprints
    app.register_blueprint(core_bp)
    app.register_blueprint(docs_bp)
    app.register_blueprint(github_bp)
    app.register_blueprint(billing_bp)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=8080)
