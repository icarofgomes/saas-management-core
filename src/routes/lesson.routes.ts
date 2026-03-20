import { Router } from 'express';
import { LessonController } from '../controllers/lesson.controller';
import validateSchema from '../middlewares/validateSchema';
import { wrapAsync } from '../utils/wrapAsync';
import {
  addTeacherSchema,
  createLessonSchema,
  addStudentSchema,
} from 'src/schemas/lesson/lessonSchema';
import { authenticateToken } from 'src/middlewares/authenticateToken';

const router = Router();
const lessonController = new LessonController();

router.post(
  '/lessons',
  validateSchema(createLessonSchema),
  wrapAsync(lessonController.create.bind(lessonController)),
);

router.patch(
  '/lessons/:lessonId/add-teacher',
  validateSchema(addTeacherSchema),
  wrapAsync(lessonController.addTeacher.bind(lessonController)),
);

router.patch(
  '/lessons/:lessonId/add-student',
  validateSchema(addStudentSchema),
  wrapAsync(lessonController.addStudent.bind(lessonController)),
);

router.get(
  '/lessons/parent/:userId',
  authenticateToken,
  wrapAsync(lessonController.findByParentUserId.bind(lessonController)),
);

router.get(
  '/lessons/student/:userId',
  authenticateToken,
  wrapAsync(lessonController.findByStudentUserId.bind(lessonController)),
);

router.get(
  '/lessons/teacher/:userId',
  authenticateToken,
  wrapAsync(lessonController.findByTeacherUserId.bind(lessonController)),
);

router.get(
  '/lessons/unit/:userId',
  authenticateToken,
  wrapAsync(lessonController.findByUnitUserId.bind(lessonController)),
);

export default router;
