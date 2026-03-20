// src/routes/auth.route.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { wrapAsync } from '../utils/wrapAsync';

const router = Router();
const authController = new AuthController();

router.post('/login', wrapAsync(authController.login.bind(authController)));

export default router;
