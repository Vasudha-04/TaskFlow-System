/**
 * TaskDetailPage.jsx
 * ==================
 * View a single task with inline editing, status toggle, and delete.
 *
 * Merges: TaskDetailPage + EditTaskPage
 * Edit mode is just a state toggle instead of a separate page.
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getTaskById, updateTask, deleteTask, formatDate, getError } from "../services/api";
import { ConfirmModal, TaskBadge } from "../components/UI";

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = window.location.pathname.endsWith("/edit");

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit form state
  const [editForm, setEditForm] = useState({ title: "", description: "", status: "pending", priority: "medium", due_date: "" });
  const [editing, setEditing] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete dialog
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Success message
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchTask();
  }, [id]);

  async function fetchTask() {
    setLoading(true);
    setError("");
    try {
      const res = await getTaskById(id);
      setTask(res.data);
      setEditForm({
        title: res.data.title,
        description: res.data.description || "",
        status: res.data.status,
        priority: res.data.priority,
        due_date: res.data.due_date ? res.data.due_date.slice(0, 10) : "",
      });
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }

  // ── Save Edits ──
  const handleSave = async () => {
    if (!editForm.title.trim()) { setEditError("Title is required."); return; }
    setEditError("");
    setSaving(true);
    try {
      const data = { ...editForm };
      if (!data.due_date) data.due_date = null;
      const res = await updateTask(id, data);
      setTask(res.data);
      setSuccessMsg("Task updated successfully!");
      setEditing(false);
      navigate(`/tasks/${id}`, { replace: true });
    } catch (err) {
      setEditError(getError(err));
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle Status ──
  const handleToggleStatus = async () => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      const res = await updateTask(id, { status: newStatus });
      setTask(res.data);
      setEditForm({ ...editForm, status: newStatus });
    } catch (err) {
      alert(getError(err));
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTask(id);
      navigate("/tasks", { replace: true });
    } catch (err) {
      alert(getError(err));
      setDeleting(false);
      setShowDelete(false);
    }
  };

  // ── Cancel Edit ──
  const handleCancelEdit = () => {
    setEditing(false);
    setEditForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ? task.due_date.slice(0, 10) : "",
    });
    navigate(`/tasks/${id}`, { replace: true });
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-100 rounded-xl animate-pulse" style={{ width: `${60 + i * 10}%` }} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Task Not Found</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link to="/tasks"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            ← Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  if (!task) return null;

  // ═══════════════════════════════════════════════
  // EDIT MODE
  // ═══════════════════════════════════════════════
  if (editing) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/tasks" className="hover:text-blue-600">My Tasks</Link>
          <span>/</span>
          <span className="text-gray-600 truncate">{task.title}</span>
          <span>/</span>
          <span className="text-gray-600">Edit</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Task</h1>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 space-y-5">
          {/* Current badges */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
            <span className="text-sm text-gray-500">Current:</span>
            <TaskBadge type="status" value={task.status} size="md" />
            <TaskBadge type="priority" value={task.priority} size="md" />
          </div>

          {editError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{editError}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
            <input name="title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea name="description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={4} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select name="status" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white appearance-none cursor-pointer">
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
              <select name="priority" value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white appearance-none cursor-pointer">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
              <input type="date" name="due_date" value={editForm.due_date}
                onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={handleCancelEdit}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // VIEW MODE (default)
  // ═══════════════════════════════════════════════
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400">
        <Link to="/tasks" className="hover:text-blue-600">My Tasks</Link>
        <span>/</span>
        <span className="text-gray-600 truncate">{task.title}</span>
      </nav>

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 animate-fade-in">{successMsg}</div>
      )}

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 lg:p-8 border-b border-gray-50">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className={`text-2xl lg:text-3xl font-bold break-words ${task.status === "completed" ? "line-through text-gray-400" : "text-gray-900"}`}>
                {task.title}
              </h1>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <TaskBadge type="status" value={task.status} size="md" />
                <TaskBadge type="priority" value={task.priority} size="md" />
                <span className="text-sm text-gray-400">Created {formatDate(task.created_at)}</span>
                {task.due_date && (
                  <span className={`text-sm ${task.is_overdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
                    {task.is_overdue ? "⚠ " : ""}Due {formatDate(task.due_date)}
                  </span>
                )}
              </div>
            </div>
            <button onClick={handleToggleStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                task.status === "completed" ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-green-600 text-white hover:bg-green-700"
              }`}>
              {task.status === "completed" ? "↩ Reopen" : "✓ Mark Complete"}
            </button>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Description</h2>
          {task.description ? (
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{task.description}</p>
          ) : (
            <p className="text-gray-400 italic">No description provided.</p>
          )}
        </div>

        {/* Metadata grid */}
        <div className="px-6 pb-6 lg:px-8 lg:pb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Status</p>
            <TaskBadge type="status" value={task.status} />
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Priority</p>
            <TaskBadge type="priority" value={task.priority} />
          </div>
          {task.due_date && (
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Due Date</p>
              <p className={`font-medium ${task.is_overdue ? "text-red-600" : "text-gray-800"}`}>
                {task.is_overdue ? "⚠ " : ""}{formatDate(task.due_date)}
              </p>
            </div>
          )}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Created</p>
            <p className="font-medium text-gray-800">{formatDate(task.created_at)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Last Updated</p>
            <p className="font-medium text-gray-800">{formatDate(task.updated_at)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 lg:px-8 lg:pb-8 flex items-center gap-3 flex-wrap border-t border-gray-50 pt-6">
          <button onClick={() => { setEditing(true); navigate(`/tasks/${id}/edit`, { replace: true }); }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            ✏ Edit Task
          </button>
          <button onClick={() => setShowDelete(true)}
            className="inline-flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            🗑 Delete Task
          </button>
          <Link to="/tasks"
            className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ml-auto">
            ← All Tasks
          </Link>
        </div>
      </div>

      <ConfirmModal isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This cannot be undone.`}
        confirmText="Delete" variant="danger" loading={deleting} />
    </div>
  );
}

