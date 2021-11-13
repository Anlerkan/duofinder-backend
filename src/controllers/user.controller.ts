import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { InvalidInput } from '../errors';
import Unauthorized from '../errors/unauthorized';
import { User } from '../models';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function getLoggedInUser(req: Request, res: Response) {
  const errors = validationResult(req).array();
  const user = await User.findById(req.userId).select('-password');

  if (errors.length > 0) {
    throw new InvalidInput(errors);
  }

  if (!user) {
    throw new Unauthorized();
  }

  return res.status(200).send(user);
}
