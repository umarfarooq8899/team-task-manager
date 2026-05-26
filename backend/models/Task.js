import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class Task extends Model {}

Task.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Task title cannot be empty' },
        len: {
          args: [3, 255],
          msg: 'Task title must be between 3 and 255 characters',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: {
          args: [['pending', 'in_progress', 'completed']],
          msg: 'Status must be pending, in_progress, or completed',
        },
      },
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: 'Due date must be a valid date' },
      },
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    teamId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'teams',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'tasks',
    timestamps: true,
  }
);

export default Task;
