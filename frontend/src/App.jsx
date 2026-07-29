/**
 * App.jsx
 * =======
 * The ROOT component of the application.
 *
 * Routes:
 *   - Landing (/) — landing page
 *   - Dashboard (/dashboard) — task overview with stats
 *   - Tasks (/tasks) — task list with search/filter/pagination
 *   - Create Task (/tasks/create) — create task modal
 *   - Task Detail (/tasks/:id) — view a single task
 *   - Edit Task (/tasks/:id/edit) — edit a task
 *   - 404 (*) — not found page
 */
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ── Lazy-loaded pages (code-split for smaller initial bundle) ──
const LandingPage = lazy(() => import("./pages/LandingPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
const TaskDetailPage = lazy(() => import("./pages/TaskDetailPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// ── Layouts ──
const DashboardLayout = lazy(() => import("./components/DashboardLayout"));

// ═══════════════════════════════════════════════
// FULL-PAGE LOADER
// ═══════════════════════════════════════════════

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
    </div>
  );
}

// ═══════════════════════════════════════════════
// APP COMPONENT
// ═══════════════════════════════════════════════

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public landing */}
          <Route path="/" element={<LandingPage />} />

          {/* App pages with sidebar layout */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/tasks/create" element={<TasksPage />} />
            <Route path="/tasks/:id" element={<TaskDetailPage />} />
            <Route path="/tasks/:id/edit" element={<TaskDetailPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

