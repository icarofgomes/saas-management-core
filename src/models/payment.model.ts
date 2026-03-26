import { Model, DataTypes, Sequelize, NonAttribute } from 'sequelize';
import { Invoice } from './invoice.model';

export class Payment extends Model {
  public id!: string;
  public invoiceId!: string;
  public provider!: string;
  public externalId?: string | null;

  public status!: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled';

  public amount!: number;
  public attempt!: number;
  public errorMessage?: string | null;
  public metadata?: Record<string, any> | null;

  public invoice?: NonAttribute<Invoice>;

  public static associate(models: any) {
    Payment.belongsTo(models.Invoice, {
      foreignKey: 'invoiceId',
      as: 'invoice',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }

  public static initModel(sequelize: Sequelize): typeof Payment {
    Payment.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },

        invoiceId: {
          type: DataTypes.UUID,
          allowNull: false,
        },

        provider: {
          type: DataTypes.STRING,
          allowNull: false,
        },

        externalId: {
          type: DataTypes.STRING,
          allowNull: true,
        },

        status: {
          type: DataTypes.ENUM(
            'pending',
            'processing',
            'paid',
            'failed',
            'cancelled',
          ),
          allowNull: false,
          defaultValue: 'pending',
        },

        amount: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },

        attempt: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },

        errorMessage: {
          type: DataTypes.TEXT,
          allowNull: true,
        },

        metadata: {
          type: DataTypes.JSON,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'payments',
        timestamps: true,
      },
    );

    return Payment;
  }
}
