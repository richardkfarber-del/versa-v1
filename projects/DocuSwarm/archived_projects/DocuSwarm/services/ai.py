import os
import re
import google.generativeai as genai
from google.api_core import exceptions

def init_ai():
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key and api_key != "insert_key_here":
        genai.configure(api_key=api_key)

def strip_comments(code):
    # Basic regex to strip comments to save tokens and reduce noise
    code = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
    code = re.sub(r'(//|#).*?$', '', code, flags=re.MULTILINE)
    return code.strip()

def generate_documentation(language, template_instruction, prompt_context):
    prompt = (
        f"You are an expert technical writer and senior software engineer. "
        f"{template_instruction} "
        f"Analyze the relationships across files and explain the logic purely based on the functional code provided.\n"
        f"Programming Language: {language}\n\n"
        f"CODE CONTEXT:\n{prompt_context}\n\n"
        f"Return ONLY the markdown documentation."
    )
    
    # We use gemini-2.5-flash for speed and higher rate limits
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    # Config for generation to include a timeout hint if supported by the client
    # Note: google-generativeai usually handles timeouts via the underlying transport
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                candidate_count=1,
                max_output_tokens=2048,
                temperature=0.2,
            )
        )
        return response.text
    except exceptions.DeadlineExceeded:
        raise Exception("The AI model took too long to respond. This usually happens with very large files. Try submitting fewer files at once.")
    except Exception as e:
        raise Exception(f"AI Generation Error: {str(e)}")
