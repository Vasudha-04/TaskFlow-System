"""
app.py
======
TaskFlow Backend — Flask API for Task Management.

  - Task CRUD (create, read, update, soft delete)
  - Search, filter, sort, pagination
  - Due date support & overdue detection
  - Dashboard stats

Run it with: python app.py
"""
import math

from flask import Flask, request, jsonify
from flask_cors import CORS

from config import Config
from database import get_db
from utils import serialize_task
from models import build_task_filters, build_task_update


# ═══════════════════════════════════════════════
# 1. APP FACTORY
# ═══════════════════════════════════════════════

def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)

    # ── Configuration ──
    app.config["SECRET_KEY"] = Config.SECRET_KEY

    # ── Extensions ──
    CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}})

    # ── Health Check ──
    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "healthy", "message": "TaskFlow API is running!"})

    # ═══════════════════════════════════════════════
    # 2. TASK ROUTES  (/api/tasks/*)
    # ═══════════════════════════════════════════════

    @app.route("/api/tasks", methods=["GET"])
    def get_tasks():
        """List tasks with search, filter, sort, and pagination."""
        # Parse query params
        page = max(request.args.get("page", 1, type=int), 1)
        per_page = min(max(request.args.get("per_page", 10, type=int), 1), 100)

        filters = {
            "search": request.args.get("search", ""),
            "status": request.args.get("status", ""),
            "priority": request.args.get("priority", ""),
            "sort_by": request.args.get("sort_by", "created_at"),
            "order": request.args.get("order", "desc"),
            "overdue": request.args.get("overdue", ""),
        }

        where_clause, query_params, sort_clause = build_task_filters(filters)
        offset = (page - 1) * per_page

        db = get_db()
        try:
            with db.cursor() as cursor:
                # Count total
                cursor.execute(
                    f"SELECT COUNT(*) AS total FROM tasks t WHERE {where_clause}",
                    tuple(query_params),
                )
                total_items = cursor.fetchone()["total"]

                # Fetch page
                cursor.execute(
                    f"SELECT t.* FROM tasks t WHERE {where_clause} {sort_clause} LIMIT %s OFFSET %s",
                    tuple(query_params + [per_page, offset]),
                )
                task_rows = cursor.fetchall()
        finally:
            db.close()

        total_pages = math.ceil(total_items / per_page) if total_items > 0 else 0

        return jsonify({
            "tasks": [serialize_task(row) for row in task_rows],
            "pagination": {
                "total_items": total_items,
                "total_pages": total_pages,
                "current_page": page,
                "per_page": per_page,
                "has_next": page < total_pages,
                "has_prev": page > 1,
            },
        }), 200

    @app.route("/api/tasks/<int:task_id>", methods=["GET"])
    def get_task(task_id):
        """Get a single task by ID."""
        db = get_db()
        try:
            with db.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM tasks WHERE id = %s AND is_deleted = 0",
                    (task_id,),
                )
                task = cursor.fetchone()
        finally:
            db.close()

        if not task:
            return jsonify({"error": "Task not found"}), 404
        return jsonify(serialize_task(task)), 200

    @app.route("/api/tasks", methods=["POST"])
    def create_task():
        """Create a new task."""
        data = request.get_json() or {}

        title = (data.get("title") or "").strip()
        if not title:
            return jsonify({"error": "Title is required"}), 400

        description = (data.get("description") or "").strip()
        status = (data.get("status") or "pending").strip().lower()
        priority = (data.get("priority") or "medium").strip().lower()
        due_date = data.get("due_date")  # ISO string or None
        # Convert empty string to None — MySQL rejects '' for DATETIME columns
        if due_date is not None and str(due_date).strip() == "":
            due_date = None

        db = get_db()
        try:
            with db.cursor() as cursor:
                cursor.execute(
                    """INSERT INTO tasks (title, description, status, priority, due_date)
                       VALUES (%s, %s, %s, %s, %s)""",
                    (title, description, status, priority, due_date),
                )
                cursor.execute("SELECT * FROM tasks WHERE id = %s", (cursor.lastrowid,))
                new_task = cursor.fetchone()
        finally:
            db.close()

        return jsonify(serialize_task(new_task)), 201

    @app.route("/api/tasks/<int:task_id>", methods=["PUT"])
    def update_task(task_id):
        """Update an existing task (partial update — only provided fields change)."""
        data = request.get_json() or {}

        db = get_db()
        try:
            with db.cursor() as cursor:
                # Check task exists
                cursor.execute(
                    "SELECT * FROM tasks WHERE id = %s AND is_deleted = 0",
                    (task_id,),
                )
                if not cursor.fetchone():
                    return jsonify({"error": "Task not found"}), 404

                # Build dynamic update
                update_sql, update_params = build_task_update(task_id, data)
                if update_sql and update_params:
                    cursor.execute(update_sql, tuple(update_params))

                cursor.execute("SELECT * FROM tasks WHERE id = %s", (task_id,))
                updated_task = cursor.fetchone()
        finally:
            db.close()

        return jsonify(serialize_task(updated_task)), 200

    @app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
    def soft_delete_task(task_id):
        """Soft delete a task (marks is_deleted = 1 instead of removing it)."""
        db = get_db()
        try:
            with db.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM tasks WHERE id = %s AND is_deleted = 0",
                    (task_id,),
                )
                if not cursor.fetchone():
                    return jsonify({"error": "Task not found"}), 404

                cursor.execute(
                    "UPDATE tasks SET is_deleted = 1, deleted_at = NOW() WHERE id = %s",
                    (task_id,),
                )
        finally:
            db.close()

        return jsonify({"message": f"Task {task_id} successfully deleted"}), 200

    # ── Global Error Handler ──
    @app.errorhandler(Exception)
    def handle_exception(e):
        """Global exception handler returning clean JSON responses on server errors."""
        app.logger.error(f"Unhandled Server Error: {str(e)}", exc_info=True)
        return jsonify({
            "error": str(e) if app.config.get("DEBUG") else "Internal Server Error"
        }), 500

    # ── Stats endpoint (used by dashboard) ──
    @app.route("/api/tasks/stats", methods=["GET"])
    def task_stats():
        """Return task statistics for the dashboard."""
        db = get_db()
        try:
            with db.cursor() as cursor:
                cursor.execute("""
                    SELECT
                        COUNT(*) AS total,
                        COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) AS pending,
                        COALESCE(SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END), 0) AS in_progress,
                        COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) AS completed,
                        COALESCE(SUM(CASE WHEN priority = 'high' AND status != 'completed' THEN 1 ELSE 0 END), 0) AS `high_priority`,
                        COALESCE(SUM(CASE WHEN due_date IS NOT NULL AND due_date < NOW() AND status != 'completed' THEN 1 ELSE 0 END), 0) AS overdue
                    FROM tasks
                    WHERE is_deleted = 0
                """)
                stats = cursor.fetchone() or {}
        finally:
            db.close()

        return jsonify({
            "total": int(stats.get("total") or 0),
            "pending": int(stats.get("pending") or 0),
            "in_progress": int(stats.get("in_progress") or 0),
            "completed": int(stats.get("completed") or 0),
            "high_priority": int(stats.get("high_priority") or 0),
            "overdue": int(stats.get("overdue") or 0),
        }), 200

    return app


# ═══════════════════════════════════════════════
# 3. ENTRY POINT
# ═══════════════════════════════════════════════

if __name__ == "__main__":
    app = create_app()
    print(f"[+] TaskFlow API running at http://{Config.HOST}:{Config.PORT}")
    print(f"[+] API Health check: http://{Config.HOST}:{Config.PORT}/health")
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)

