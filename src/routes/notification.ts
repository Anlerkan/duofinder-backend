import express from 'express';
import { getCurrentUserNotifications } from '../controllers/notification.controller';

import { validateToken } from '../middlewares';
import { NOTIFICATIONS_ROUTE } from './route-defs';

const notificationRouter = express.Router();

notificationRouter.get(NOTIFICATIONS_ROUTE, validateToken, getCurrentUserNotifications);

export default notificationRouter;
