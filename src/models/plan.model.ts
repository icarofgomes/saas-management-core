// src/models/plan.model.ts
import { Model, DataTypes, Sequelize } from 'sequelize';

export class Plan extends Model {
  public id!: string;
  public name!: string;
  public price!: number;
  public description?: string;

  public static associate(models: any) {
    Plan.hasMany(models.Sale, {
      foreignKey: 'planId',
      as: 'sales',
    });
  }

  public static initModel(sequelize: Sequelize): typeof Plan {
    Plan.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'plans',
        timestamps: true,
      },
    );

    return Plan;
  }
}
