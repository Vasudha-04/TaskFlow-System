/**
 * frontend/src/services/api.js
 * =============================
 * Single file for ALL API communication and helper utilities.
 *
 * Combines:
 *   - Axios instance (base URL)
 *   - Tasks API calls
 *   - Helper functions (date formatting, error handling, config mappers)
 */
import axios from "axios";

// ═══════════════════════════════════════════════
// 1. AXIOS INSTANCE
// ═══════════════════════════════════════════════

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000, // 15 seconds — prevents hanging requests
});

// ── Global response interceptor ──
// Logs network errors to console and re-throws so callers can handle them.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error("[API] Request timed out");
    } else if (!error.response) {
      console.error("[API] Network error — no response received:", error.message);
    }
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════
// 2. TASKS API CALLS
// ═══════════════════════════════════════════════

export const getTasks = (params) => api.get("/tasks", { params });
export const getTaskById = (id) => api.get(`/tasks/${id}`);
export const createTask = (data) => api.post("/tasks", data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const getTaskStats = () => api.get("/tasks/stats");

// ═══════════════════════════════════════════════
// 4. HELPER FUNCTIONS
// ═══════════════════════════════════════════════

/** Format an ISO date string to a human-readable form. */
export function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Truncate a long string with ellipsis. */
export function truncate(str, maxLen = 60) {
  if (!str) return "";
  return str.length > maxLen ? str.slice(0, maxLen) + "..." : str;
}

/** Extract a friendly error message from an Axios error. */
export function getError(err) {
  if (err?.response?.data?.error) {
    return err.response.data.error;
  }
  if (err?.response?.data?.message) {
    return err.response.data.message;
  }
  if (!err?.response || err?.response?.status === 500) {
    return "Cannot connect to backend server. Make sure Python backend ('python app.py') is running on port 5000.";
  }
  return err?.message || "Something went wrong. Please try again.";
}

/** Status display config for TaskBadge styling. */
export function statusStyle(status) {
  const map = {
    pending: { label: "Pending", bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-400" },
    in_progress: { label: "In Progress", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-400" },
    completed: { label: "Completed", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-400" },
  };
  return map[status] || { label: status, bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
}

/** Priority display config for TaskBadge styling. */
export function priorityStyle(priority) {
  const map = {
    low: { label: "Low", bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
    medium: { label: "Medium", bg: "bg-orange-100", text: "text-orange-600", dot: "bg-orange-400" },
    high: { label: "High", bg: "bg-red-100", text: "text-red-600", dot: "bg-red-400" },
  };
  return map[priority] || { label: priority, bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
}

export default api;

