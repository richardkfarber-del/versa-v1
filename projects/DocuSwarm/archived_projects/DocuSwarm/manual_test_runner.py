import sys
import os

# Set base path
BASE_DIR = '/app/workspace'
sys.path.append(BASE_DIR)

print("[+] Initiating Manual Infrastructure Verification (No-Framework Mode)...")

try:
    from services.ai import strip_comments
    print("[+] Testing AI Service: strip_comments...")
    
    test_code = "// Comment\nvar x = 1; /* Multi\nLine */\n# Python\ny = 2;"
    result = strip_comments(test_code)
    
    # We expect raw logic back
    assert "var x = 1;" in result
    assert "y = 2;" in result
    assert "Comment" not in result
    assert "Multi" not in result
    print("[PASS] AI Service: strip_comments logic is sound.")

    import psycopg2
    from services.db import get_user_data
    from unittest.mock import patch, MagicMock
    
    print("[+] Testing DB Service: get_user_data (Mocked)...")
    # We must mock get_db_connection because we have no real DB in this test
    with patch('services.db.get_db_connection') as mock_conn_func:
        mock_conn = MagicMock()
        mock_cursor = MagicMock(name="cursor_mock")
        
        # Mock connection and cursor context managers
        mock_conn.__enter__.return_value = mock_conn
        mock_cursor.__enter__.return_value = mock_cursor
        mock_conn.cursor.return_value = mock_cursor
        
        # Mock specific database return for the test
        # SQL flow: 1. INSERT (ON CONFLICT DO NOTHING), 2. SELECT
        mock_cursor.fetchone.return_value = ('Pro', 10, 'cus_123', 'gh_abc')
        mock_conn_func.return_value = mock_conn
        
        res = get_user_data('user_123')
        
        # Verify the result matches our mock
        if res == ('Pro', 10, 'cus_123', 'gh_abc'):
            print("[PASS] DB Service: get_user_data retrieval logic is sound.")
        else:
            raise ValueError(f"Result mismatch: expected Pro, 10, cus_123, gh_abc but got {res}")

    print("\n[SUCCESS] All foundational backend logic verified successfully.")

except Exception as e:
    import traceback
    print("\n[FAIL] Verification failed:")
    traceback.print_exc()
    sys.exit(1)
