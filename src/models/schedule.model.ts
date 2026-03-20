import { Model, DataTypes, Sequelize } from 'sequelize';

export class Schedule extends Model {
  public id!: string;
  public unitId!: string;
  public roomId!: string;
  public startDateTime!: Date;
  public endDateTime!: Date;

  public static associate(models: any) {
    Schedule.belongsTo(models.Unit, {
      foreignKey: 'unitId',
      as: 'unit',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    Schedule.belongsTo(models.Room, {
      foreignKey: 'roomId',
      as: 'room',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    Schedule.hasMany(models.Lesson, {
      foreignKey: 'scheduleId',
      as: 'lessons',
      onDelete: 'CASCADE',
    });
  }

  public static initModel(sequelize: Sequelize): typeof Schedule {
    Schedule.init(
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        unitId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        roomId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        startDateTime: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        endDateTime: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'schedules',
        timestamps: true,
      },
    );

    return Schedule;
  }
}
