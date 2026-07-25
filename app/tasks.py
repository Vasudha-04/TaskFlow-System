import math
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.db import get_db_connection
from app.models import format_task

tasks_bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")

@tasks_bp.route("", methods=["GET"])
@jwt_required()
def get_tasks():
    current_user_id = int(get_jwt_identity())

    # 1. Extract Query Parameters from URL
    search_query = request.args.get("search", type=str, default="").strip()
    status_filter = request.args.get("status", type=str, default="").strip().lower()
    priority_filter = request.args.get("priority", type=str, default="").strip().lower()

    sort_by = request.args.get("sort_by", type=str, default="created_at").strip().lower()
    order = request.args.get("order", type=str, default="desc").strip().lower()

    page = request.args.get("page", type=int, default=1)
    per_page = request.args.get("per_page", type=int, default=10)

    # Enforce safe pagination boundaries
    per_page = min(max(per_page, 1), 100)
    page = max(page, 1)
    offset = (page - 1) * per_page

    # 2. Dynamic SQL Construction
    conditions = ["user_id = %s", "is_deleted = 0"]
    params = [current_user_id]

    if search_query:
        conditions.append("(title LIKE %s OR description LIKE %s)")
        search_pattern = f"%{search_query}%"
        params.extend([search_pattern, search_pattern])

    if status_filter:
        conditions.append("status = %s")
        params.append(status_filter)

    if priority_filter:
        conditions.append("priority = %s")
        params.append(priority_filter)

    where_clause = " AND ".join(conditions)

    allowed_sort_fields = {
        "created_at": "created_at",
        "title": "title",
        "priority": "priority",
        "status": "status"
    }
    sort_column = allowed_sort_fields.get(sort_by, "created_at")
    sort_order = "ASC" if order == "asc" else "DESC"

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Count Total Items
            count_sql = f"SELECT COUNT(*) AS total FROM tasks WHERE {where_clause}"
            cursor.execute(count_sql, tuple(params))
            total_items = cursor.fetchone()["total"]

            # Fetch Paginated Records
            query_sql = f"SELECT * FROM tasks WHERE {where_clause} ORDER BY {sort_column} {sort_order} LIMIT %s OFFSET %s"
            fetch_params = params + [per_page, offset]
            cursor.execute(query_sql, tuple(fetch_params))
            task_rows = cursor.fetchall()
    finally:
        conn.close()

    total_pages = math.ceil(total_items / per_page) if total_items > 0 else 0

    return jsonify({
        "tasks": [format_task(row) for row in task_rows],
        "pagination": {
            "total_items": total_items,
            "total_pages": total_pages,
            "current_page": page,
            "per_page": per_page,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    }), 200

@tasks_bp.route("/<int:task_id>", methods=["GET"])
@jwt_required()
def get_task(task_id):
    current_user_id = int(get_jwt_identity())
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM tasks WHERE id = %s AND user_id = %s AND is_deleted = 0",
                (task_id, current_user_id)
            )
            task = cursor.fetchone()
    finally:
        conn.close()

    if not task:
        return jsonify({"error": "Task not found"}), 404

    return jsonify(format_task(task)), 200

@tasks_bp.route("", methods=["POST"])
@jwt_required()
def create_task():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    if not data or not data.get("title"):
        return jsonify({"error": "Title is required"}), 400

    title = data["title"].strip()
    description = data.get("description", "").strip()
    status = data.get("status", "pending").strip().lower()
    priority = data.get("priority", "medium").strip().lower()

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO tasks (user_id, title, description, status, priority)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (current_user_id, title, description, status, priority)
            )
            task_id = cursor.lastrowid
            cursor.execute("SELECT * FROM tasks WHERE id = %s", (task_id,))
            new_task = cursor.fetchone()
    finally:
        conn.close()

    return jsonify(format_task(new_task)), 201

@tasks_bp.route("/<int:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM tasks WHERE id = %s AND user_id = %s AND is_deleted = 0",
                (task_id, current_user_id)
            )
            task = cursor.fetchone()

            if not task:
                return jsonify({"error": "Task not found"}), 404

            updates = []
            params = []

            if "title" in data:
                if not data["title"].strip():
                    return jsonify({"error": "Title cannot be empty"}), 400
                updates.append("title = %s")
                params.append(data["title"].strip())

            if "description" in data:
                updates.append("description = %s")
                params.append(data["description"].strip())

            if "status" in data:
                updates.append("status = %s")
                params.append(data["status"].strip().lower())

            if "priority" in data:
                updates.append("priority = %s")
                params.append(data["priority"].strip().lower())

            if updates:
                params.extend([task_id, current_user_id])
                update_sql = f"UPDATE tasks SET {', '.join(updates)} WHERE id = %s AND user_id = %s"
                cursor.execute(update_sql, tuple(params))

            cursor.execute("SELECT * FROM tasks WHERE id = %s", (task_id,))
            updated_task = cursor.fetchone()
    finally:
        conn.close()

    return jsonify(format_task(updated_task)), 200

@tasks_bp.route("/<int:task_id>", methods=["DELETE"])
@jwt_required()
def soft_delete_task(task_id):
    current_user_id = int(get_jwt_identity())
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM tasks WHERE id = %s AND user_id = %s AND is_deleted = 0",
                (task_id, current_user_id)
            )
            task = cursor.fetchone()

            if not task:
                return jsonify({"error": "Task not found"}), 404

            cursor.execute(
                "UPDATE tasks SET is_deleted = 1, deleted_at = NOW() WHERE id = %s AND user_id = %s",
                (task_id, current_user_id)
            )
    finally:
        conn.close()

    return jsonify({"message": f"Task {task_id} successfully deleted"}), 200