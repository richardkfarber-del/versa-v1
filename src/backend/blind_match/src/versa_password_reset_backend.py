
from flask import Flask, request, jsonify, url_for
import secrets
import datetime
import hashlib
import os
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({"error": f"Too many requests. Please try again later."}), 429

FRONTEND_BASE_URL = os.environ.get('FRONTEND_BASE_URL', 'http://localhost:5000')

# --- In-memory "Database" Simulation ---
# In a real application, this would be a proper database (SQL/NoSQL)
# Email addresses are stored and compared in lowercase for case insensitivity
USERS_DB = {
    "user@example.com".lower(): {
        "password_hash": hashlib.sha256("old_password_hashed".encode()).hexdigest(),
        "is_registered": True
    },
    "test@versa.com".lower(): {
        "password_hash": hashlib.sha256("VersaPass123!".encode()).hexdigest(), # Example strong password
        "is_registered": True
    }
}

# Stores reset tokens: {token: {"email": "user@example.com", "expires_at": datetime_obj, "used": False}}
RESET_TOKENS_DB = {}

# --- Helper Functions ---
def generate_reset_token():
    return secrets.token_urlsafe(32)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def send_password_reset_email(email, reset_link):
    # In a real application, this would integrate with an email service (e.g., SendGrid, Mailgun)
    # For demonstration, we'll log to console without sensitive details.
    print(f"--- Sending Password Reset Email (to {email}) ---")
    print(f"Subject: Versa App - Password Reset Request")
    print(f"Link: {reset_link}")
    print(f"---------------------")

def is_strong_password(password):
    # Password complexity requirements:
    # At least 8 characters long
    # Contains at least one uppercase letter
    # Contains at least one lowercase letter
    # Contains at least one number
    # Contains at least one special character
    if len(password) < 8:
        return False
    if not any(char.isupper() for char in password):
        return False
    if not any(char.islower() for char in password):
        return False
    if not any(char.isdigit() for char in password):
        return False
    # Check for special characters using a simple regex or set intersection
    special_characters = "!@#$%^&*()_+=-[]{}\\|;:'\",.<>/?`~"
    if not any(char in special_characters for char in password):
        return False
    return True

# --- API Endpoints ---

@app.route('/api/forgot-password', methods=['POST'])
@limiter.limit("5 per hour") # Rate limit for forgot password endpoint
def forgot_password():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email is required."}), 400

    email = email.lower() # Normalize email to lowercase

    # Invalidate all existing tokens for this user
    for token_key, token_data_val in RESET_TOKENS_DB.items():
        if token_data_val["email"] == email and not token_data_val["used"]:
            RESET_TOKENS_DB[token_key]["used"] = True
            print(f"Invalidated old token {token_key} for {email}")

    # Scenario: User requests password reset with an unregistered email
    if email not in USERS_DB or not USERS_DB[email]["is_registered"]:
        print(f"Attempted password reset for unregistered email: {email}")
        return jsonify({"error": "The email address is not recognized."}), 404

    token = generate_reset_token()
    expires_at = datetime.datetime.now() + datetime.timedelta(hours=1) # Link expires in 1 hour

    RESET_TOKENS_DB[token] = {
        "email": email,
        "expires_at": expires_at,
        "used": False
    }

    reset_link = f"{FRONTEND_BASE_URL}/?token={token}"

    send_password_reset_email(email, reset_link)

    return jsonify({"message": "If the email is registered, a password reset link has been sent to your email address."}), 200

@app.route('/api/reset-password-validate', methods=['POST']) # Using POST to send token securely
def reset_password_validate():
    data = request.get_json()
    token = data.get('token')

    if not token:
        return jsonify({"error": "Reset token is missing."}), 400

    token_data = RESET_TOKENS_DB.get(token)

    # Scenario: Password reset link expires / Invalid token
    if not token_data or token_data["used"] or token_data["expires_at"] < datetime.datetime.now():
        return jsonify({"error": "The password reset link is invalid or has expired. Please request a new password reset link."}), 400

    return jsonify({"message": "Token is valid."}), 200

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('newPassword')

    if not token or not new_password:
        return jsonify({"error": "Token and new password are required."}), 400

    token_data = RESET_TOKENS_DB.get(token)

    # Scenario: Password reset link expires / Invalid token (re-check to prevent race conditions or double use)
    if not token_data or token_data["used"] or token_data["expires_at"] < datetime.datetime.now():
        return jsonify({"error": "The password reset link is invalid or has expired. Please request a new password reset link."}), 400

    # Scenario: User enters invalid new password during reset
    if not is_strong_password(new_password):
        return jsonify({
            "error": "Password does not meet complexity requirements. It must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character."
        }), 400

    email = token_data["email"]

    # Update password in DB
    USERS_DB[email]["password_hash"] = hash_password(new_password)
    token_data["used"] = True # Mark token as used to prevent replay attacks

    # print(f"Password for {email} has been successfully reset.") # Removed for production readiness
    # print(f"New password hash for {email}: {USERS_DB[email]['password_hash']}") # Removed for production readiness
    # print(f"Token {token} marked as used: {RESET_TOKENS_DB[token]['used']}") # Removed for production readiness

    return jsonify({"message": "Your password has been updated successfully."}), 200

if __name__ == '__main__':
    # To run this Flask app:
    # 1. Save this code as versa_password_reset_backend.py
    # 2. Make sure you have Flask installed: pip install Flask
    # 3. Run from your terminal: python versa_password_reset_backend.py
    # This will run on http://127.0.0.1:5000/
    # For production, use a WSGI server like Gunicorn or uWSGI.
    app.run(debug=True) # debug=True enables auto-reloading and better error messages
