import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { UserAttributes } from 'src/types/User';

const userService = new UserService();

export class UserController {
  async create(
    req: Request<{}, {}, UserAttributes>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = await userService.createUserWithVerificationToken(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUser(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmailCode(req: Request, res: Response, next: NextFunction) {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res
        .status(400)
        .json({ message: 'userId e code são obrigatórios' });
    }

    try {
      const success = await userService.verifyEmailCode(userId, code);

      if (!success) {
        return res.status(400).json({ message: 'Código inválido ou expirado' });
      }

      return res.status(200).json({ message: 'Código verificado com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  async resetVerificationToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId é obrigatório' });
    }

    try {
      await userService.resetVerificationToken(userId);
      return res.status(200).json({
        message: 'Token de verificação renovado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  async deactivate(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { role } = req.user!;

    try {
      await userService.deactivateUser(id, role);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async activate(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { role } = req.user!;

    try {
      await userService.activateUser(id, role);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;
    try {
      await userService.requestPasswordReset(email);
      return res
        .status(200)
        .json({ message: 'Se o e‑mail existir, enviaremos instruções.' });
    } catch (e) {
      next(e);
    }
  }

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email, code, newPassword } = req.body;
    try {
      await userService.resetPassword(email, code, newPassword);
      return res.status(200).json({ message: 'Senha redefinida com sucesso' });
    } catch (err) {
      next(err);
    }
  };

  async resendVerificationToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { email } = req.body;
    try {
      await userService.resendVerificationToken(email);
      return res
        .status(200)
        .json({ message: 'Se o e-mail existir, reenviamos o código.' });
    } catch (err) {
      next(err);
    }
  }

  async resendPasswordResetToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { email } = req.body;
    try {
      await userService.resendPasswordResetToken(email);
      return res
        .status(200)
        .json({ message: 'Se o e-mail existir, reenviamos o token.' });
    } catch (err) {
      next(err);
    }
  }
}
