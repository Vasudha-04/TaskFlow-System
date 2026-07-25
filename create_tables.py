import os
import pymysql
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Fetch connection parameters (defaults to local settings if .env isn't set)
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "170046")  # Replace with your actual password
DB_NAME = os.getenv("DB_NAME", "task_flow_db")

# DDL Statements to create database and tables
SQL_STATEMENTS = [
    f"CREATE DATABASE IF NOT EXISTS {DB_NAME};",
    f"USE {DB_NAME};",
    """
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(80) NOT NULL UNIQUE,
        email VARCHAR(120) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_email (email)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(150) NOT NULL,
        description TEXT NULL,
        status VARCHAR(20) DEFAULT 'pending' NOT NULL,
        priority VARCHAR(20) DEFAULT 'medium' NOT NULL,
        due_date DATETIME NULL,
        is_deleted TINYINT(1) DEFAULT 0 NOT NULL,
        deleted_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_task_status (user_id, status, is_deleted),
        INDEX idx_due_date (due_date)
    );
    """
]

def init_db():
    print("[+] Connecting to MySQL server...")
    try:
        conn = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = conn.cursor()

        for statement in SQL_STATEMENTS:
            cursor.execute(statement)

        print(f"[SUCCESS] Database '{DB_NAME}' and tables ('users', 'tasks') verified successfully!\n")

        # Verify tables in database
        cursor.execute("SHOW TABLES;")
        tables = cursor.fetchall()
        print("Current Tables in Database:")
        for table in tables:
            print(f"   - {table[0]}")

        cursor.close()
        conn.close()
    except Exception as e:
        print(f"[ERROR] Database setup failed: {e}")

if __name__ == "__main__":
    init_db()