import { validationResult } from 'express-validator';
import { Request, Response } from 'express';

import { InvalidInput } from '../errors';
import UserLoggedIn from '../events/user-logged-in';
import { AccountVerification } from '../models';
import { EmailSender, PasswordHash } from '../utils';
import { Jwt } from '../utils/jwt';
import { UserSignedUp } from '../events';
import { generateEmailVerificationToken } from '../utils/account-verification';
import UserVerified from '../events/user-verified';
import accountVerificationService from '../services/AccountVerificationService';
import NotFoundError from '../errors/not-found';
import authService from '../services/AuthService';

export async function login(req: Request, res: Response) {
  const errors = validationResult(req).array();

  const { email, password } = req.body;

  const user = await authService.findOne({ email });

  if (!user) {
    errors.push({
      location: 'body',
      value: email,
      param: 'email',
      msg: 'User was not found.'
    });
  }

  if (user && !user.isVerified) {
    errors.push({
      location: 'body',
      value: email,
      param: 'email',
      msg: 'User is not verified.'
    });
  }

  if (errors.length > 0 || !user) {
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

  return res
    .cookie('access-token', accessToken, { maxAge: 60 * 60 * 24 * 30 * 1000, httpOnly: true })
    .status(userLoggedInEvent.getStatusCode())
    .send(userLoggedInEvent.serializeRest());
}

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

  const newUser = await authService.create({ email, password, username });
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

export async function verifyUser(req: Request, res: Response) {
  const errors = validationResult(req).array();

  if (errors.length > 0) {
    throw new Error('Email verification token is invalid');
  }

  const { emailVerificationToken } = req.body;

  const verificationDoc = await accountVerificationService.findOne({ emailVerificationToken });

  if (!verificationDoc) {
    throw new NotFoundError('Email verification token is invalid or expired');
  }

  const user = await authService.partiallyUpdate(verificationDoc.userId, { isVerified: true });

  if (!user) {
    throw new NotFoundError('User with the corresponding verification token was not found');
  }

  const userVerified = new UserVerified(user);

  //  Delete verification token after user is verified
  await accountVerificationService.delete(verificationDoc.id);

  return res.sendStatus(userVerified.getStatusCode());
}
