import sequelize from '../config/db.js';
import User from './User.js';

// Setup associations here in the future
// e.g. User.hasMany(Task);

const db = {
  sequelize,
  User,
};

export { sequelize, User };
export default db;
