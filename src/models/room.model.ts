// src/models/room.model.ts
import { Model, DataTypes, Sequelize } from 'sequelize';

export class Room extends Model {
  public id!: string;
  public name!: string;
  public unitId!: string;
  public capacity!: number;

  public static associate(models: any) {
    Room.belongsTo(models.Unit, {
      foreignKey: 'unitId',
      as: 'unit',
      onDelete: 'CASCADE',
    });

    Room.hasMany(models.Schedule, {
      foreignKey: 'roomId',
      as: 'schedules',
      onDelete: 'CASCADE',
    });
  }

  public static initModel(sequelize: Sequelize): typeof Room {
    Room.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        unitId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        capacity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 3,
        },
      },
      {
        sequelize,
        tableName: 'rooms',
        timestamps: true,
      },
    );

    return Room;
  }
}
