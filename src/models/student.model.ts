import { Model, DataTypes, Sequelize, NonAttribute } from 'sequelize';
import { Lesson } from './lesson.model';

export class Student extends Model {
  public id!: string;
  public firstName!: string;
  public lastName!: string;
  public school!: string | null;
  public grade!: number | null;
  public cycle!: string | null;
  public birthdate!: Date;
  public userId!: string | null;
  public parentId!: string;
  public unitId!: string;

  public lessons?: NonAttribute<Lesson[]>;

  public static associate(models: any) {
    Student.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Student.belongsTo(models.Parent, { foreignKey: 'parentId', as: 'parent' });
    Student.belongsTo(models.Unit, { foreignKey: 'unitId', as: 'unit' });
    Student.belongsToMany(models.Lesson, {
      through: models.LessonStudent,
      foreignKey: 'studentId',
      otherKey: 'lessonId',
      as: 'lessons',
    });
  }

  public static initModel(sequelize: Sequelize): typeof Student {
    Student.init(
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
        school: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        grade: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        cycle: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        birthdate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        parentId: {
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
        tableName: 'students',
        timestamps: true,
      },
    );

    return Student;
  }
}
