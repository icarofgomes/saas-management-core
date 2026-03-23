import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info({
      type: 'REQUEST',
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      duration,
    });
  });

  next();
};
