import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { TokenPayload } from 'src/types/TokenPayload';

interface CustomRequest extends Request {
  user?: TokenPayload;
}

export const authenticateToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) return res.sendStatus(403);

    // Aqui garantimos que decoded seja TokenPayload
    req.user = decoded as TokenPayload;

    next();
  });
};
