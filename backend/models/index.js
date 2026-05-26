import sequelize from '../config/db.js';
import User from './User.js';
import Team from './Team.js';
import TeamMember from './TeamMember.js';
import Task from './Task.js';

// ─── Associations ──────────────────────────────────────────────────────────────

// A User can create many Teams
User.hasMany(Team, { foreignKey: 'createdBy', as: 'ownedTeams' });
Team.belongsTo(User, { foreignKey: 'createdBy', as: 'owner' });

// A Team has many TeamMembers; deleting a Team cascades to its members
Team.hasMany(TeamMember, {
  foreignKey: 'teamId',
  as: 'members',
  onDelete: 'CASCADE',
});
TeamMember.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// A User has many TeamMember rows (i.e. can be in many teams)
User.hasMany(TeamMember, {
  foreignKey: 'userId',
  as: 'teamMemberships',
  onDelete: 'CASCADE',
});
TeamMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Many-to-many shortcut: User <-> Team through TeamMember
User.belongsToMany(Team, {
  through: TeamMember,
  foreignKey: 'userId',
  otherKey: 'teamId',
  as: 'teams',
});
Team.belongsToMany(User, {
  through: TeamMember,
  foreignKey: 'teamId',
  otherKey: 'userId',
  as: 'users',
});

// A Team has many Tasks; deleting a Team cascades to its Tasks
Team.hasMany(Task, {
  foreignKey: 'teamId',
  as: 'tasks',
  onDelete: 'CASCADE',
});
Task.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// A User has many assigned Tasks; deleting a User nullifies assignee
User.hasMany(Task, {
  foreignKey: 'assignedTo',
  as: 'assignedTasks',
  onDelete: 'SET NULL',
});
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

// A User can create many Tasks; deleting a User cascades to delete their Tasks
User.hasMany(Task, {
  foreignKey: 'createdBy',
  as: 'createdTasks',
  onDelete: 'CASCADE',
});
Task.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });


// ─── Export ────────────────────────────────────────────────────────────────────

const db = {
  sequelize,
  User,
  Team,
  TeamMember,
  Task,
};

export { sequelize, User, Team, TeamMember, Task };
export default db;
