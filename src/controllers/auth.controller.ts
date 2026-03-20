import { Request, Response, NextFunction } from 'express';
import { UserService } from 'src/services/user.service';

const userService = new UserService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    try {
      const result = await userService.login(email, password);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
