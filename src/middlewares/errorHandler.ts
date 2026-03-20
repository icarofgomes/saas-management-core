// src/middlewares/ErrorHandler.ts
import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
  details?: string;
}

export class ErrorHandler {
  public static handle(
    err: CustomError, // Usando CustomError para tipos mais específicos
    _req: Request,
    res: Response,
    _next: NextFunction,
  ): void {
    console.error(err); // Pode ser customizado com um logger

    const status = err.statusCode || 500; // Usando statusCode se estiver presente
    const message = err.message || 'Internal Server Error';
    const details = err.details || '';

    res.status(status).json({ error: message, details });
  }
}
