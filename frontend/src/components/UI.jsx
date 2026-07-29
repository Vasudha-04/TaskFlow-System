/**
 * UI.jsx
 * ======
 * ALL reusable UI components in one file for simplicity.
 *
 * Includes:
 *   - LoadingSpinner  (full-page or inline spinner)
 *   - SkeletonLoader  (placeholder loading animations)
 *   - EmptyState      (empty list placeholder)
 *   - TaskBadge       (status & priority badges)
 *   - ConfirmModal    (confirmation dialog)
 *   - Pagination      (page navigation)
 *   - Alert           (dismissible notifications)
 */
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { statusStyle, priorityStyle } from "../services/api";

// ═══════════════════════════════════════════════
// 1. LoadingSpinner
// ═══════════════════════════════════════════════

export function LoadingSpinner({ size = "md", text, fullPage }) {
  const sizes = { sm: "w-5 h-5 border-2", md: "w-8 h-8 border-[3px]", lg: "w-12 h-12 border-4" };
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} rounded-full border-blue-200 border-t-blue-600 animate-spin`} />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
  return fullPage ? <div className="min-h-screen flex items-center justify-center bg-slate-50">{spinner}</div> : spinner;
}

// ═══════════════════════════════════════════════
// 2. SkeletonLoader
// ═══════════════════════════════════════════════

function Skeleton({ className }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />;
}

function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-6 w-32 rounded-full" />
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function SkeletonLoader({ variant = "table-row", count = 1 }) {
  const Comp = variant === "stat-card" ? StatCardSkeleton : TableRowSkeleton;
  return Array.from({ length: count }, (_, i) => <Comp key={i} />);
}

// ═══════════════════════════════════════════════
// 3. EmptyState
// ═══════════════════════════════════════════════

export function EmptyState({ icon = "📭", title = "Nothing here yet", message, action }) {
  return (
    <div className="py-16 text-center animate-fade-in">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      {message && <p className="text-sm text-gray-500 mb-6">{message}</p>}
      {action && (
        <Link
          to={action.to}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// 4. TaskBadge (Status + Priority)
// ═══════════════════════════════════════════════

export function TaskBadge({ type = "status", value, size = "sm" }) {
  const config = type === "priority" ? priorityStyle(value) : statusStyle(value);
  const sz = size === "md" ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sz} ${config.bg} ${config.text}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

// ═══════════════════════════════════════════════
// 5. ConfirmModal
// ═══════════════════════════════════════════════

export function ConfirmModal({ isOpen, onClose, onConfirm, title = "Are you sure?", message, confirmText = "Confirm", cancelText = "Cancel", variant = "danger", loading = false }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => { if (isOpen && cancelRef.current) cancelRef.current.focus(); }, [isOpen]);

  if (!isOpen) return null;

  const danger = variant === "danger";
  const btnBg = danger ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700";
  const iconBg = danger ? "bg-red-100" : "bg-orange-100";
  const iconColor = danger ? "text-red-600" : "text-orange-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className={`w-14 h-14 mx-auto mb-4 ${iconBg} rounded-full flex items-center justify-center`}>
            <svg className={`w-7 h-7 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={danger ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          {message && <p className="text-sm text-gray-500 mb-6">{message}</p>}
          <div className="flex gap-3">
            <button ref={cancelRef} onClick={onClose} disabled={loading}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50">
              {cancelText}
            </button>
            <button onClick={onConfirm} disabled={loading}
              className={`flex-1 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-60 ${btnBg}`}>
              {loading ? `${confirmText}…` : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 6. Pagination
// ═══════════════════════════════════════════════

export function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.total_pages <= 1) return null;

  const { current_page, total_pages, total_items, has_next, has_prev } = pagination;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-gray-500">
        Page {current_page} of {total_pages} <span className="text-gray-400 ml-1">({total_items} tasks)</span>
      </p>
      <div className="flex items-center gap-2">
        <button onClick={() => onPageChange(current_page - 1)} disabled={!has_prev}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          ← Previous
        </button>
        <div className="hidden sm:flex items-center gap-1">
          {generatePages(current_page, total_pages).map((n, i) =>
            n === "..." ? (
              <span key={`e${i}`} className="px-2 text-gray-400">…</span>
            ) : (
              <button key={n} onClick={() => onPageChange(n)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${n === current_page ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
                {n}
              </button>
            )
          )}
        </div>
        <button onClick={() => onPageChange(current_page + 1)} disabled={!has_next}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Next →
        </button>
      </div>
    </div>
  );
}

function generatePages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

// ═══════════════════════════════════════════════
// 7. Alert
// ═══════════════════════════════════════════════

export function Alert({ type = "info", message, onClose, autoDismiss = true, duration = 5000 }) {
  useEffect(() => {
    if (!autoDismiss || !onClose || !message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [autoDismiss, duration, onClose, message]);

  if (!message) return null;

  const configs = {
    success: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
    error: { bg: "bg-red-50", border: "border-red-200", text: "text-red-600" },
    warning: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
    info: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  };
  const c = configs[type] || configs.info;

  return (
    <div className={`flex items-start gap-3 p-4 ${c.bg} border ${c.border} rounded-xl text-sm ${c.text} animate-fade-in`} role="alert">
      <div className="flex-1">{message}</div>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 p-0.5 rounded hover:bg-black/5 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

