import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/authenticateToken';
import { wrapAsync } from '../utils/wrapAsync';
import validateSchema from 'src/middlewares/validateSchema';
import {
  createUserSchema,
  requestResetSchema,
  resetPasswordSchema,
} from 'src/schemas/user/userSchema';

const router = Router();
const userController = new UserController();

router.post(
  '/users',
  validateSchema(createUserSchema),
  wrapAsync(userController.create.bind(userController)),
);
router.get(
  '/users/:id',
  wrapAsync(userController.getById.bind(userController)),
);
router.get(
  '/users',
  authenticateToken,
  wrapAsync(userController.getAll.bind(userController)),
);
router.post(
  '/users/verify-email-code',
  wrapAsync(userController.verifyEmailCode.bind(userController)),
);
router.post(
  '/users/reset-verification-token',
  wrapAsync(userController.resetVerificationToken.bind(userController)),
);

router.patch(
  '/users/:id/activate',
  authenticateToken,
  wrapAsync(userController.activate.bind(userController)),
);

router.patch(
  '/users/:id/deactivate',
  authenticateToken,
  wrapAsync(userController.deactivate.bind(userController)),
);

router.post(
  '/users/forgot-password',
  validateSchema(requestResetSchema),
  wrapAsync(userController.requestPasswordReset.bind(userController)),
);

router.post(
  '/users/reset-password',
  validateSchema(resetPasswordSchema),
  wrapAsync(userController.resetPassword.bind(userController)),
);

router.post(
  '/users/resend-verification-token',
  validateSchema(requestResetSchema),
  wrapAsync(userController.resendVerificationToken.bind(userController)),
);

router.post(
  '/users/resend-password-reset-token',
  validateSchema(requestResetSchema), // { email }
  wrapAsync(userController.resendPasswordResetToken.bind(userController)),
);

export default router;
