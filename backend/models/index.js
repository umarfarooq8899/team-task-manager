import sequelize from '../config/db.js';
import User from './User.js';
import Team from './Team.js';
import TeamMember from './TeamMember.js';

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

// ─── Export ────────────────────────────────────────────────────────────────────

const db = {
  sequelize,
  User,
  Team,
  TeamMember,
};

export { sequelize, User, Team, TeamMember };
export default db;
