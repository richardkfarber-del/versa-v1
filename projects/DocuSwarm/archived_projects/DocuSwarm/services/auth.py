import os
import base64
import jwt
from jwt import PyJWKClient
from flask import request, jsonify
from functools import wraps

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        is_generation_route = request.path == '/api/v1/generate-docs' or request.endpoint == 'generate_docs'
        
        if not auth_header or not auth_header.startswith('Bearer '):
            if is_generation_route:
                return f(None, *args, **kwargs)
            return jsonify({"error": "Unauthorized: Missing or invalid token."}), 401
        
        token = auth_header.split(' ')[1]
        try:
            clerk_publishable = os.getenv('CLERK_PUBLISHABLE_KEY')
            if not clerk_publishable:
                return jsonify({"error": "Server misconfiguration: missing Clerk key."}), 500
                
            encoded_domain = clerk_publishable.replace('pk_test_', '').replace('pk_live_', '')
            encoded_domain += '=' * (-len(encoded_domain) % 4)
            try:
                clerk_domain = base64.b64decode(encoded_domain).decode('utf-8').rstrip('$')
            except Exception:
                clerk_domain = "primary-herring-55.clerk.accounts.dev"
                
            jwks_url = f"https://{clerk_domain}/.well-known/jwks.json"
            jwks_client = PyJWKClient(jwks_url)
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            
            payload = jwt.decode(token, signing_key.key, algorithms=["RS256"])
            clerk_user_id = payload.get('sub')
            if not clerk_user_id:
                return jsonify({"error": "Unauthorized: Token missing subject claim."}), 401
            
            return f(clerk_user_id, *args, **kwargs)
        except Exception as e:
            return jsonify({"error": f"Unauthorized: Invalid token. {str(e)}"}), 401
    return decorated_function
