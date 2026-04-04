import pytest
from unittest.mock import patch
from app import create_app

@patch('app.init_ai')
def test_create_app(mock_init_ai):
    # Verify the application factory pattern correctly initializes Flask
    app = create_app()
    
    assert app is not None
    assert mock_init_ai.called_once()
    
    # Verify Blueprints are registered correctly
    registered_blueprints = list(app.blueprints.keys())
    
    assert 'core' in registered_blueprints
    assert 'docs' in registered_blueprints
    assert 'github' in registered_blueprints
    assert 'billing' in registered_blueprints
