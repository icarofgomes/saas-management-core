// unit.model.ts
import { Model, DataTypes, Sequelize } from 'sequelize';

export class Unit extends Model {
  public id!: string;
  public name!: string;
  public slug!: string;
  public userId!: string;
  public maxRooms!: number;

  public static associate(models: any) {
    Unit.hasMany(models.Student, {
      foreignKey: 'unitId',
      as: 'students',
      onDelete: 'CASCADE',
    });

    Unit.hasMany(models.Parent, {
      foreignKey: 'unitId',
      as: 'parents',
      onDelete: 'CASCADE',
    });

    Unit.hasMany(models.Teacher, {
      foreignKey: 'unitId',
      as: 'teachers',
      onDelete: 'CASCADE',
    });

    Unit.hasMany(models.Room, {
      foreignKey: 'unitId',
      as: 'rooms',
      onDelete: 'CASCADE',
    });

    Unit.hasMany(models.Schedule, {
      foreignKey: 'unitId',
      as: 'schedules',
      onDelete: 'CASCADE',
    });

    Unit.hasMany(models.Sale, {
      foreignKey: 'unitId',
      as: 'sales',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    Unit.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }

  public static initModel(sequelize: Sequelize): typeof Unit {
    Unit.init(
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
        slug: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        maxRooms: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 3,
        },
      },
      {
        sequelize,
        tableName: 'units',
        timestamps: true,
      },
    );
    return Unit;
  }
}
