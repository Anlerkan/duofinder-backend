import express from 'express';

import {
  USERS_ME_ROUTE,
  USERS_ROUTE,
  USER_CHANGE_CURRENT_USER_PASSWORD_ROUTE,
  USER_DETAIL_ROUTE
} from './route-defs';
import {
  changeCurrentUserPassword,
  getLoggedInUser,
  getUserByUsername,
  getUsers,
  partiallyUpdateAuthUser,
  updateAuthUser
} from '../controllers/user.controller';
import { validateToken } from '../middlewares';
import validatePasswordSchema from '../validation/validatePasswordSchema';
import validateEmailSchema from '../validation/validateEmailSchema';

const usersRouter = express.Router();

usersRouter.get(USERS_ROUTE, validateToken, getUsers);

usersRouter.get(USERS_ME_ROUTE, validateToken, getLoggedInUser);
usersRouter.patch(USERS_ME_ROUTE, [validateEmailSchema(), validateToken], partiallyUpdateAuthUser);
usersRouter.put(USERS_ME_ROUTE, [validateEmailSchema(), validateToken], updateAuthUser);
usersRouter.post(
  USER_CHANGE_CURRENT_USER_PASSWORD_ROUTE,
  [validatePasswordSchema(), validateToken],
  changeCurrentUserPassword
);

usersRouter.get(USER_DETAIL_ROUTE, getUserByUsername);

export default usersRouter;
