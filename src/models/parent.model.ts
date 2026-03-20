// src/models/parent.model.ts
import { Model, DataTypes, Sequelize, NonAttribute } from 'sequelize';
import { Student } from './student.model';

export class Parent extends Model {
  public id!: string;
  public firstName!: string;
  public lastName!: string;
  public balance!: number;
  public userId!: string;
  public unitId!: string;
  public students?: NonAttribute<Student[]>;

  public static associate(models: any) {
    Parent.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Parent.belongsTo(models.Unit, { foreignKey: 'unitId', as: 'unit' });
    Parent.hasMany(models.Student, {
      foreignKey: 'parentId',
      as: 'students',
      onDelete: 'CASCADE',
    });
    Parent.hasMany(models.Invoice, {
      foreignKey: 'parentId',
      as: 'invoices',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }

  public static initModel(sequelize: Sequelize): typeof Parent {
    Parent.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        firstName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        lastName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        balance: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        unitId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'parents',
        timestamps: true,
      },
    );

    return Parent;
  }
}
