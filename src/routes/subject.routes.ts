import { Router } from 'express';
import { SubjectController } from '../controllers/subject.controller';
import { wrapAsync } from '../utils/wrapAsync';
import { authenticateToken } from '../middlewares/authenticateToken';
import validateSchema from 'src/middlewares/validateSchema';
import { createSubjectSchema } from 'src/schemas/subject/subjectSchema';

const router = Router();
const subjectController = new SubjectController();

router.post(
  '/subjects',
  authenticateToken,
  validateSchema(createSubjectSchema),
  wrapAsync(subjectController.create.bind(subjectController)),
);

router.get(
  '/subjects',
  authenticateToken,
  wrapAsync(subjectController.findAll.bind(subjectController)),
);

router.get(
  '/subjects/:id/teachers',
  authenticateToken,
  wrapAsync(subjectController.findTeachersBySubject.bind(subjectController)),
);

export default router;
