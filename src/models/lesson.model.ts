// src/models/lesson.model.ts
import { Model, DataTypes, Sequelize, NonAttribute } from 'sequelize';
import { Schedule } from './schedule.model';

export class Lesson extends Model {
  public id!: string;
  public subjectId!: number;
  public teacherId!: number | null;
  public scheduleId!: string;

  public schedule?: NonAttribute<Schedule>;

  public static associate(models: any) {
    Lesson.belongsTo(models.Subject, {
      foreignKey: 'subjectId',
      as: 'subject',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    Lesson.belongsTo(models.Teacher, {
      foreignKey: 'teacherId',
      as: 'teacher',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    Lesson.belongsTo(models.Schedule, {
      foreignKey: 'scheduleId',
      as: 'schedule',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    Lesson.belongsToMany(models.Student, {
      through: models.LessonStudent,
      foreignKey: 'lessonId',
      otherKey: 'studentId',
      as: 'students',
    });
  }

  public static initModel(sequelize: Sequelize): typeof Lesson {
    Lesson.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        subjectId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        teacherId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        scheduleId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'lessons',
        timestamps: true,
      },
    );

    return Lesson;
  }
}
