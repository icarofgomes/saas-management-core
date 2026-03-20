import {
  Model,
  Sequelize,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';

export class Address extends Model<
  InferAttributes<Address>,
  InferCreationAttributes<Address>
> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<string> | null;

  declare street: string;
  declare number: number;
  declare complement: string | null;
  declare neighborhood: string;
  declare city: string;
  declare zip: string;
  declare acronym: string;
  declare country: string;

  // associations
  static associate(models: any) {
    Address.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }

  static initModel(sequelize: Sequelize): typeof Address {
    Address.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        street: { type: DataTypes.STRING, allowNull: false },
        number: { type: DataTypes.INTEGER, allowNull: false },
        complement: { type: DataTypes.STRING, allowNull: true },
        neighborhood: { type: DataTypes.STRING, allowNull: false },
        city: { type: DataTypes.STRING, allowNull: false },
        zip: { type: DataTypes.STRING, allowNull: false },
        acronym: { type: DataTypes.STRING, allowNull: false },
        country: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'Brasil',
        },
      },
      {
        sequelize,
        tableName: 'addresses',
      },
    );
    return Address;
  }
}
