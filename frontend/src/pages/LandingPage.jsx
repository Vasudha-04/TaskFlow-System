import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col justify-between">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-4 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className="text-lg font-bold">TaskFlow</span>
        </div>
        <Link to="/dashboard"
          className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-md shadow-blue-500/20">
          Go to Dashboard
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-2 pb-6 text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3.5 py-1 text-xs text-blue-300 mb-3">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          Simple. Fast. Powerful.
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-3 bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
          Manage Tasks Like a Pro
        </h1>

        <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto mb-5">
          TaskFlow helps you create, organize, and track your tasks with beautiful dashboards,
          smart filters, and real-time updates — all in one place.
        </p>

        <Link to="/dashboard"
          className="inline-block bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5">
          Go to Dashboard →
        </Link>
      </section>

      {/* Feature Cards */}
      <section className="max-w-6xl w-full mx-auto px-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: '🎯',
              title: 'Smart Filtering',
              desc: 'Filter tasks by status, priority, or search by keyword instantly.',
            },
            {
              icon: '📊',
              title: 'Live Dashboard',
              desc: 'Get an overview of all your tasks — pending, in-progress, and done.',
            },
            {
              icon: '⚡',
              title: 'Fast & Simple',
              desc: 'No authentication needed — just open and start managing your tasks.',
            },
          ].map((f) => (
            <div key={f.title}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-gray-400 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 text-center py-2.5 text-gray-500 text-xs">
        © {new Date().getFullYear()} TaskFlow. Built with Flask + React.
      </footer>
    </div>
  );
}
