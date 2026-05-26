import React, { useState, useEffect } from 'react';

const TaskModal = ({
  isOpen,
  onClose,
  task, // If provided, we are in edit mode
  teams, // List of teams to select from
  selectedTeam, // Pre-selected team from dashboard filter
  onSubmit,
  loading,
  error,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [dueDate, setDueDate] = useState('');
  const [teamId, setTeamId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [localError, setLocalError] = useState('');

  // 1. Initial State Sync
  useEffect(() => {
    if (isOpen) {
      setLocalError('');
      if (task) {
        setTitle(task.title || '');
        setDescription(task.description || '');
        setStatus(task.status || 'pending');
        setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
        setTeamId(task.teamId || '');
        setAssignedTo(task.assignedTo || '');
      } else {
        setTitle('');
        setDescription('');
        setStatus('pending');
        setDueDate('');
        setTeamId(selectedTeam?.id || (teams.length > 0 ? teams[0].id : ''));
        setAssignedTo('');
      }
    }
  }, [isOpen, task, selectedTeam, teams]);

  // 2. Derive team members dynamically based on the selected teamId
  const currentTeam = teams.find((t) => t.id === teamId);
  const teamMembers = currentTeam?.members?.map((m) => m.user) || [];

  // Reset assignee if they do not belong to the selected team (when team selection changes)
  useEffect(() => {
    if (teamId && teamMembers.length > 0) {
      const isAssigneeInTeam = teamMembers.some((member) => member.id === assignedTo);
      if (!isAssigneeInTeam && assignedTo !== '') {
        setAssignedTo('');
      }
    }
  }, [teamId, teamMembers, assignedTo]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    if (title.trim().length < 3) {
      setLocalError('Task title must be at least 3 characters.');
      return;
    }
    if (!teamId) {
      setLocalError('Please select a team.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      status,
      dueDate: dueDate || null,
      assignedTo: assignedTo || null,
      teamId,
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-slate-950/50">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="text-sm font-semibold text-white">
            {task ? 'Edit Task' : 'Create New Task'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Display Errors */}
          {(localError || error) && (
            <div className="rounded-xl bg-red-950/30 border border-red-900/50 px-4 py-3 text-xs text-red-400">
              {localError || error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label htmlFor="taskTitle" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Task Title
            </label>
            <input
              id="taskTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design Landing Page, Setup CI/CD"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden transition-all duration-200"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="taskDesc" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Description
            </label>
            <textarea
              id="taskDesc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of the task..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden transition-all duration-200 resize-none"
            />
          </div>

          {/* Two-Column Form Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Team Selection (only active/changeable when creating) */}
            <div className="space-y-1">
              <label htmlFor="taskTeam" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Team
              </label>
              <select
                id="taskTeam"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                disabled={!!task}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                required
              >
                <option value="" disabled>Select a team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Assignee Selection (populates based on members of selected teamId) */}
            <div className="space-y-1">
              <label htmlFor="taskAssignee" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Assignee
              </label>
              <select
                id="taskAssignee"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                disabled={!teamId}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>{member.name} ({member.email})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Two-Column Form Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-1">
              <label htmlFor="taskStatus" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Status
              </label>
              <select
                id="taskStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden transition-all duration-200"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <label htmlFor="taskDueDate" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Due Date
              </label>
              <input
                id="taskDueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden transition-all duration-200"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
