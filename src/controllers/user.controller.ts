import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { InvalidInput } from '../errors';
import { User } from '../models';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function getLoggedInUser(req: Request, res: Response) {
  const errors = validationResult(req).array();
  const user = await User.findById(req.userId);

  if (errors.length > 0) {
    throw new InvalidInput(errors);
  }

  if (!user) {
    errors.push({
      location: 'body',
      value: 'user',
      param: 'user',
      msg: 'User was not found.'
    });

    throw new InvalidInput(errors);
  }

  return res.status(200).send(user);
}
