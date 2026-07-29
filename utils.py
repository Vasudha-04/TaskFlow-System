"""
utils.py
=========
Utility functions for data formatting and date handling.
"""
from datetime import datetime


# ─────────────────────────────────────────────
# DATA FORMATTERS
# ─────────────────────────────────────────────

def serialize_task(task_row: dict) -> dict:
    """Convert a raw task DB row into a clean API response dict."""
    if not task_row:
        return None
    return {
        "id": task_row["id"],
        "title": task_row["title"],
        "description": task_row.get("description", ""),
        "status": task_row["status"],
        "priority": task_row["priority"],
        "due_date": _format_dt(task_row.get("due_date")),
        "is_overdue": _is_overdue(task_row.get("due_date"), task_row.get("status")),
        "created_at": _format_dt(task_row.get("created_at")),
        "updated_at": _format_dt(task_row.get("updated_at")),
    }


# ─────────────────────────────────────────────
# INTERNAL HELPERS
# ─────────────────────────────────────────────

def _format_dt(value):
    """Format a datetime value to ISO string, or return None."""
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value) if value else None


def _is_overdue(due_date, status):
    """Check if a task is overdue (past due_date and not completed)."""
    if not due_date or status == "completed":
        return False
    if isinstance(due_date, str):
        try:
            due_date = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
        except ValueError:
            return False
    if not isinstance(due_date, datetime):
        return False
    return due_date < datetime.now()

