// src/models/sale.model.ts
import { Model, DataTypes, Sequelize, NonAttribute } from 'sequelize';
import { Parent } from './parent.model';
import { Plan } from './plan.model';

export class Sale extends Model {
  public id!: string;
  public parentId!: string;
  public planId!: string;
  public unitId!: string;
  public startMonth!: Date;
  public endMonth!: Date;
  public totalAmount!: number;

  public parent?: NonAttribute<Parent>;
  public plan?: NonAttribute<Plan>;

  public static associate(models: any) {
    Sale.belongsTo(models.Parent, {
      foreignKey: 'parentId',
      as: 'parent',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    Sale.belongsTo(models.Plan, {
      foreignKey: 'planId',
      as: 'plan',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    Sale.hasMany(models.Invoice, {
      foreignKey: 'saleId',
      as: 'invoices',
    });

    Sale.belongsTo(models.Unit, {
      foreignKey: 'unitId',
      as: 'unit',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }

  public static initModel(sequelize: Sequelize): typeof Sale {
    Sale.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        parentId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        planId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        unitId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        startMonth: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        endMonth: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        totalAmount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'sales',
        timestamps: true,
      },
    );

    return Sale;
  }
}
