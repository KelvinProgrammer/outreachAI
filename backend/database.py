import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "leads.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create leads table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        source_url TEXT,
        query TEXT,
        name TEXT,
        status TEXT DEFAULT 'pending', -- pending, generated, sent, failed, unsubscribed
        generated_subject TEXT,
        generated_body TEXT,
        error_message TEXT,
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Create SMTP configuration table (stores a single config row)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS smtp_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        host TEXT,
        port INTEGER,
        username TEXT,
        password TEXT,
        use_tls INTEGER DEFAULT 1,
        sender_email TEXT,
        sender_name TEXT
    )
    """)
    
    # Create general settings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        deepseek_api_key TEXT,
        outreach_template TEXT,
        outreach_subject TEXT,
        delay_seconds INTEGER DEFAULT 60
    )
    """)
    
    # Seed default settings if empty
    cursor.execute("SELECT COUNT(*) FROM settings")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO settings (id, deepseek_api_key, outreach_template, outreach_subject, delay_seconds)
        VALUES (
            1, 
            '', 
            'Hello,\n\nI came across your profile via {source_url} and love your work in the travel space! We would love to collaborate with you.\n\nBest regards,\n{sender_name}', 
            'Collaboration Inquiry - Travel & UGC',
            60
        )
        """)
        
    # Seed empty SMTP config if not exists
    cursor.execute("SELECT COUNT(*) FROM smtp_config")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO smtp_config (id, host, port, username, password, use_tls, sender_email, sender_name)
        VALUES (1, 'smtp.gmail.com', 587, '', '', 1, '', '')
        """)
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at:", DB_PATH)
