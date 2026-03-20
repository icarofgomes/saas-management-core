import { Request, Response, NextFunction } from 'express';

export const wrapAsync = (
  fn: (_req: Request, _res: Response, _next: NextFunction) => Promise<unknown>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
