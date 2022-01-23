import { NotificationDocument, Notification } from '../models';
import BaseService from './BaseService';

class NotificationService extends BaseService<NotificationDocument> {
  constructor() {
    super(Notification);
  }
}

const notificationService = new NotificationService();

export default notificationService;
