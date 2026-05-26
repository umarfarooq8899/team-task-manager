import React, { useState, useEffect } from 'react';

const TeamModal = ({
  isOpen,
  onClose,
  mode, // 'create' or 'invite'
  team, // team object for invite mode
  onSubmitCreate,
  onSubmitInvite,
  loading,
  error,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState('');

  // Clear fields on open/close
  useEffect(() => {
    setName('');
    setEmail('');
    setLocalError('');
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    if (mode === 'create') {
      if (name.trim().length < 2) {
        setLocalError('Team name must be at least 2 characters long.');
        return;
      }
      onSubmitCreate(name.trim());
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRegex.test(email.trim())) {
        setLocalError('Please enter a valid email address.');
        return;
      }
      onSubmitInvite(team.id, email.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-slate-950/50">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="text-sm font-semibold text-white">
            {mode === 'create' ? 'Create a New Team' : `Invite to ${team?.name}`}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Display Errors */}
          {(localError || error) && (
            <div className="mb-4 rounded-xl bg-red-950/30 border border-red-900/50 px-4 py-3 text-xs text-red-400">
              {localError || error}
            </div>
          )}

          {mode === 'create' ? (
            <div className="space-y-1">
              <label htmlFor="teamName" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Team Name
              </label>
              <input
                id="teamName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Frontend Development, Marketing"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden transition-all duration-200"
                required
                autoFocus
              />
            </div>
          ) : (
            <div className="space-y-1">
              <label htmlFor="inviteEmail" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                User Email Address
              </label>
              <input
                id="inviteEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@example.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden transition-all duration-200"
                required
                autoFocus
              />
              <p className="text-[10px] text-slate-500 mt-1.5">
                The user must already have a registered account in Team Task Manager.
              </p>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading && <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />}
              {mode === 'create' ? 'Create Team' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamModal;
