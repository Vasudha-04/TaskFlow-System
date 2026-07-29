/**
 * DashboardPage.jsx
 * =================
 * Task overview dashboard with stats cards, recent tasks, and quick actions.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTasks, getTaskStats, formatDate } from "../services/api";
import { SkeletonLoader, TaskBadge, Alert } from "../components/UI";

function StatCard({ label, value, badgeBg, border, icon }) {
  return (
    <div className={`bg-white rounded-2xl border ${border || "border-gray-100"} shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all duration-200`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${badgeBg} shadow-md flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
        <p className="text-sm font-medium text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [tasksRes, statsRes] = await Promise.all([
          getTasks({ per_page: 5, sort_by: "created_at", order: "desc" }),
          getTaskStats(),
        ]);
        setTasks(tasksRes.data.tasks || []);
        setStats(statsRes.data);
        setError("");
      } catch (err) {
        setError(
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load dashboard data. Please check that the backend server is running."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = stats
    ? [
      {
        label: "Total Tasks",
        value: stats.total,
        badgeBg: "bg-blue-500 text-white shadow-blue-200",
        border: "border-blue-100 hover:border-blue-300",
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
      },
      {
        label: "Pending",
        value: stats.pending,
        badgeBg: "bg-amber-500 text-white shadow-amber-200",
        border: "border-amber-100 hover:border-amber-300",
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        label: "In Progress",
        value: stats.in_progress,
        badgeBg: "bg-indigo-500 text-white shadow-indigo-200",
        border: "border-indigo-100 hover:border-indigo-300",
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
      },
      {
        label: "Completed",
        value: stats.completed,
        badgeBg: "bg-emerald-500 text-white shadow-emerald-200",
        border: "border-emerald-100 hover:border-emerald-300",
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        label: "High Priority",
        value: stats.high_priority,
        badgeBg: "bg-rose-500 text-white shadow-rose-200",
        border: "border-rose-100 hover:border-rose-300",
        icon: (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
      },
    ]
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📊 Task Dashboard</h1>
        <p className="text-gray-500 mt-1">Here's a snapshot of your tasks.</p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <SkeletonLoader variant="stat-card" count={5} />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}

      {/* Error Alert */}
      {error && <Alert type="error" message={error} onClose={() => setError("")} />}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/tasks/create"
          className="flex items-center gap-4 bg-blue-600 text-white rounded-2xl p-5 hover:bg-blue-700 transition-all shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">➕</span>
            <div>
              <p className="font-semibold">Create Task</p>
              <p className="text-sm text-blue-100">Add a new task to your list</p>
            </div>
          </div>
        </Link>
        <Link to="/tasks"
          className="flex items-center gap-4 bg-white border border-gray-200 text-gray-700 rounded-2xl p-5 hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-semibold">View All Tasks</p>
              <p className="text-sm text-gray-500">Browse and manage your tasks</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Recent Tasks</h2>
          <Link to="/tasks" className="text-sm text-blue-600 hover:underline font-medium">View all →</Link>
        </div>

        {loading ? (
          <div className="p-6"><SkeletonLoader variant="table-row" count={4} /></div>
        ) : tasks.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-5xl mb-4">📝</p>
            <p className="text-gray-500 font-medium">No tasks yet</p>
            <p className="text-sm text-gray-400 mb-6">Create your first task to get started!</p>
            <Link to="/tasks/create"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
              Create Task
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {tasks.map((task) => (
              <Link key={task.id} to={`/tasks/${task.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(task.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <TaskBadge type="priority" value={task.priority} />
                  <TaskBadge type="status" value={task.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {stats && stats.total > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-4 flex-wrap justify-between">
            <div>
              <p className="font-semibold text-gray-900">Task Progress</p>
              <p className="text-sm text-gray-500">{stats.completed} of {stats.total} tasks completed</p>
            </div>
            <div className="w-full sm:w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${(stats.completed / stats.total) * 100}%` }} />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {Math.round((stats.completed / stats.total) * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

