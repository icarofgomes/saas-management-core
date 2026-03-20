import { Model, DataTypes, Sequelize } from 'sequelize';

export class TeacherSubject extends Model {
  public teacherId!: string;
  public subjectId!: number;

  public static initModel(sequelize: Sequelize): typeof TeacherSubject {
    TeacherSubject.init(
      {
        teacherId: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
        },
        subjectId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
      },
      {
        sequelize,
        tableName: 'teacher_subjects',
        timestamps: true,
      },
    );

    return TeacherSubject;
  }
}
