import express from 'express';

import { LOGIN_ROUTE } from './route-defs';
import { login } from '../controllers/auth.controller';
import validateRequiredFieldsSchema from '../validation/validateRequiredFieldsSchema';

const loginRouter = express.Router();

loginRouter.post(LOGIN_ROUTE, [validateRequiredFieldsSchema(['email', 'password'])], login);

export default loginRouter;
