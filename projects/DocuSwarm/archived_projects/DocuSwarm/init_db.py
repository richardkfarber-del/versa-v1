import os
import psycopg2

def init_database():
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("DATABASE_URL environment variable is missing.")
        return

    conn = psycopg2.connect(database_url)
    try:
        with conn:
            with conn.cursor() as cursor:
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS users (
                        api_key TEXT PRIMARY KEY,
                        tier TEXT,
                        usage_count INTEGER DEFAULT 0
                    )
                ''')
                
                # Insert test user
                cursor.execute('''
                    INSERT INTO users (api_key, tier, usage_count)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (api_key) DO NOTHING
                ''', ('sk_test_12345', 'Hobby', 0))
                
        print("Database initialized successfully with PostgreSQL.")
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    init_database()
