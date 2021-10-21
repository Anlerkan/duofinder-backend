import { Request } from 'express';

export function generateBaseUrlByRequest(req: Request): string {
  return `http://${req.headers.host}/api`;
}
