import express from 'express';
import {
  addPost,
  getLikedUsers,
  getPostById,
  getPosts,
  likePost,
  unlikePost
} from '../controllers/post.controller';

import { validateToken } from '../middlewares';
import validateRequiredFieldsSchema from '../validation/validateRequiredFieldsSchema';
import {
  POSTS_ROUTE,
  POST_DETAIL_ROUTE,
  POST_LIKED_USERS_ROUTE,
  POST_LIKE_ROUTE,
  POST_UNLIKE_ROUTE
} from './route-defs';

const postRouter = express.Router();

postRouter.post(POSTS_ROUTE, [validateRequiredFieldsSchema(['content']), validateToken], addPost);
postRouter.get(POSTS_ROUTE, validateToken, getPosts);
postRouter.get(POST_DETAIL_ROUTE, validateToken, getPostById);
postRouter.post(POST_LIKE_ROUTE, validateToken, likePost);
postRouter.post(POST_UNLIKE_ROUTE, validateToken, unlikePost);
postRouter.get(POST_LIKED_USERS_ROUTE, validateToken, getLikedUsers);

export default postRouter;
