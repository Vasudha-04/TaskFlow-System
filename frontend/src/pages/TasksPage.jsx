/**
 * TasksPage.jsx
 * =============
 * Task list with search, filter, sort, pagination, and inline create modal.
 *
 * Merges: TasksPage + CreateTaskPage
 * The create form appears as a modal overlay.
 */
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getTasks, createTask, deleteTask, updateTask, formatDate, getError } from "../services/api";
import { SkeletonLoader, EmptyState, TaskBadge, ConfirmModal, Pagination, Alert } from "../components/UI";

const STATUSES = ["", "pending", "in_progress", "completed"];
const PRIORITIES = ["", "low", "medium", "high"];

export default function TasksPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isCreateMode = location.pathname === "/tasks/create";

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);

  // Create modal state
  const [createForm, setCreateForm] = useState({ title: "", description: "", status: "pending", priority: "medium", due_date: "" });
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Success/Error messages
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getTasks({ search, status, priority, sort_by: sortBy, order, page, per_page: 10 });
      setTasks(res.data.tasks);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, sortBy, order, page]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, status, priority, sortBy, order]);
  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── Create Task ──
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.title.trim()) { setCreateError("Title is required."); return; }
    setCreateError("");
    setCreating(true);
    try {
      const data = { ...createForm };
      if (!data.due_date) delete data.due_date;
      await createTask(data);
      setSuccessMsg("Task created successfully!");
      setCreateForm({ title: "", description: "", status: "pending", priority: "medium", due_date: "" });
      navigate("/tasks", { replace: true });
      fetchTasks();
    } catch (err) {
      setCreateError(getError(err));
    } finally {
      setCreating(false);
    }
  };

  // ── Delete Task ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTask(deleteTarget.id);
      setSuccessMsg(`Task "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      fetchTasks();
    } catch (err) {
      setErrorMsg(getError(err));
    } finally {
      setDeleting(false);
    }
  };

  // ── Mark Complete ──
  const handleMarkComplete = async (task) => {
    try {
      await updateTask(task.id, { status: "completed" });
      setSuccessMsg(`"${task.title}" marked complete.`);
      fetchTasks();
    } catch (err) {
      setErrorMsg(getError(err));
    }
  };

  // ── Clear Filters ──
  const hasFilters = search || status || priority;
  const clearFilters = () => { setSearch(""); setStatus(""); setPriority(""); setSortBy("created_at"); setOrder("desc"); };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-sm text-gray-500 mt-0.5">{pagination.total_items ?? 0} task{pagination.total_items !== 1 ? "s" : ""}</p>
      </div>

      {/* Messages */}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg("")} />}
      {errorMsg && <Alert type="error" message={errorMsg} onClose={() => setErrorMsg("")} />}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-52 relative">
          <input type="text" placeholder="Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
          )}
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
          {STATUSES.map((s) => <option key={s} value={s}>{s || "All Statuses"}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer">
          {PRIORITIES.map((p) => <option key={p} value={p}>{p || "All Priorities"}</option>)}
        </select>
      </div>

      {/* Active filter tags */}
      {hasFilters && !loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Filters:</span>
          {search && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg">"{search}"</span>}
          {status && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg">{status}</span>}
          {priority && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg">{priority}</span>}
          <button onClick={clearFilters} className="text-blue-600 hover:underline ml-2">Clear all</button>
        </div>
      )}

      {error && <Alert type="error" message={error} onClose={() => setError("")} />}

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6"><SkeletonLoader variant="table-row" count={5} /></div>
        ) : tasks.length === 0 ? (
          hasFilters ? (
            <EmptyState icon="🔍" title="No matching tasks" message="Try adjusting your search or filter criteria."
              action={{ to: "/tasks/create", label: "Create New Task" }} />
          ) : (
            <EmptyState icon="📝" title="No tasks yet" message="Get started by creating your first task."
              action={{ to: "/tasks/create", label: "Create Your First Task" }} />
          )
        ) : (
          <div className="divide-y divide-gray-50">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group">
                <button onClick={() => handleMarkComplete(task)} disabled={task.status === "completed"}
                  title="Mark as complete"
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    task.status === "completed" ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-green-400"
                  }`}>
                  {task.status === "completed" && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <Link to={`/tasks/${task.id}`}
                    className={`font-medium hover:text-blue-600 transition-colors block truncate ${
                      task.status === "completed" ? "line-through text-gray-400" : "text-gray-800"
                    }`}>
                    {task.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{formatDate(task.created_at)}</span>
                    {task.is_overdue && <span className="text-xs text-red-500 font-medium">⚠ Overdue</span>}
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                  <TaskBadge type="priority" value={task.priority} />
                  <TaskBadge type="status" value={task.status} />
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <Link to={`/tasks/${task.id}/edit`}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                  <button onClick={() => setDeleteTarget(task)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />

      {/* Delete Confirmation */}
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Task"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.title}"?` : ""}
        confirmText="Delete" variant="danger" loading={deleting} />

      {/* ═══════════════════════════════════════
          CREATE TASK MODAL
          ═══════════════════════════════════════ */}
      {isCreateMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in"
          onClick={() => navigate("/tasks", { replace: true })}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Fill in the details below.</p>
                </div>
                <button onClick={() => navigate("/tasks", { replace: true })}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {createError && <Alert type="error" message={createError} onClose={() => setCreateError("")} />}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                  <input name="title" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    required placeholder="e.g. Write project report" autoFocus
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea name="description" value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    rows={3} placeholder="Optional notes or details…"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                    <select name="status" value={createForm.status}
                      onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white">
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                    <select name="priority" value={createForm.priority}
                      onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
                    <input type="date" name="due_date" value={createForm.due_date}
                      onChange={(e) => setCreateForm({ ...createForm, due_date: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => navigate("/tasks", { replace: true })}
                    className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={creating}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                    {creating ? "Creating…" : "Create Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

