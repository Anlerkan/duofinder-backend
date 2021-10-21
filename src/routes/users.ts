import express from 'express';

import { USERS_ME_ROUTE } from './route-defs';
import { getLoggedInUser } from '../controllers/user.controller';
import { validateToken } from '../middlewares';

const usersRouter = express.Router();

usersRouter.get(USERS_ME_ROUTE, validateToken, getLoggedInUser);

export default usersRouter;
