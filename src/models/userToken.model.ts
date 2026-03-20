import { Model, DataTypes, Sequelize } from 'sequelize';

export class UserToken extends Model {
  public id!: number;
  public user_id!: string; // mesmo tipo do user.id (UUID)
  public token!: string;
  public type!: 'email_verification' | 'password_reset';
  public expires_at!: Date;
  public used_at!: Date | null;
  public last_resend_at!: Date | null;
  public createdAt!: Date | null;
  public resend_count!: number;

  public static associate(models: any) {
    UserToken.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE',
    });
  }

  public static initModel(sequelize: Sequelize): typeof UserToken {
    UserToken.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        token: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        type: {
          type: DataTypes.ENUM('email_verification', 'password_reset'),
          allowNull: false,
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        used_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        resend_count: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        last_resend_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'UserToken',
        tableName: 'user_tokens',
        underscored: true,
        timestamps: true,
      },
    );
    return UserToken;
  }
}
