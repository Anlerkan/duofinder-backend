import { NotificationDocument, Notification } from '../models';
import BaseService from './BaseService';

export const NOTIFICATION_MESSAGES = {
  LIKE: 'liked your post',
  COMMENT: 'commented on your post',
  FRIEND_REQUEST: 'sent you a friend request',
  FRIEND_REQUEST_ACCEPTED: 'accepted your friend request'
};

class NotificationService extends BaseService<NotificationDocument> {
  constructor() {
    super(Notification, undefined, { path: 'createdBy' });
  }
}

const notificationService = new NotificationService();

export default notificationService;
