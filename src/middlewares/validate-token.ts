import { Request, Response, NextFunction } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';

import Unauthorized from '../errors/unauthorized';

//  TO-DO: Find a better way to solve this

// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// eslint-disable-next-line consistent-return
function validateToken(req: Request, _res: Response, next: NextFunction) {
  try {
    const validToken = verify(
      req.cookies['access-token'],
      process.env.SESSION_TOKEN_SECRET!
    ) as JwtPayload;

    if (validToken) {
      req.userId = validToken.id;
      return next();
    }
  } catch (err) {
    throw new Unauthorized();
  }
}

export default validateToken;
