import { Request, Response, NextFunction } from 'express';
import { DuplicatedEmail } from '../errors';
import DuplicatedUsername from '../errors/duplicated-username';

import Unauthorized from '../errors/unauthorized';
import { User } from '../models';

async function validateUniqueUser(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void | Unauthorized> {
  const { username, email } = req.body;

  const existingEmail = await User.findOne({ email });
  const existingUsername = await User.findOne({ username });

  if (existingEmail) {
    throw new DuplicatedEmail();
  }

  if (existingUsername) {
    throw new DuplicatedUsername();
  }

  next();
}

export default validateUniqueUser;
