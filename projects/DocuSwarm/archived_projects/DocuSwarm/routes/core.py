import os
import base64
from flask import Blueprint, render_template, jsonify
from services.auth import require_auth
from services.db import get_user_data

core_bp = Blueprint('core', __name__)

@core_bp.route('/')
def index():
    clerk_key = os.getenv('CLERK_PUBLISHABLE_KEY')
    clerk_domain = ""
    if clerk_key:
        encoded = clerk_key.replace('pk_test_', '').replace('pk_live_', '')
        encoded += '=' * (-len(encoded) % 4)
        try:
            clerk_domain = base64.b64decode(encoded).decode('utf-8').rstrip('$')
        except Exception:
            clerk_domain = "primary-herring-55.clerk.accounts.dev"
    
    ph_key = os.getenv("POSTHOG_API_KEY", "")
    ph_host = os.getenv("POSTHOG_HOST", "https://app.posthog.com")
    
    return render_template('index.html', 
                          clerk_publishable_key=clerk_key, 
                          clerk_domain=clerk_domain,
                          posthog_key=ph_key,
                          posthog_host=ph_host)

@core_bp.route('/api/user/status', methods=['GET'])
@require_auth
def user_status(clerk_user_id):
    if not clerk_user_id:
        return jsonify({"tier": "Anonymous", "usage_count": 0, "github_connected": False})
    tier, usage_count, stripe_customer_id, github_token = get_user_data(clerk_user_id)
    return jsonify({
        "tier": tier,
        "usage_count": usage_count,
        "github_connected": github_token is not None
    })
