import pytest
from services.ai import strip_comments, generate_documentation
from unittest.mock import patch, MagicMock

def test_strip_comments():
    code = """
    // This is a C-style comment
    var x = 10; # Python style comment
    /* Multi-line
       comment block */
    let y = 20;
    """
    result = strip_comments(code)
    
    assert "var x = 10;" in result
    assert "let y = 20;" in result
    assert "Python style comment" not in result
    assert "Multi-line" not in result
    assert "C-style comment" not in result

@patch('services.ai.genai.GenerativeModel')
def test_generate_documentation(mock_gen_model):
    # Mock the Gemini API call
    mock_instance = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "# Mocked Documentation"
    mock_instance.generate_content.return_value = mock_response
    mock_gen_model.return_value = mock_instance

    language = "Python"
    template_instruction = "Generate an API Reference."
    prompt_context = "def test(): pass"
    
    result = generate_documentation(language, template_instruction, prompt_context)
    
    assert result == "# Mocked Documentation"
    mock_gen_model.assert_called_once_with('gemini-2.5-flash')
    mock_instance.generate_content.assert_called_once()
