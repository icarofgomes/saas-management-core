import models from '../models';
import { Transaction, Op, Includeable } from 'sequelize';
export class LessonRepository {
  async create(
    data: {
      subjectId: number;
      teacherId?: string | null;
      scheduleId: string;
    },
    transaction?: Transaction,
  ) {
    return models.Lesson.create(data, { transaction });
  }

  async findById(id: string, options?: { includeSchedule?: boolean }) {
    const include = [];

    if (options?.includeSchedule) {
      include.push({
        model: models.Schedule,
        as: 'schedule',
      });
    }

    return models.Lesson.findByPk(id, { include });
  }

  async assignTeacher(
    lessonId: string,
    teacherId: string,
    transaction?: Transaction,
  ) {
    return models.Lesson.update(
      { teacherId },
      { where: { id: lessonId }, transaction },
    );
  }

  async hasOverlappingLessonForTeacher(
    teacherId: string,
    start: Date,
    end: Date,
    ignoreLessonId?: string,
  ) {
    return models.Lesson.findOne({
      where: {
        teacherId,
        id: ignoreLessonId ? { [Op.ne]: ignoreLessonId } : undefined,
      },
      include: [
        {
          model: models.Schedule,
          as: 'schedule',
          where: {
            startDateTime: { [Op.lt]: end },
            endDateTime: { [Op.gt]: start },
          },
        },
      ],
    });
  }

  async findLessonsByParentUserId(userId: string) {
    const include: Includeable[] = [
      {
        model: models.Student,
        as: 'students',
        attributes: ['id', 'firstName', 'lastName'],
        include: [
          {
            model: models.Lesson,
            as: 'lessons',
            attributes: {
              exclude: [
                'createdAt',
                'updatedAt',
                'subjectId',
                'scheduleId', // <- corrigido aqui
                'teacherId',
              ],
            },
            through: { attributes: [] },
            include: [
              {
                model: models.Subject,
                as: 'subject',
                attributes: { exclude: ['createdAt', 'updatedAt'] },
              },
              {
                model: models.Schedule,
                as: 'schedule',
                attributes: ['startDateTime'],
              },
              {
                model: models.Teacher,
                as: 'teacher',
                attributes: ['id', 'firstName', 'lastName'],
              },
            ],
          },
        ],
      },
    ];

    const parent = await models.Parent.findOne({
      where: { userId },
      include,
    });

    if (!parent) return null;

    // Agora retorna um array onde cada entrada tem aula + aluno
    const lessonsWithStudent = [];

    for (const student of parent.students ?? []) {
      for (const lesson of student.lessons ?? []) {
        const plainLesson = lesson.get({ plain: true });

        lessonsWithStudent.push({
          ...plainLesson,
          student: {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
          },
        });
      }
    }

    return lessonsWithStudent;
  }

  async findLessonsByStudentUserId(userId: string) {
    const student = await models.Student.findOne({
      where: { userId },
      attributes: ['id', 'firstName', 'lastName'],
      include: [
        {
          model: models.Lesson,
          as: 'lessons',
          attributes: {
            exclude: [
              'createdAt',
              'updatedAt',
              'subjectId',
              'scheduleId',
              'teacherId',
            ],
          },
          through: { attributes: [] },
          include: [
            {
              model: models.Subject,
              as: 'subject',
              attributes: { exclude: ['createdAt', 'updatedAt'] },
            },
            {
              model: models.Schedule,
              as: 'schedule',
              attributes: ['startDateTime'],
            },
            {
              model: models.Teacher,
              as: 'teacher',
              attributes: ['id', 'firstName', 'lastName'],
            },
          ],
        },
      ],
    });

    if (!student) return null;

    // Opcional: incluir dados do aluno junto da aula
    const lessonsWithStudent = (student.lessons ?? []).map((lesson) => {
      const plainLesson = lesson.get({ plain: true });
      return {
        ...plainLesson,
        student: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
        },
      };
    });

    return lessonsWithStudent;
  }

  async findLessonsByTeacherUserId(userId: string) {
    // Busca o professor pelo userId
    const teacher = await models.Teacher.findOne({
      where: { userId },
      attributes: ['id', 'firstName', 'lastName'],
    });

    if (!teacher) return null;

    // Busca todas as aulas associadas a esse professor
    const lessons = await models.Lesson.findAll({
      where: { teacherId: teacher.id },
      attributes: {
        exclude: [
          'createdAt',
          'updatedAt',
          'subjectId',
          'scheduleId',
          'teacherId',
        ],
      },
      include: [
        {
          model: models.Subject,
          as: 'subject',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
        {
          model: models.Schedule,
          as: 'schedule',
          attributes: ['startDateTime'],
        },
        {
          model: models.Teacher,
          as: 'teacher',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });

    // Opcional: mapear e retornar com o professor junto (ou já vem no include)
    return lessons;
  }

  async findLessonsByUnitId(unitId: string) {
    return models.Lesson.findAll({
      include: [
        {
          model: models.Schedule,
          as: 'schedule',
          where: { unitId }, // Aqui filtramos pela unidade dentro de schedule
          attributes: ['startDateTime'], // Você pode incluir mais se quiser
        },
        {
          model: models.Subject,
          as: 'subject',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
        {
          model: models.Teacher,
          as: 'teacher',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: models.Student,
          as: 'students',
          through: { attributes: [] },
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
      attributes: {
        exclude: [
          'createdAt',
          'updatedAt',
          'subjectId',
          'teacherId',
          'scheduleId',
        ],
      },
    });
  }
}
