import express from 'express';

import {
  RECOMMENDED_USERS_ROUTE,
  USERS_ME_ROUTE,
  USERS_ROUTE,
  USER_CHANGE_CURRENT_USER_PASSWORD_ROUTE,
  USER_CURRENT_USER_POSTS,
  USER_DETAIL_ID_ROUTE,
  USER_DETAIL_ROUTE,
  USER_POSTS
} from './route-defs';
import {
  acceptFriendRequest,
  changeCurrentUserPassword,
  getCurrentUserFriends,
  getFriendRequestsReceived,
  getLoggedInUser,
  getRecommendedUsers,
  getUserByUsername,
  getUsers,
  partiallyUpdateAuthUser,
  sendFriendRequest,
  updateAuthUser
} from '../controllers/user.controller';
import { validateToken, validateUniqueUser } from '../middlewares';
import validatePasswordSchema from '../validation/validatePasswordSchema';
import validateEmailSchema from '../validation/validateEmailSchema';
import { getCurrentUserPosts, getPostsByUser } from '../controllers/post.controller';

const usersRouter = express.Router();

usersRouter.get(USERS_ROUTE, validateToken, getUsers);
usersRouter.get(RECOMMENDED_USERS_ROUTE, validateToken, getRecommendedUsers);

usersRouter.get(USERS_ME_ROUTE, validateToken, getLoggedInUser);
usersRouter.patch(USERS_ME_ROUTE, [validateToken], partiallyUpdateAuthUser);
usersRouter.put(
  USERS_ME_ROUTE,
  [validateUniqueUser, validateEmailSchema(), validateToken],
  updateAuthUser
);
usersRouter.post(
  USER_CHANGE_CURRENT_USER_PASSWORD_ROUTE,
  [validatePasswordSchema(), validateToken],
  changeCurrentUserPassword
);

usersRouter.get(USER_CURRENT_USER_POSTS, validateToken, getCurrentUserPosts);
usersRouter.get(USER_POSTS, validateToken, getPostsByUser);

usersRouter.get(USER_DETAIL_ROUTE, getUserByUsername);

usersRouter.get(
  `${USER_DETAIL_ROUTE}/received-friend-requests`,
  validateToken,
  getFriendRequestsReceived
);

usersRouter.post(`${USER_DETAIL_ID_ROUTE}/send-friend-request`, validateToken, sendFriendRequest);
usersRouter.post(
  `${USER_DETAIL_ID_ROUTE}/accept-friend-request`,
  validateToken,
  acceptFriendRequest
);

usersRouter.get(`${USERS_ME_ROUTE}friends`, validateToken, getCurrentUserFriends);

export default usersRouter;
