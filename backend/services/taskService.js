import { Task, Team, TeamMember, User } from '../models/index.js';
import { Op } from 'sequelize';

// Helper: Check if user is a member of the team
async function checkTeamMembership(userId, teamId) {
  const membership = await TeamMember.findOne({
    where: { userId, teamId },
  });
  return !!membership;
}

// Helper: Fetch task with assignee and team populated
async function getTaskByIdPopulated(taskId) {
  return Task.findByPk(taskId, {
    include: [
      {
        model: User,
        as: 'assignee',
        attributes: ['id', 'name', 'email'],
      },
      {
        model: Team,
        as: 'team',
        attributes: ['id', 'name'],
      },
    ],
  });
}

export const createTask = async (taskData, userId) => {
  const { teamId, assignedTo } = taskData;

  // 1. Verify requester is a member of the team
  const isMember = await checkTeamMembership(userId, teamId);
  if (!isMember) {
    const error = new Error('Access denied. You are not a member of this team.');
    error.status = 403;
    throw error;
  }

  // 2. Verify assignee is a member of the team (if assignedTo is specified)
  if (assignedTo) {
    const isAssigneeMember = await checkTeamMembership(assignedTo, teamId);
    if (!isAssigneeMember) {
      const error = new Error('Assignee must be a member of the team.');
      error.status = 400;
      throw error;
    }
  }

  const task = await Task.create(taskData);
  return getTaskByIdPopulated(task.id);
};

export const getTasks = async (filters, userId) => {
  const { teamId, assignedTo, status } = filters;

  // Find all teams requester belongs to
  const memberships = await TeamMember.findAll({
    where: { userId },
    attributes: ['teamId'],
  });
  const userTeamIds = memberships.map((m) => m.teamId);

  if (userTeamIds.length === 0) {
    return [];
  }

  const whereClause = {};

  // Team filtering
  if (teamId) {
    if (!userTeamIds.includes(teamId)) {
      const error = new Error('Access denied. You are not a member of the requested team.');
      error.status = 403;
      throw error;
    }
    whereClause.teamId = teamId;
  } else {
    whereClause.teamId = {
      [Op.in]: userTeamIds,
    };
  }

  // Assignee filtering
  if (assignedTo) {
    whereClause.assignedTo = assignedTo;
  }

  // Status filtering
  if (status) {
    whereClause.status = status;
  }

  return Task.findAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'assignee',
        attributes: ['id', 'name', 'email'],
      },
      {
        model: Team,
        as: 'team',
        attributes: ['id', 'name'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
};

export const getTaskById = async (taskId, userId) => {
  const task = await getTaskByIdPopulated(taskId);

  if (!task) {
    const error = new Error('Task not found.');
    error.status = 404;
    throw error;
  }

  // Verify requester has access to the task's team
  const isMember = await checkTeamMembership(userId, task.teamId);
  if (!isMember) {
    const error = new Error('Access denied. You are not a member of this team.');
    error.status = 403;
    throw error;
  }

  return task;
};

export const updateTask = async (taskId, updateData, userId) => {
  const task = await Task.findByPk(taskId);

  if (!task) {
    const error = new Error('Task not found.');
    error.status = 404;
    throw error;
  }

  // Verify requester has access to task's team
  const isMember = await checkTeamMembership(userId, task.teamId);
  if (!isMember) {
    const error = new Error('Access denied. You are not a member of this team.');
    error.status = 403;
    throw error;
  }

  // Verify new assignee is a member of the task's team (if assignedTo is changing)
  if (updateData.assignedTo !== undefined) {
    if (updateData.assignedTo !== null) {
      const isAssigneeMember = await checkTeamMembership(updateData.assignedTo, task.teamId);
      if (!isAssigneeMember) {
        const error = new Error('Assignee must be a member of the team.');
        error.status = 400;
        throw error;
      }
    }
  }

  await task.update(updateData);
  return getTaskByIdPopulated(taskId);
};

export const deleteTask = async (taskId, userId) => {
  const task = await Task.findByPk(taskId);

  if (!task) {
    const error = new Error('Task not found.');
    error.status = 404;
    throw error;
  }

  // Verify requester has access to the task's team
  const isMember = await checkTeamMembership(userId, task.teamId);
  if (!isMember) {
    const error = new Error('Access denied. You are not a member of this team.');
    error.status = 403;
    throw error;
  }

  await task.destroy();
  return { message: 'Task deleted successfully.' };
};
