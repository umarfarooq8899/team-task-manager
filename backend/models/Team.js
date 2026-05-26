import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class Team extends Model {}

Team.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Team name cannot be empty' },
        len: {
          args: [2, 100],
          msg: 'Team name must be between 2 and 100 characters',
        },
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
  },
  {
    sequelize,
    modelName: 'Team',
    tableName: 'teams',
    timestamps: true,
  }
);

export default Team;
