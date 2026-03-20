import { Model, DataTypes, Sequelize } from 'sequelize';

export class LessonStudent extends Model {
  public lessonId!: string;
  public studentId!: string;

  public static initModel(sequelize: Sequelize): typeof LessonStudent {
    LessonStudent.init(
      {
        lessonId: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
        },
        studentId: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
        },
      },
      {
        sequelize,
        tableName: 'lesson_students',
        timestamps: true,
      },
    );

    return LessonStudent;
  }
}
