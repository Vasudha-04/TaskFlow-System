import os
import pymysql
from pymysql.cursors import DictCursor

def get_db_connection():
    """Establishes and returns a PyMySQL database connection with DictCursor."""
    return pymysql.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "task_flow_db"),
        cursorclass=DictCursor,
        autocommit=True
    )
