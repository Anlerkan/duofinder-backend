import express from 'express';
import { getCurrentUserConversations } from '../controllers/conversation.controller';

import { validateToken } from '../middlewares';
import { CONVERSATIONS_ROUTE } from './route-defs';

const conversationRouter = express.Router();

conversationRouter.get(CONVERSATIONS_ROUTE, validateToken, getCurrentUserConversations);

export default conversationRouter;
