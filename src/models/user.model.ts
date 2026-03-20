// user.model.ts
import { Model, DataTypes, Sequelize } from 'sequelize';

export class User extends Model {
  public id!: string;
  public phoneNumber!: string;
  public password!: string;
  public cpf!: string;
  public email!: string;
  public roleId!: number;
  public emailVerified!: boolean;
  public isActive!: boolean;
  public failedLoginAttempts!: number;
  public lastFailedLoginAt!: Date | null;

  public static associate(models: any) {
    User.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role' });

    User.hasMany(models.UserToken, {
      foreignKey: 'user_id',
      as: 'tokens',
      onDelete: 'CASCADE',
    });

    User.hasMany(models.Address, {
      foreignKey: 'userId',
      as: 'addresses',
      onDelete: 'CASCADE',
    });

    User.hasMany(models.Student, {
      foreignKey: 'userId',
      as: 'students',
      onDelete: 'CASCADE',
    });

    User.hasOne(models.Parent, {
      foreignKey: 'userId',
      as: 'parent',
      onDelete: 'CASCADE',
    });

    User.hasOne(models.Teacher, {
      foreignKey: 'userId',
      as: 'teacher',
      onDelete: 'CASCADE',
    });

    User.hasOne(models.Unit, {
      foreignKey: 'userId',
      as: 'unit',
    });
  }

  public static initModel(sequelize: Sequelize): typeof User {
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        phoneNumber: DataTypes.STRING,
        password: DataTypes.STRING,
        cpf: DataTypes.STRING,
        email: DataTypes.STRING,
        roleId: DataTypes.INTEGER,
        emailVerified: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        failedLoginAttempts: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'failed_login_attempts',
        },
        lastFailedLoginAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'last_failed_login_at',
        },
      },
      {
        sequelize,
        tableName: 'users',
      },
    );
    return User;
  }
}
