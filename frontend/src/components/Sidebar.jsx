import React from 'react';

const Sidebar = ({
  teams,
  selectedTeam,
  setSelectedTeam,
  onOpenTeamModal,
  onOpenInviteModal,
  isOpen,
  setIsOpen,
  user,
  handleLogout,
  loggingOut,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-45 flex w-72 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20">
              <svg className="h-4.5 w-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white tracking-wide">Team Task Manager</span>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {/* Main Views */}
          <div className="space-y-1">
            <button
              onClick={() => {
                setSelectedTeam(null);
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-medium transition-all duration-200 ${
                selectedTeam === null
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              All My Tasks
            </button>
          </div>

          {/* Teams Header */}
          <div className="mt-8 mb-3 flex items-center justify-between px-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">My Teams</span>
            <button
              onClick={onOpenTeamModal}
              className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-indigo-400 transition-all duration-200"
              title="Create new team"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Teams List */}
          <div className="space-y-1">
            {teams.length === 0 ? (
              <div className="px-4 py-3 text-[11px] text-slate-500 italic">No teams yet. Click the + button above to create one.</div>
            ) : (
              teams.map((team) => {
                const isSelected = selectedTeam?.id === team.id;
                return (
                  <div
                    key={team.id}
                    className={`group flex items-center justify-between rounded-xl px-4 py-2 text-xs transition-all duration-200 ${
                      isSelected
                        ? 'bg-slate-800 text-white font-medium border border-slate-700/50'
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedTeam(team);
                        setIsOpen(false);
                      }}
                      className="flex-1 text-left truncate py-1"
                    >
                      {team.name}
                    </button>

                    {/* Invite Button - visible on hover or if selected */}
                    <button
                      onClick={() => onOpenInviteModal(team)}
                      className={`ml-2 rounded p-1 hover:bg-slate-700/80 hover:text-indigo-400 transition-all duration-200 ${
                        isSelected ? 'text-slate-400' : 'opacity-0 group-hover:opacity-100 text-slate-500'
                      }`}
                      title="Invite member"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* User profile footer */}
        <div className="border-t border-slate-800 p-4 bg-slate-950/20">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 text-sm font-bold text-white shadow-md">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold text-white">{user?.name}</p>
              <p className="truncate text-[10px] text-slate-500">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 text-center text-xs font-medium text-slate-400 transition-all duration-200 hover:border-red-950 hover:bg-red-950/20 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loggingOut ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-500/20 border-t-red-500" />
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            )}
            Log out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
