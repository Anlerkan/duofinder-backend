import mongoose, { ObjectId } from 'mongoose';

export type INotification = {
  createdBy: ObjectId;
  createdAt: string;
  message: string;
  is_seen: boolean;
  user: ObjectId;
};

export type NotificationDocument = mongoose.Document & INotification;

export type NotificationModel = mongoose.Model<NotificationDocument>;

const notificationSchema = new mongoose.Schema<NotificationDocument, NotificationModel>({
  message: {
    type: String,
    required: true
  },
  is_seen: {
    type: Boolean,
    required: true,
    default: false
  },
  createdAt: {
    type: String,
    required: true,
    default: new Date().toLocaleString()
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Notification = mongoose.model<NotificationDocument, NotificationModel>(
  'Notification',
  notificationSchema
);

export default Notification;
