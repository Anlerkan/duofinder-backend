import { Request, Response, NextFunction } from 'express';

import Unauthorized from '../errors/unauthorized';
import { User } from '../models';

async function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void | Unauthorized> {
  if (req.userId) {
    try {
      const user = await User.findById(req.userId);

      if (user && user.isAdmin) {
        return next();
      }
    } catch (err) {
      throw new Unauthorized();
    }
  }

  throw new Unauthorized();
}

export default requireAdmin;
