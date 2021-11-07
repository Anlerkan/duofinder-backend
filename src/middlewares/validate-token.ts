import { Request, Response, NextFunction } from 'express';

import { JwtPayload, verify } from 'jsonwebtoken';

import Unauthorized from '../errors/unauthorized';
import { User } from '../models';

export type ValidateTokenArgs = {
  req: Request;
  res: Response;
  next: NextFunction;
};

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

function validateToken(req: Request, res: Response, next: NextFunction): Response | void {
  if (req.cookies && req.cookies['access-token']) {
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

  throw new Unauthorized();
}

export default validateToken;
