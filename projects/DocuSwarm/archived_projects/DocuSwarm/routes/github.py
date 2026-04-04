import os
import requests
import base64
from flask import Blueprint, request, jsonify, redirect
from services.auth import require_auth
from services.db import get_user_data, get_db_connection
import posthog

github_bp = Blueprint('github', __name__)

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")

@github_bp.route('/api/auth/github')
@require_auth
def github_auth(clerk_user_id):
    if not clerk_user_id:
        return jsonify({"error": "Login required"}), 401
    github_url = f"https://github.com/login/oauth/authorize?client_id={GITHUB_CLIENT_ID}&scope=repo&state={clerk_user_id}"
    return jsonify({"url": github_url})

@github_bp.route('/api/auth/github/callback')
def github_callback():
    code = request.args.get('code')
    clerk_user_id = request.args.get('state')
    
    if not code or not clerk_user_id:
        return "Invalid request", 400
        
    response = requests.post(
        "https://github.com/login/oauth/access_token",
        data={
            "client_id": GITHUB_CLIENT_ID,
            "client_secret": GITHUB_CLIENT_SECRET,
            "code": code
        },
        headers={"Accept": "application/json"}
    )
    
    token_data = response.json()
    access_token = token_data.get('access_token')
    
    if access_token:
        conn = get_db_connection()
        try:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute('UPDATE users SET github_access_token = %s WHERE clerk_user_id = %s', (access_token, clerk_user_id))
        finally:
            conn.close()
            
    return redirect('/')

@github_bp.route('/api/github/repos', methods=['GET'])
@require_auth
def get_github_repos(clerk_user_id):
    if not clerk_user_id:
        return jsonify([])
    tier, usage_count, stripe_customer_id, github_token = get_user_data(clerk_user_id)
    if not github_token:
        return jsonify({"error": "GitHub not connected"}), 400
        
    response = requests.get(
        "https://api.github.com/user/repos?sort=updated",
        headers={"Authorization": f"token {github_token}"}
    )
    return jsonify(response.json())

@github_bp.route('/api/export/github', methods=['POST'])
@require_auth
def export_to_github(clerk_user_id):
    if not clerk_user_id:
        return jsonify({"error": "Login required"}), 401
    tier, usage_count, stripe_customer_id, github_token = get_user_data(clerk_user_id)
    if not github_token:
        return jsonify({"error": "GitHub not connected"}), 400
        
    data = request.get_json()
    repo_full_name = data.get('repo')
    path = data.get('path', 'README.md')
    content = data.get('content')
    
    sha = None
    response = requests.get(
        f"https://api.github.com/repos/{repo_full_name}/contents/{path}",
        headers={"Authorization": f"token {github_token}"}
    )
    if response.status_code == 200:
        sha = response.json().get('sha')
        
    payload = {
        "message": "docs: update documentation via DocuSwarm",
        "content": base64.b64encode(content.encode('utf-8')).decode('utf-8'),
        "branch": "main"
    }
    if sha:
        payload["sha"] = sha
        
    res = requests.put(
        f"https://api.github.com/repos/{repo_full_name}/contents/{path}",
        headers={"Authorization": f"token {github_token}"},
        json=payload
    )
    
    if res.status_code in [200, 201]:
        try:
            posthog.capture(distinct_id=clerk_user_id, event='github_export_success', properties={'repo': repo_full_name})
        except:
            pass
        return jsonify({"success": True, "url": res.json().get('content', {}).get('html_url')})
    else:
        try:
            posthog.capture(distinct_id=clerk_user_id, event='github_export_error', properties={'error': res.json().get('message')})
        except:
            pass
        return jsonify({"error": res.json().get('message')}), res.status_code
