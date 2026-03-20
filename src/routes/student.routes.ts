import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { wrapAsync } from '../utils/wrapAsync';
import { authenticateToken } from '../middlewares/authenticateToken';
import validateSchema from 'src/middlewares/validateSchema';
import {
  createStudentSchema,
  updateStudentSchema,
} from 'src/schemas/student/studentSchema';

const router = Router();
const studentController = new StudentController();

// POST /students/:id (id = parentId)
router.post(
  '/students/:id',
  authenticateToken,
  validateSchema(createStudentSchema),
  wrapAsync(studentController.create.bind(studentController)),
);

// GET /students (admin only)
router.get(
  '/students',
  authenticateToken,
  wrapAsync(studentController.findAll.bind(studentController)),
);

// GET /students/byparent/:id
router.get(
  '/students/byparent/:id',
  authenticateToken,
  wrapAsync(studentController.findById.bind(studentController)),
);

// GET /students/:id
router.get(
  '/students/:userId',
  authenticateToken,
  wrapAsync(studentController.findByUserId.bind(studentController)),
);

// PUT /students/:id
router.put(
  '/students/:id',
  validateSchema(updateStudentSchema),
  authenticateToken,
  wrapAsync(studentController.update.bind(studentController)),
);

export default router;
