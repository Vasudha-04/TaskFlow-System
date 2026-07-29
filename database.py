"""
database.py
=============
Database connection handler and table creation script.
Uses PyMySQL with DictCursor for easy-to-read results.
"""
import pymysql
from pymysql.cursors import DictCursor
from config import Config


def get_db():
    """
    Create and return a new database connection.
    Each call returns a fresh connection — remember to close it!
    """
    return pymysql.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        cursorclass=DictCursor,
        autocommit=True,
    )


def init_db():
    """
    Create the database and tables if they don't exist.
    Safe to run multiple times — uses IF NOT EXISTS.
    """
    # First connect without specifying a database to create it
    conn = pymysql.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
    )
    cursor = conn.cursor()

    print(f"[+] Creating database '{Config.DB_NAME}' if not exists...")
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {Config.DB_NAME}")
    cursor.execute(f"USE {Config.DB_NAME}")

    # ── Tasks Table ──
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            description TEXT,
            status VARCHAR(20) DEFAULT 'pending' NOT NULL,
            priority VARCHAR(20) DEFAULT 'medium' NOT NULL,
            due_date DATETIME,
            is_deleted TINYINT(1) DEFAULT 0 NOT NULL,
            deleted_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_status (status),
            INDEX idx_due_date (due_date)
        )
    """)
    print("  [OK] tasks table ready")

    cursor.close()
    conn.close()
    print(f"\n[SUCCESS] Database '{Config.DB_NAME}' is ready!")
    return True


if __name__ == "__main__":
    """Run this directly to initialize the database."""
    init_db()

