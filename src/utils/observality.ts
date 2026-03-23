// Integração futura com Sentry (ou similar)
// import * as Sentry from '@sentry/node';

type CaptureContext = {
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
};

export const captureException = (error: unknown, context?: CaptureContext) => {
  // Só ativa se tiver DSN (ambiente real)
  if (!process.env.SENTRY_DSN) {
    return;
  }

  // Exemplo de integração futura
  /*
  Sentry.withScope((scope) => {
    if (context?.requestId) scope.setTag('requestId', context.requestId);
    if (context?.userId) scope.setUser({ id: context.userId });

    scope.setContext('request', {
      path: context?.path,
      method: context?.method,
    });

    Sentry.captureException(error);
  });
  */
};
