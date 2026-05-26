import { Team, Task } from '../models/index.js';

export const ensureTeamCreator = async (req, res, next) => {
  const teamId = req.params.id || req.body.teamId;

  if (!teamId) {
    return res.status(400).json({ message: 'Team ID is required for authorization.' });
  }

  try {
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    if (team.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. Only the team creator can perform this action.' });
    }

    req.team = team; // attach team to request object for downstream controllers
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error during authorization.', error: error.message });
  }
};

export const ensureTaskEditor = async (req, res, next) => {
  const taskId = req.params.id;

  if (!taskId) {
    return res.status(400).json({ message: 'Task ID is required for authorization.' });
  }

  try {
    const task = await Task.findByPk(taskId, {
      include: [{ model: Team, as: 'team' }]
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Check if user is creator of task, assignee of task, or owner of the team
    const isCreator = task.createdBy === req.user.id;
    const isAssignee = task.assignedTo === req.user.id;
    const isTeamOwner = task.team?.createdBy === req.user.id;

    if (!isCreator && !isAssignee && !isTeamOwner) {
      return res.status(403).json({ message: 'Access denied. You do not have permission to edit this task.' });
    }

    req.task = task; // attach task for downstream controllers
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error during authorization.', error: error.message });
  }
};
