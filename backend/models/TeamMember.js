import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';

class TeamMember extends Model {}

TeamMember.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    teamId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'teams',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    role: {
      type: DataTypes.ENUM('admin', 'member'),
      defaultValue: 'member',
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'TeamMember',
    tableName: 'team_members',
    timestamps: true,
    indexes: [
      {
        // Prevent a user from joining the same team twice
        unique: true,
        fields: ['teamId', 'userId'],
        name: 'unique_team_user',
      },
    ],
  }
);

export default TeamMember;
