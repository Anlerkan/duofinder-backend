import { validationResult } from 'express-validator';
import { Request, Response } from 'express';

import { InvalidInput } from '../errors';
import UserLoggedIn from '../events/user-logged-in';
import { AccountVerification, User } from '../models';
import { EmailSender, PasswordHash } from '../utils';
import { Jwt } from '../utils/jwt';
import { UserSignedUp } from '../events';
import { generateEmailVerificationToken } from '../utils/account-verification';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function login(req: Request, res: Response) {
  const errors = validationResult(req).array();

  const { email, password } = req.body;

  if (errors.length > 0) {
    throw new InvalidInput(errors);
  }

  const user = await User.findOne({ email });

  if (!user) {
    errors.push({
      location: 'body',
      value: email,
      param: 'email',
      msg: 'User was not found.'
    });

    throw new InvalidInput(errors);
  }

  if (!user.isVerified) {
    errors.push({
      location: 'body',
      value: email,
      param: 'email',
      msg: 'User is not verified.'
    });

    throw new InvalidInput(errors);
  }

  const dbPassword = user.password;

  const isPasswordCorrect = PasswordHash.compareSync({
    providedPassword: password,
    storedPassword: dbPassword
  });

  if (!isPasswordCorrect) {
    errors.push({
      location: 'body',
      value: password,
      param: 'password',
      msg: 'Invalid password.'
    });

    throw new InvalidInput(errors);
  }

  const userLoggedInEvent = new UserLoggedIn(user);

  const accessToken = Jwt.createToken({ user });

  res.cookie('access-token', accessToken, { maxAge: 60 * 60 * 24 * 30 * 1000 });

  return res.status(userLoggedInEvent.getStatusCode()).send(userLoggedInEvent.serializeRest());
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function signup(req: Request, res: Response) {
  const errors = validationResult(req).array();

  if (/.+@[A-Z]/g.test(req.body.email)) {
    errors.push({
      location: 'body',
      value: req.body.email,
      param: 'email',
      msg: 'Email is not normalized'
    });
  }

  if (/[><'"/]/g.test(req.body.password)) {
    errors.push({
      location: 'body',
      value: req.body.password,
      param: 'password',
      msg: 'Password contains invalid characters'
    });
  }

  if (errors.length > 0) {
    throw new InvalidInput(errors);
  }

  const { email, password, username } = req.body;

  const newUser = await User.create({ email, password, username });
  const emailVerificationToken = generateEmailVerificationToken();

  const accountVerification = await AccountVerification.create({
    userId: newUser._id,
    emailVerificationToken
  });

  const userSignedUpEvent = new UserSignedUp(newUser);
  const emailSender = EmailSender.getInstance();

  emailSender.sendSignupVerificationEmail({
    toEmail: newUser.email,
    emailVerificationToken: accountVerification.emailVerificationToken
  });

  return res.status(userSignedUpEvent.getStatusCode()).send(userSignedUpEvent.serializeRest());
}
