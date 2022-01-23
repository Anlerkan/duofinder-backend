import mongoose from 'mongoose';

export type NotificationDocument = mongoose.Document & {
  createdBy: string;
  createdAt: string;
  message: string;
  is_seen: boolean;
};

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
    default: new Date().getDate().toString()
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
