import {
  Model,
  DataTypes,
  Sequelize,
  BelongsToManyGetAssociationsMixin,
} from 'sequelize';
import { Teacher } from './teacher.model';

export class Subject extends Model {
  public id!: number;
  public subject!: string;

  public teachers?: Teacher[];

  public getTeachers!: BelongsToManyGetAssociationsMixin<Teacher>;

  public static associate(models: any) {
    Subject.belongsToMany(models.Teacher, {
      through: 'teacher_subjects',
      foreignKey: 'subjectId',
      otherKey: 'teacherId',
      as: 'teachers',
    });

    Subject.hasMany(models.Lesson, {
      foreignKey: 'subjectId',
      as: 'lessons',
      onDelete: 'CASCADE',
    });
  }

  public static initModel(sequelize: Sequelize): typeof Subject {
    Subject.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        subject: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'subjects',
      },
    );
    return Subject;
  }
}
