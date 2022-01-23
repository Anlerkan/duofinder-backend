import express from 'express';

import { SIGNUP_ROUTE } from './route-defs';
import { signup } from '../controllers/auth.controller';
import validateEmailSchema from '../validation/validateEmailSchema';
import validatePasswordSchema from '../validation/validatePasswordSchema';
import validateRequiredFieldsSchema from '../validation/validateRequiredFieldsSchema';

const signUpRouter = express.Router();

signUpRouter.post(
  SIGNUP_ROUTE,
  [
    validateEmailSchema(),
    validatePasswordSchema(),
    validateRequiredFieldsSchema(['username', 'email', 'password'])
  ],
  signup
);

export default signUpRouter;
