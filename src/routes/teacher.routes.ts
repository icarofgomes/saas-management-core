import { Router } from 'express';
import { TeacherController } from '../controllers/teacher.controller';
import validateSchema from '../middlewares/validateSchema';
import {
  createTeacherSchema,
  updateTeacherSchema,
} from '../schemas/teacher/teacherSchema';
import { wrapAsync } from '../utils/wrapAsync';
import { authenticateToken } from 'src/middlewares/authenticateToken';

const router = Router();
const teacherController = new TeacherController();

router.post(
  '/teachers',
  validateSchema(createTeacherSchema),
  wrapAsync(teacherController.create.bind(teacherController)),
);

router.get(
  '/teachers/user/:userId',
  authenticateToken,
  wrapAsync(teacherController.findByUserId.bind(teacherController)),
);

router.get(
  '/teachers',
  authenticateToken,
  wrapAsync(teacherController.findAll.bind(teacherController)),
);

router.get(
  '/teachers/:id',
  authenticateToken,
  wrapAsync(teacherController.findById.bind(teacherController)),
);

router.put(
  '/teachers/:userId',
  authenticateToken,
  validateSchema(updateTeacherSchema),
  wrapAsync(teacherController.update.bind(teacherController)),
);

export default router;
