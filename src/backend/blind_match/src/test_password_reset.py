import pytest
from versa_password_reset_backend import app, limiter, USERS_DB, RESET_TOKENS_DB, hash_password, is_strong_password
import datetime
import json
import copy
from flask_limiter.util import get_real_ip # Import for simulating different IPs for rate limiting

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['RATELIMIT_ENABLED'] = True # Ensure rate limits are active during testing
    with app.test_client() as client:
        yield client

@pytest.fixture(autouse=True)
def reset_dbs():
    """Resets the in-memory databases before each test."""
    global USERS_DB, RESET_TOKENS_DB
    # Store initial state
    initial_users_db = {
        "user@example.com".lower(): { # Ensure initial data is lowercase
            "password_hash": hash_password("old_password_hashed"),
            "is_registered": True
        },
        "test@versa.com".lower(): { # Ensure initial data is lowercase
            "password_hash": hash_password("VersaPass123!"),
            "is_registered": True
        }
    }
    USERS_DB = copy.deepcopy(initial_users_db)
    RESET_TOKENS_DB = {}
    yield

def test_ac_1_successful_password_reset(client):
    """Scenario: User successfully resets password via email."""
    test_email = "user@example.com"
    initial_password_hash = USERS_DB[test_email]["password_hash"]

    # 1. Initiate "Forgot Password"
    response = client.post('/api/forgot-password', json={'email': test_email})
    assert response.status_code == 200
    assert "password reset link has been sent" in response.json['message']

    # Extract token (simulated from email log)
    token = None
    for t, data in RESET_TOKENS_DB.items():
        if data["email"] == test_email:
            token = t
            break
    assert token is not None

    # 2. Validate reset token
    response = client.post('/api/reset-password-validate', json={'token': token})
    assert response.status_code == 200
    assert response.json['message'] == "Token is valid."

    # 3. Reset password with new valid password
    new_password = "NewVersaPass456!"
    response = client.post('/api/reset-password', json={'token': token, 'newPassword': new_password})
    assert response.status_code == 200
    assert "password has been updated successfully" in response.json['message']

    # Verify password updated and token used
    assert USERS_DB[test_email]["password_hash"] == hash_password(new_password)
    assert RESET_TOKENS_DB[token]["used"] is True
    assert initial_password_hash != USERS_DB[test_email]["password_hash"]

def test_ac_2_unregistered_email_forgot_password(client):
    """Scenario: User requests password reset with an unregistered email."""
    unregistered_email = "nonexistent@example.com"

    response = client.post('/api/forgot-password', json={'email': unregistered_email})
    assert response.status_code == 404
    assert "email address is not recognized" in response.json['error']
    assert len(RESET_TOKENS_DB) == 0 # No token should be generated

def test_ac_3_expired_password_reset_link(client):
    """Scenario: Password reset link expires."""
    test_email = "test@versa.com"

    # Initiate forgot password to get a token
    client.post('/api/forgot-password', json={'email': test_email})
    token = list(RESET_TOKENS_DB.keys())[0]

    # Manually expire the token
    RESET_TOKENS_DB[token]["expires_at"] = datetime.datetime.now() - datetime.timedelta(hours=2)

    # Attempt to validate expired token
    response = client.post('/api/reset-password-validate', json={'token': token})
    assert response.status_code == 400
    assert "password reset link is invalid or has expired" in response.json['error']

    # Attempt to reset password with expired token
    new_password = "ExpiredPass123!"
    response = client.post('/api/reset-password', json={'token': token, 'newPassword': new_password})
    assert response.status_code == 400
    assert "password reset link is invalid or has expired" in response.json['error']

def test_ac_4_invalid_new_password_during_reset(client):
    """Scenario: User enters invalid new password during reset."""
    test_email = "user@example.com"
    client.post('/api/forgot-password', json={'email': test_email})
    token = list(RESET_TOKENS_DB.keys())[0]

    # Test cases for weak passwords
    weak_passwords = [
        ("short", "at least 8 characters"),
        ("nouppercase1!", "uppercase letter"),
        ("NOLOWERCASE1!", "lowercase letter"),
        ("NoNumberCase!", "number"),
        ("NoSpecialChar8", "special character"),
        ("alllower123!", "uppercase letter"),
        ("ALLUPPER123!", "lowercase letter"),
        ("NoSpecialChar8", "special character") # Redundant but explicit
    ]

    for weak_pass, error_part in weak_passwords:
        response = client.post('/api/reset-password', json={'token': token, 'newPassword': weak_pass})
        assert response.status_code == 400
        assert "Password does not meet complexity requirements" in response.json['error']
        assert error_part in response.json['error']
        assert USERS_DB[test_email]["password_hash"] != hash_password(weak_pass) # Password should not be updated

def test_edge_case_invalid_token_format(client):
    """Edge Case: Invalid token format/non-existent token."""
    malformed_token = "not_a_valid_token_123"
    non_existent_token = "nonexistenttokenabc123"

    # Test validation with malformed token
    response = client.post('/api/reset-password-validate', json={'token': malformed_token})
    assert response.status_code == 400
    assert "invalid or has expired" in response.json['error']

    # Test reset with malformed token
    response = client.post('/api/reset-password', json={'token': malformed_token, 'newPassword': "ValidPass123!"})
    assert response.status_code == 400
    assert "invalid or has expired" in response.json['error']

    # Test validation with non-existent token
    response = client.post('/api/reset-password-validate', json={'token': non_existent_token})
    assert response.status_code == 400
    assert "invalid or has expired" in response.json['error']

    # Test reset with non-existent token
    response = client.post('/api/reset-password', json={'token': non_existent_token, 'newPassword': "ValidPass123!"})
    assert response.status_code == 400
    assert "invalid or has expired" in response.json['error']

def test_edge_case_token_replay_attack(client):
    """Edge Case: Token replay attack (using a used token)."""
    test_email = "user@example.com"
    client.post('/api/forgot-password', json={'email': test_email})
    token = list(RESET_TOKENS_DB.keys())[0]

    # First successful reset
    new_password_1 = "FirstPass123!"
    response = client.post('/api/reset-password', json={'token': token, 'newPassword': new_password_1})
    assert response.status_code == 200
    assert USERS_DB[test_email]["password_hash"] == hash_password(new_password_1)
    assert RESET_TOKENS_DB[token]["used"] is True

    # Attempt to use the same token again
    new_password_2 = "SecondPass456!"
    response = client.post('/api/reset-password', json={'token': token, 'newPassword': new_password_2})
    assert response.status_code == 400
    assert "invalid or has expired" in response.json['error']
    assert USERS_DB[test_email]["password_hash"] == hash_password(new_password_1) # Password should not change

def test_edge_case_concurrent_reset_requests(client):
    """
    Edge Case: Concurrent reset requests for the same user.
    New behavior: Generating a new token invalidates previous unused tokens for the same user.
    """
    test_email = "test@versa.com"
    initial_password_hash = USERS_DB[test_email]["password_hash"]

    # 1. Request first token (Token A)
    response_a = client.post('/api/forgot-password', json={'email': test_email})
    assert response_a.status_code == 200
    assert "password reset link has been sent" in response_a.json['message']

    token_a = None
    for t, data in RESET_TOKENS_DB.items():
        if data["email"] == test_email and not data["used"]: # Find the currently active token
            token_a = t
            break
    assert token_a is not None
    assert RESET_TOKENS_DB[token_a]["used"] is False

    # 2. Request second token (Token B) - This should invalidate Token A
    response_b = client.post('/api/forgot-password', json={'email': test_email})
    assert response_b.status_code == 200
    assert "password reset link has been sent" in response_b.json['message']

    token_b = None
    # Find the newly generated, active token B
    for t, data in RESET_TOKENS_DB.items():
        if data["email"] == test_email and not data["used"]:
            token_b = t
            break
    assert token_b is not None
    assert token_a != token_b # Ensure it's a new token

    # Verify Token A is now marked as used/invalidated
    assert RESET_TOKENS_DB[token_a]["used"] is True, "Old token A should be marked as used (invalidated)"

    # 3. Attempt to use Token A (should fail)
    response_use_a = client.post('/api/reset-password', json={'token': token_a, 'newPassword': "PasswordA123!"})
    assert response_use_a.status_code == 400
    assert "invalid or has expired" in response_use_a.json['error']
    assert USERS_DB[test_email]["password_hash"] == initial_password_hash # Password should not have changed

    # 4. Use Token B to reset password (should succeed)
    new_password_b = "PasswordB456!"
    response_use_b = client.post('/api/reset-password', json={'token': token_b, 'newPassword': new_password_b})
    assert response_use_b.status_code == 200
    assert "password has been updated successfully" in response_use_b.json['message']
    assert USERS_DB[test_email]["password_hash"] == hash_password(new_password_b)
    assert RESET_TOKENS_DB[token_b]["used"] is True

def test_rate_limiting_forgot_password(client):
    """Test the rate limiting on the /api/forgot-password endpoint."""
    test_email = "user@example.com"
    
    # The default limit is "5 per hour" for this endpoint
    # Send 5 requests, they should all succeed
    for i in range(5):
        response = client.post('/api/forgot-password', json={'email': test_email}, environ_base={'REMOTE_ADDR': '127.0.0.99'})
        assert response.status_code == 200, f"Request {i+1} failed unexpectedly: {response.json}"
        assert "password reset link has been sent" in response.json['message']

    # The 6th request should be rate-limited
    response = client.post('/api/forgot-password', json={'email': test_email}, environ_base={'REMOTE_ADDR': '127.0.0.99'})
    assert response.status_code == 429 # Too Many Requests
    assert "too many requests" in response.data.decode('utf-8').lower()

def test_email_case_insensitivity(client):
    """Test that email addresses are handled case-insensitively."""
    registered_email_lowercase = "user@example.com"
    registered_email_uppercase = "USER@EXAMPLE.COM"
    registered_email_mixedcase = "User@Example.com"

    # Request reset with uppercase email
    response_uppercase = client.post('/api/forgot-password', json={'email': registered_email_uppercase})
    assert response_uppercase.status_code == 200
    assert "password reset link has been sent" in response_uppercase.json['message']
    
    # Verify a token was generated for the lowercase version in the DB
    token_uppercase = None
    for t, data in RESET_TOKENS_DB.items():
        if data["email"] == registered_email_lowercase:
            token_uppercase = t
            break
    assert token_uppercase is not None
    assert RESET_TOKENS_DB[token_uppercase]["email"] == registered_email_lowercase # Stored as lowercase

    # Request reset with mixed-case email (should invalidate previous token)
    response_mixedcase = client.post('/api/forgot-password', json={'email': registered_email_mixedcase})
    assert response_mixedcase.status_code == 200
    assert "password reset link has been sent" in response_mixedcase.json['message']

    # Verify the token generated by the uppercase request is now invalidated
    assert RESET_TOKENS_DB[token_uppercase]["used"] is True, "Token from uppercase email request should be invalidated"

    # Verify a new token was generated for the lowercase version
    token_mixedcase = None
    for t, data in RESET_TOKENS_DB.items():
        if data["email"] == registered_email_lowercase and not data["used"]:
            token_mixedcase = t
            break
    assert token_mixedcase is not None
    assert RESET_TOKENS_DB[token_mixedcase]["email"] == registered_email_lowercase # Stored as lowercase

    # Attempt to reset password with the token from mixed-case request
    new_password = "CaseSensitivePass123!"
    response_reset = client.post('/api/reset-password', json={'token': token_mixedcase, 'newPassword': new_password})
    assert response_reset.status_code == 200
    assert "password has been updated successfully" in response_reset.json['message']
    assert USERS_DB[registered_email_lowercase]["password_hash"] == hash_password(new_password)


def test_edge_case_missing_email_forgot_password(client):
    """Edge Case: Missing email in forgot password request."""
    response = client.post('/api/forgot-password', json={})
    assert response.status_code == 400
    assert "Email is required." in response.json['error']

def test_edge_case_missing_token_reset_validate(client):
    """Edge Case: Missing token in reset-password-validate request."""
    response = client.post('/api/reset-password-validate', json={})
    assert response.status_code == 400
    assert "Reset token is missing." in response.json['error']

def test_edge_case_missing_token_or_password_reset(client):
    """Edge Case: Missing token or new password in reset-password request."""
    # Missing token
    response = client.post('/api/reset-password', json={'newPassword': "ValidPass123!"})
    assert response.status_code == 400
    assert "Token and new password are required." in response.json['error']

    # Missing new password
    client.post('/api/forgot-password', json={'email': "user@example.com"})
    token = list(RESET_TOKENS_DB.keys())[0]
    response = client.post('/api/reset-password', json={'token': token})
    assert response.status_code == 400
    assert "Token and new password are required." in response.json['error']

def test_is_strong_password_function():
    """Test the backend's is_strong_password helper function."""
    assert is_strong_password("VersaPass123!") is True
    assert is_strong_password("short1!") is False # Too short
    assert is_strong_password("NOPASSWORD1!") is False # No lowercase
    assert is_strong_password("nopassword1!") is False # No uppercase
    assert is_strong_password("NoNumberCase!") is False # No number
    assert is_strong_password("NoSpecialChar8") is False # No special char
    assert is_strong_password("NoPass123!@#$%") is True # All conditions
    assert is_strong_password("12345678!") is False # No upper/lower
