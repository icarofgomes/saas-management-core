// role.model.ts
import { Model, DataTypes, Sequelize } from 'sequelize';

export class Role extends Model {
  public id!: number;
  public role!: string;

  public static associate(models: any) {
    Role.hasMany(models.User, { foreignKey: 'roleId', as: 'users' });
  }

  public static initModel(sequelize: Sequelize): typeof Role {
    Role.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        role: DataTypes.STRING,
      },
      {
        sequelize,
        tableName: 'roles',
      },
    );
    return Role;
  }
}
