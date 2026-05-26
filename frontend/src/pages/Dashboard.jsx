import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-white font-semibold text-sm">Team Task Manager</span>
          </div>

          <div className="flex items-center gap-3">
            {/* User pill */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-slate-300 text-xs font-medium">{user?.name}</span>
            </div>

            <button
              id="logout-btn"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600
                text-slate-300 hover:text-white text-xs font-medium px-3 py-2 rounded-xl transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loggingOut ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Welcome Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-700 p-8 mb-8 shadow-xl shadow-indigo-500/20">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          </div>
          <div className="relative">
            <p className="text-indigo-200 text-sm font-medium mb-1">Welcome back 👋</p>
            <h1 className="text-3xl font-bold text-white mb-2">{user?.name}</h1>
            <p className="text-indigo-200 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Tasks', value: '0', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'text-indigo-400' },
            { label: 'In Progress', value: '0', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-amber-400' },
            { label: 'Completed', value: '0', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-emerald-400' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4">
              <div className={`p-2.5 rounded-xl bg-slate-700/50`}>
                <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-slate-400 text-xs">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Placeholder Tasks Area */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-700/50 mb-4">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M12 12h.01M8 12h.01M16 12h.01" />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-1">No tasks yet</h3>
          <p className="text-slate-400 text-sm">Task management features will be added here.</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
