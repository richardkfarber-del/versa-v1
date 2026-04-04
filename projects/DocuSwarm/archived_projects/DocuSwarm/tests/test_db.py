import pytest
from unittest.mock import patch, MagicMock
from services.db import get_db_connection, get_user_data

@patch('services.db.os.getenv')
@patch('services.db.psycopg2.connect')
def test_get_db_connection(mock_connect, mock_getenv):
    mock_getenv.return_value = 'postgres://fake:url@localhost/db'
    
    get_db_connection()
    
    mock_getenv.assert_called_once_with('DATABASE_URL')
    mock_connect.assert_called_once_with('postgres://fake:url@localhost/db')

@patch('services.db.get_db_connection')
def test_get_user_data(mock_get_db_conn):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    
    # Mock context managers for conn and cursor
    mock_conn.__enter__.return_value = mock_conn
    mock_cursor.__enter__.return_value = mock_cursor
    mock_conn.cursor.return_value = mock_cursor
    
    # Mock the return values for the database query
    mock_cursor.fetchone.return_value = ('Pro', 10, 'cus_test_123', 'gh_token_abc')
    mock_get_db_conn.return_value = mock_conn
    
    result = get_user_data('clerk_user_123')
    
    # Verify the SQL was executed
    assert mock_cursor.execute.call_count == 2
    assert result == ('Pro', 10, 'cus_test_123', 'gh_token_abc')
    
    # Verify the connection was closed in the finally block
    mock_conn.close.assert_called_once()
