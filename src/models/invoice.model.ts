import { Model, DataTypes, Sequelize, NonAttribute } from 'sequelize';
import { Parent } from './parent.model';
import { Sale } from './sale.model';

export class Invoice extends Model {
  public id!: string;
  public saleId!: string;
  public parentId!: string;
  public month!: string; // YYYY-MM-DD string, DATEONLY
  public amount!: number;
  public status!: 'pending' | 'paid' | 'overdue';
  public dueDate!: string;
  public paidDate?: string | null;

  public parent?: NonAttribute<Parent>;
  public sale?: NonAttribute<Sale>;

  public static associate(models: any) {
    Invoice.belongsTo(models.Parent, {
      foreignKey: 'parentId',
      as: 'parent',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    Invoice.belongsTo(models.Sale, {
      foreignKey: 'saleId',
      as: 'sale',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    Invoice.hasMany(models.Payment, {
      foreignKey: 'invoiceId',
      as: 'payments',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }

  public static initModel(sequelize: Sequelize): typeof Invoice {
    Invoice.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        saleId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        parentId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        month: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        amount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('pending', 'paid', 'overdue'),
          allowNull: false,
          defaultValue: 'pending',
        },
        dueDate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        paidDate: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'invoices',
        timestamps: true,
      },
    );

    return Invoice;
  }
}
