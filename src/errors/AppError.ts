interface AppErrorParams {
  message: string;
  statusCode?: number;
  details?: string;
}

export class AppError extends Error {
  public statusCode: number;
  public details?: string;

  constructor(params: AppErrorParams) {
    super(params.message);
    this.name = this.constructor.name;
    this.statusCode = params.statusCode ?? 400;
    this.details = params.details;
    Error.captureStackTrace(this, this.constructor);
  }
}
