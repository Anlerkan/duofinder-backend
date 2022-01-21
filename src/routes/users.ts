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
  updateUser
} from '../controllers/user.controller';
import { validateToken } from '../middlewares';
import validatePasswordSchema from '../validation/validatePasswordSchema';

const usersRouter = express.Router();

usersRouter.get(USERS_ROUTE, validateToken, getUsers);
usersRouter.get(USERS_ME_ROUTE, validateToken, getLoggedInUser);
usersRouter.get(USER_DETAIL_ROUTE, getUserByUsername);
usersRouter.put(USER_DETAIL_ROUTE, updateUser);
usersRouter.post(
  USER_CHANGE_CURRENT_USER_PASSWORD_ROUTE,
  [validatePasswordSchema(), validateToken],
  changeCurrentUserPassword
);

export default usersRouter;
