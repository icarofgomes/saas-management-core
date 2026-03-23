import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';
import { env } from 'src/config/env';
import { captureException } from 'src/utils/observality';

export class ErrorHandler {
  public static handle(
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction,
  ): void {
    const isAppError = err instanceof AppError;

    const statusCode = isAppError ? err.statusCode : 500;
    const message = isAppError ? err.message : 'Internal Server Error';

    const details = isAppError ? err.details : undefined;

    // LOG ESTRUTURADO COMPLETO
    logger.error({
      type: isAppError ? 'BUSINESS_ERROR' : 'SYSTEM_ERROR',
      message,
      statusCode,
      details,

      stack: !isAppError && err instanceof Error ? err.stack : undefined,

      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      userId: req.user?.userId,

      body: env.isProduction ? undefined : req.body,
      params: req.params,
      query: env.isProduction ? undefined : req.query,
    });

    if (!isAppError) {
      captureException(err, {
        requestId: req.requestId,
        userId: req.user?.userId,
        path: req.originalUrl,
        method: req.method,
      });
    }

    res.status(statusCode).json({
      error: message,
      details,
      requestId: req.requestId,
    });
  }
}
