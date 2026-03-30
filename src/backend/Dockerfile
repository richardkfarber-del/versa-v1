FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir fastapi uvicorn sqlalchemy redis passlib[bcrypt] "bcrypt<4.0.0" psycopg2-binary pyjwt pydantic email-validator python-multipart
COPY . .
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
