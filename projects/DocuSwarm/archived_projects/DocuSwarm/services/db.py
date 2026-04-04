import os
import psycopg2

def get_db_connection():
    return psycopg2.connect(os.getenv('DATABASE_URL'))

def get_user_data(clerk_user_id):
    conn = get_db_connection()
    try:
        with conn:
            with conn.cursor() as cursor:
                cursor.execute('''
                    INSERT INTO users (clerk_user_id, tier, usage_count)
                    VALUES (%s, 'Hobby', 0)
                    ON CONFLICT (clerk_user_id) DO NOTHING
                ''', (clerk_user_id,))
                
                cursor.execute('SELECT tier, usage_count, stripe_customer_id, github_access_token FROM users WHERE clerk_user_id = %s', (clerk_user_id,))
                return cursor.fetchone()
    finally:
        if conn:
            conn.close()
