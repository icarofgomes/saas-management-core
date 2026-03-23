import { TokenPayload } from '../TokenPayload';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      requestId?: string;
    }
  }
}
