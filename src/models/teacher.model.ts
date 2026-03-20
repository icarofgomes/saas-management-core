// src/models/teacher.model.ts
import {
  Model,
  DataTypes,
  Sequelize,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyGetAssociationsMixin,
} from 'sequelize';
import { Subject } from './subject.model';

export class Teacher extends Model {
  public id!: string;
  public firstName!: string;
  public lastName!: string;
  public balance!: number;
  public userId!: string;
  public unitId!: string;
  public subjects?: Subject[];

  public getSubjects!: BelongsToManyGetAssociationsMixin<Subject>;
  public setSubjects!: BelongsToManyAddAssociationsMixin<Subject, number>;

  public static associate(models: any) {
    Teacher.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Teacher.belongsTo(models.Unit, { foreignKey: 'unitId', as: 'unit' });

    Teacher.belongsToMany(models.Subject, {
      through: 'teacher_subjects',
      foreignKey: 'teacherId',
      otherKey: 'subjectId',
      as: 'subjects',
    });

    Teacher.hasMany(models.Lesson, {
      foreignKey: 'teacherId',
      as: 'lessons',
      onDelete: 'SET NULL',
    });
  }

  public static initModel(sequelize: Sequelize): typeof Teacher {
    Teacher.init(
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
        tableName: 'teachers',
        timestamps: true,
      },
    );

    return Teacher;
  }
}
