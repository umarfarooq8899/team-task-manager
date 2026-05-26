import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as teamsApi from '../api/teams';
import * as tasksApi from '../api/tasks';
import Sidebar from '../components/Sidebar';
import TeamModal from '../components/TeamModal';
import TaskModal from '../components/TaskModal';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Data States
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  // UI Control States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Modals States
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [teamModalMode, setTeamModalMode] = useState('create'); // 'create' | 'invite'
  const [inviteTargetTeam, setInviteTargetTeam] = useState(null);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalEditTask, setTaskModalEditTask] = useState(null); // null for create, task object for edit

  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // ─── Fetch Data ─────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const [fetchedTeams, fetchedTasks] = await Promise.all([
        teamsApi.getTeams(),
        tasksApi.getTasks(),
      ]);
      setTeams(fetchedTeams);
      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset filters when selected team changes
  useEffect(() => {
    setAssigneeFilter('all');
    setStatusFilter('all');
  }, [selectedTeam]);

  // ─── Logout Handlers ────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  // ─── Team Handlers ──────────────────────────────────────────────────────────
  const handleOpenCreateTeam = () => {
    setTeamModalMode('create');
    setInviteTargetTeam(null);
    setModalError('');
    setTeamModalOpen(true);
  };

  const handleOpenInviteMember = (team) => {
    setTeamModalMode('invite');
    setInviteTargetTeam(team);
    setModalError('');
    setTeamModalOpen(true);
  };

  const handleCreateTeamSubmit = async (name) => {
    setActionLoading(true);
    setModalError('');
    try {
      const newTeam = await teamsApi.createTeam(name);
      // Fetch full teams list to get populated owner/members
      const updatedTeams = await teamsApi.getTeams();
      setTeams(updatedTeams);
      setSelectedTeam(newTeam); // Auto-select new team
      setTeamModalOpen(false);
    } catch (err) {
      const errMsg = err.response?.data?.errors?.join(', ') || err.response?.data?.message || err.message;
      setModalError(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleInviteMemberSubmit = async (teamId, email) => {
    setActionLoading(true);
    setModalError('');
    try {
      await teamsApi.addTeamMember(teamId, { email });
      // Refresh teams data to update member lists
      const updatedTeams = await teamsApi.getTeams();
      setTeams(updatedTeams);
      setTeamModalOpen(false);
    } catch (err) {
      const errMsg = err.response?.data?.errors?.join(', ') || err.response?.data?.message || err.message;
      setModalError(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Task Handlers ──────────────────────────────────────────────────────────
  const handleOpenCreateTask = () => {
    setTaskModalEditTask(null);
    setModalError('');
    setTaskModalOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setTaskModalEditTask(task);
    setModalError('');
    setTaskModalOpen(true);
  };

  const handleTaskSubmit = async (taskData) => {
    setActionLoading(true);
    setModalError('');
    try {
      if (taskModalEditTask) {
        // Edit mode (note that teamId is omitted or read-only on backend during update)
        const { teamId, ...updatePayload } = taskData;
        await tasksApi.updateTask(taskModalEditTask.id, updatePayload);
      } else {
        // Create mode
        await tasksApi.createTask(taskData);
      }
      // Refresh tasks
      const updatedTasks = await tasksApi.getTasks();
      setTasks(updatedTasks);
      setTaskModalOpen(false);
    } catch (err) {
      const errMsg = err.response?.data?.errors?.join(', ') || err.response?.data?.message || err.message;
      setModalError(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await tasksApi.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      alert(err.response?.data?.message || 'Error deleting task.');
    }
  };

  // ─── Client-side Search and Filters ─────────────────────────────────────────
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Team filtering
      if (selectedTeam && task.teamId !== selectedTeam.id) {
        return false;
      }

      // 2. Search query (matches title or description)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title?.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) {
          return false;
        }
      }

      // 3. Status filter
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }

      // 4. Assignee filter
      if (assigneeFilter !== 'all') {
        if (assigneeFilter === 'unassigned') {
          return !task.assignedTo;
        } else if (assigneeFilter === 'me') {
          return task.assignedTo === user?.id;
        } else if (assigneeFilter === 'others') {
          return task.assignedTo && task.assignedTo !== user?.id;
        } else {
          return task.assignedTo === assigneeFilter;
        }
      }

      return true;
    });
  }, [tasks, selectedTeam, searchQuery, statusFilter, assigneeFilter, user]);

  // Calculate statistics based on unfiltered tasks, but restricted to the active team if selected
  const stats = useMemo(() => {
    const activeTasks = selectedTeam
      ? tasks.filter((t) => t.teamId === selectedTeam.id)
      : tasks;

    return {
      total: activeTasks.length,
      pending: activeTasks.filter((t) => t.status === 'pending').length,
      inProgress: activeTasks.filter((t) => t.status === 'in_progress').length,
      completed: activeTasks.filter((t) => t.status === 'completed').length,
    };
  }, [tasks, selectedTeam]);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      {/* Sidebar Component */}
      <Sidebar
        teams={teams}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        onOpenTeamModal={handleOpenCreateTeam}
        onOpenInviteModal={handleOpenInviteMember}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        user={user}
        handleLogout={handleLogout}
        loggingOut={loggingOut}
      />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/40 px-6 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-sm font-semibold text-white truncate">
              {selectedTeam ? `${selectedTeam.name} Dashboard` : 'My Task Board'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Add Task Button */}
            <button
              onClick={handleOpenCreateTask}
              disabled={teams.length === 0}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              title={teams.length === 0 ? 'Create a team first before adding tasks' : 'Create new task'}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-6 max-w-6xl w-full mx-auto space-y-6">
          {/* Welcome Announcement / Team banner */}
          {selectedTeam ? (
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 shadow-xl">
              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{selectedTeam.name}</h3>
                  <p className="text-xs text-slate-400">
                    Created by <span className="font-semibold text-slate-300">{selectedTeam.owner?.name}</span> •{' '}
                    {selectedTeam.members?.length} Members
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenInviteMember(selectedTeam)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200"
                  >
                    <svg className="h-3.5 w-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                    Invite User
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-indigo-900 to-violet-950 p-6 shadow-xl">
              <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 bg-white/5 rounded-full blur-xl" />
              <div className="relative">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Personal Workspace</span>
                <h3 className="text-lg font-bold text-white mt-1">Hello, {user?.name} 👋</h3>
                <p className="text-xs text-indigo-200 max-w-md mt-1">
                  Manage tasks across all your collaborating teams, search descriptions, and filter assignees.
                </p>
              </div>
            </div>
          )}

          {/* Statistics Grid */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Tasks', value: stats.total, color: 'text-indigo-400', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2' },
              { label: 'Pending', value: stats.pending, color: 'text-amber-400', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
              { label: 'In Progress', value: stats.inProgress, color: 'text-blue-400', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              { label: 'Completed', value: stats.completed, color: 'text-emerald-400', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            ].map((card) => (
              <div key={card.label} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-md">
                <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/60">
                  <svg className={`h-5 w-5 ${card.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-black text-white">{card.value}</h4>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{card.label}</p>
                </div>
              </div>
            ))}
          </section>

          {/* Filtering Panel */}
          <section className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-3.5 items-center shadow-md">
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <svg className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks by title or description..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-200 text-xs font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Dropdowns Container */}
            <div className="flex w-full md:w-auto items-center gap-3.5">
              {/* Status Filter */}
              <div className="flex-1 md:flex-initial">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-hidden transition-all duration-200"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Assignee Filter */}
              <div className="flex-1 md:flex-initial">
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-hidden transition-all duration-200"
                >
                  <option value="all">All Assignees</option>
                  <option value="unassigned">Unassigned Only</option>
                  <option value="me">Assigned to Me</option>
                  <option value="others">Assigned to Others</option>
                  {selectedTeam && selectedTeam.members && selectedTeam.members.length > 0 && (
                    <optgroup label="Team Members">
                      {selectedTeam.members.map((m) => (
                        <option key={m.user?.id} value={m.user?.id}>
                          {m.user?.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            </div>
          </section>

          {/* Content Loading & Listing Area */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3.5">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
              <p className="text-xs text-slate-500">Loading task board...</p>
            </div>
          ) : teams.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-10 text-center shadow-lg">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-5">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-base mb-1.5">No teams found</h3>
              <p className="text-slate-400 text-xs max-w-sm mx-auto mb-6">
                You need to create a team before managing tasks. Set up a team and invite members to collaborate!
              </p>
              <button
                onClick={handleOpenCreateTeam}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/15 hover:bg-indigo-500 transition-all duration-200"
              >
                Create Your First Team
              </button>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-12 text-center shadow-md">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/60 text-slate-500 mb-5">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-sm mb-1.5">No tasks found</h3>
              <p className="text-slate-400 text-xs max-w-xs mx-auto mb-5">
                There are no tasks matching your selected filters. Create a new task to get started!
              </p>
              <button
                onClick={handleOpenCreateTask}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-all duration-200"
              >
                Create Task
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTasks.map((task) => {
                // Determine due date display style and check if overdue
                const hasDueDate = !!task.dueDate;
                const formattedDueDate = hasDueDate
                  ? new Date(task.dueDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })
                  : '';
                const isOverdue =
                  hasDueDate &&
                  task.status !== 'completed' &&
                  new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

                return (
                  <article
                    key={task.id}
                    className="flex flex-col rounded-2xl border border-slate-800/60 bg-slate-900 p-5 shadow-sm hover:border-slate-700/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {/* Card Header (Labels & Actions) */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      {/* Team Tag */}
                      <span className="rounded-md bg-slate-800 px-2.5 py-0.75 text-[10px] font-bold text-slate-400">
                        {task.team?.name}
                      </span>

                      {/* Edit / Delete Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditTask(task)}
                          className="rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200"
                          title="Edit Task"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-red-400 transition-all duration-200"
                          title="Delete Task"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Task details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white leading-snug line-clamp-2 mb-1.5">{task.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3 mb-4">
                        {task.description || <span className="italic text-slate-600">No description provided.</span>}
                      </p>
                    </div>

                    {/* Card Footer (Status, Date & Assignee) */}
                    <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                      {/* Status & Due Date */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
                            task.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : task.status === 'in_progress'
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {task.status?.replace('_', ' ')}
                        </span>

                        {/* Due Date Indicator */}
                        {hasDueDate && (
                          <span
                            className={`flex items-center gap-1 text-[10px] font-semibold ${
                              isOverdue ? 'text-red-400' : 'text-slate-500'
                            }`}
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formattedDueDate}
                          </span>
                        )}
                      </div>

                      {/* Assignee Avatar Badge */}
                      <div className="flex items-center">
                        {task.assignee ? (
                          <div
                            className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-black text-white cursor-pointer shadow-sm border border-slate-900"
                            title={`Assigned to ${task.assignee.name} (${task.assignee.email})`}
                          >
                            {task.assignee.name?.charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <div
                            className="flex h-6.5 w-6.5 items-center justify-center rounded-full border border-dashed border-slate-700 bg-slate-800/40 text-[10px] text-slate-500"
                            title="Unassigned"
                          >
                            —
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Team Modal (Create Team & Invite Member) */}
      <TeamModal
        isOpen={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
        mode={teamModalMode}
        team={inviteTargetTeam}
        onSubmitCreate={handleCreateTeamSubmit}
        onSubmitInvite={handleInviteMemberSubmit}
        loading={actionLoading}
        error={modalError}
      />

      {/* Task Modal (Create Task & Edit Task) */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        task={taskModalEditTask}
        teams={teams}
        selectedTeam={selectedTeam}
        onSubmit={handleTaskSubmit}
        loading={actionLoading}
        error={modalError}
      />
    </div>
  );
};

export default Dashboard;
