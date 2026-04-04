FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir fastapi uvicorn sqlalchemy psycopg2-binary pydantic email-validator pyjwt==2.8.0 python-multipart==0.0.9 redis==5.0.4 passlib[bcrypt]==1.7.4 starlette==1.0.0
COPY . .
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
