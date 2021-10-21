import express from 'express';
import { body } from 'express-validator';

import { SIGNUP_ROUTE } from './route-defs';
import { signup } from '../controllers/auth.controller';

const signUpRouter = express.Router();

signUpRouter.post(
  SIGNUP_ROUTE,
  [
    body('email').isEmail().withMessage('Email must be in a valid format').normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 8, max: 32 })
      .withMessage('Password must be between 8 and 32 characters'),
    body('password')
      .matches(/^(.*[a-z].*)$/)
      .withMessage('Password must contain at least one lower-case letter'),
    body('password')
      .matches(/^(.*[A-Z].*)$/)
      .withMessage('Password must contain at least one upper-case letter'),
    body('password')
      .matches(/^(.*\d.*)$/)
      .withMessage('Password must contain at least one digit'),
    body('password').escape(),
    body('username').not().isEmpty().withMessage('Please enter a valid username')
  ],
  signup
);

export default signUpRouter;
