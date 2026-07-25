from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

def hash_password(password: str) -> str:
    """Hashes plain text password."""
    return generate_password_hash(password)

def verify_password(password_hash: str, password: str) -> bool:
    """Verifies plain text password against hash."""
    return check_password_hash(password_hash, password)

def format_user(user_row: dict) -> dict:
    """Formats a user database dictionary for API output."""
    if not user_row:
        return None
    return {
        "id": user_row.get("id"),
        "username": user_row.get("username"),
        "email": user_row.get("email"),
        "role": user_row.get("role"),
        "created_at": user_row.get("created_at").isoformat() if isinstance(user_row.get("created_at"), datetime) else user_row.get("created_at"),
    }

def format_task(task_row: dict) -> dict:
    """Formats a task database dictionary for API output."""
    if not task_row:
        return None
    return {
        "id": task_row.get("id"),
        "user_id": task_row.get("user_id"),
        "title": task_row.get("title"),
        "description": task_row.get("description"),
        "status": task_row.get("status"),
        "priority": task_row.get("priority"),
        "created_at": task_row.get("created_at").isoformat() if isinstance(task_row.get("created_at"), datetime) else task_row.get("created_at"),
        "updated_at": task_row.get("updated_at").isoformat() if isinstance(task_row.get("updated_at"), datetime) else task_row.get("updated_at"),
    }