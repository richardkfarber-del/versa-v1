import os
from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timezone
from services.auth import require_auth
from services.db import get_db_connection, get_user_data
from services.ai import generate_documentation, strip_comments
import posthog
import time

docs_bp = Blueprint('docs', __name__)

TEMPLATES = {
    "standard": "Generate a well-structured, professional README style documentation.",
    "api_reference": "Generate a highly technical API Reference focusing on endpoints, parameters, return types, and authentication.",
    "tutorial": "Generate a step-by-step beginner-friendly tutorial explaining how to install, configure, and use this code.",
    "executive_summary": "Generate a high-level executive summary explaining the business value and core architecture for non-technical stakeholders."
}

@docs_bp.route('/api/v1/generate-docs', methods=['POST'], strict_slashes=False)
@require_auth
def generate_docs(clerk_user_id):
    start_time = time.time()
    tier = 'Hobby'
    
    if clerk_user_id:
        tier, usage_count, stripe_customer_id, github_token = get_user_data(clerk_user_id)
        if tier.lower() == 'hobby' and usage_count >= 5:
            try:
                posthog.capture(distinct_id=clerk_user_id, event='generation_limit_reached')
            except:
                pass
            return jsonify({"error": "Too Many Requests: Your Hobby tier quota (5) is exceeded. Please upgrade to Pro for unlimited access."}), 429
    
    data = request.get_json()
    files = data.get('files', [])
    if not files and 'code_snippet' in data:
        files = [{"name": "input_code", "content": data['code_snippet']}]
        
    if not files:
        return jsonify({"error": "Bad Request: No code provided."}), 400
    
    language = data.get('language', 'unknown')
    template_key = data.get('template', 'standard')
    template_instruction = TEMPLATES.get(template_key, TEMPLATES['standard'])
    
    current_app.logger.info(f"Generation started for user {clerk_user_id or 'anonymous'}. Files: {len(files)}, Language: {language}, Template: {template_key}")

    ai_context = []
    full_original_code = []
    total_chars = 0
    for f in files:
        name = f.get('name', 'file')
        content = f.get('content', '')
        total_chars += len(content)
        ai_context.append(f"FILE: {name}\nRAW LOGIC:\n{strip_comments(content)}")
        full_original_code.append(f"--- FILE: {name} ---\n{content}")

    current_app.logger.info(f"Pre-processing complete. Total characters: {total_chars}")

    prompt_context = "\n\n".join(ai_context)
    history_content = "\n\n".join(full_original_code)

    try:
        current_app.logger.info("Invoking Gemini API...")
        documentation = generate_documentation(language, template_instruction, prompt_context)
        duration = time.time() - start_time
        current_app.logger.info(f"Gemini API returned successfully in {duration:.2f} seconds.")
        
        if clerk_user_id:
            conn = get_db_connection()
            try:
                with conn:
                    with conn.cursor() as cursor:
                        cursor.execute('''
                            INSERT INTO documents (clerk_user_id, prompt, generated_content)
                            VALUES (%s, %s, %s)
                        ''', (clerk_user_id, history_content, documentation))
                        cursor.execute('UPDATE users SET usage_count = usage_count + 1 WHERE clerk_user_id = %s', (clerk_user_id,))
            finally:
                conn.close()
            try:
                posthog.capture(distinct_id=clerk_user_id, event='documentation_generated', properties={
                    'template': template_key, 
                    'language': language,
                    'duration_seconds': duration,
                    'file_count': len(files)
                })
            except:
                pass
        else:
            try:
                posthog.capture(distinct_id='anonymous_user', event='documentation_generated_anonymous', properties={
                    'template': template_key, 
                    'language': language,
                    'duration_seconds': duration
                })
            except:
                pass
            
    except Exception as e:
        duration = time.time() - start_time
        error_msg = str(e)
        current_app.logger.error(f"Error during generation after {duration:.2f}s: {error_msg}")
        
        uid = clerk_user_id if clerk_user_id else 'anonymous'
        try:
            posthog.capture(distinct_id=uid, event='generation_error', properties={
                'error': error_msg,
                'duration_seconds': duration
            })
        except:
            pass
        return jsonify({"status": "error", "message": error_msg}), 500
    
    return jsonify({
        "status": "success",
        "documentation": documentation,
        "language_detected": language,
        "subscription_tier": "Pro" if clerk_user_id and tier.lower() == 'pro' else "Hobby",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "duration_seconds": round(duration, 2)
    }), 200

@docs_bp.route('/api/documents', methods=['GET'])
@require_auth
def get_documents(clerk_user_id):
    if not clerk_user_id:
        return jsonify([])
    conn = get_db_connection()
    try:
        with conn:
            with conn.cursor() as cursor:
                cursor.execute('SELECT id, prompt, generated_content, created_at FROM documents WHERE clerk_user_id = %s ORDER BY created_at DESC', (clerk_user_id,))
                docs = cursor.fetchall()
                results = []
                for doc in docs:
                    results.append({
                        "id": doc[0],
                        "prompt": doc[1],
                        "generated_content": doc[2],
                        "created_at": doc[3].isoformat()
                    })
                return jsonify(results)
    finally:
        conn.close()
