"""
models.py
==========
SQL query builders for tasks.
Keeps SQL logic organized instead of scattering it inside route handlers.
"""


def build_task_filters(params: dict) -> tuple:
    """
    Build WHERE clause and params for task listing.
    Supports: search, status, priority, pagination, sorting.

    Returns: (where_clause, query_params_list, sort_clause)
    """
    conditions = ["t.is_deleted = 0"]
    query_params = []

    # ── Search by title or description ──
    search = params.get("search", "").strip()
    if search:
        conditions.append("(t.title LIKE %s OR t.description LIKE %s)")
        pattern = f"%{search}%"
        query_params.extend([pattern, pattern])

    # ── Filter by status ──
    status = params.get("status", "").strip().lower()
    if status:
        conditions.append("t.status = %s")
        query_params.append(status)

    # ── Filter by priority ──
    priority = params.get("priority", "").strip().lower()
    if priority:
        conditions.append("t.priority = %s")
        query_params.append(priority)

    # ── Due date filter (overdue tasks) ──
    overdue = params.get("overdue", "").strip().lower()
    if overdue == "true":
        conditions.append("t.due_date IS NOT NULL AND t.due_date < NOW() AND t.status != 'completed'")

    where_clause = " AND ".join(conditions)

    # ── Sorting ──
    allowed_sorts = {
        "created_at": "t.created_at",
        "title": "t.title",
        "priority": "t.priority",
        "status": "t.status",
        "due_date": "t.due_date",
    }
    sort_by = allowed_sorts.get(params.get("sort_by", "created_at"), "t.created_at")
    sort_order = "ASC" if params.get("order", "desc").lower() == "asc" else "DESC"
    sort_clause = f"ORDER BY {sort_by} {sort_order}"

    return where_clause, query_params, sort_clause


def build_task_update(task_id: int, data: dict) -> tuple:
    """
    Build UPDATE SQL for tasks with only the fields that changed.

    Returns: (update_sql, params_list)
    """
    allowed_fields = {"title", "description", "status", "priority", "due_date"}
    updates = []
    params = []

    for field in allowed_fields:
        if field in data:
            value = data[field]
            if field == "title" and not str(value).strip():
                continue  # skip empty title
            updates.append(f"t.{field} = %s")
            if field == "due_date":
                # Convert empty string to None — MySQL rejects '' for DATETIME
                if value is not None and str(value).strip() == "":
                    params.append(None)
                else:
                    params.append(value)
            else:
                params.append(str(value).strip() if isinstance(value, str) else value)

    if not updates:
        return None, None

    updates.append("t.updated_at = NOW()")
    params.append(task_id)

    sql = f"UPDATE tasks t SET {', '.join(updates)} WHERE t.id = %s"
    return sql, params

