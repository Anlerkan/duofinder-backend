import mongoose from 'mongoose';
import { UserDocument } from './User';

export type IMessage = {
  conversationId: mongoose.Types.ObjectId;
  createdBy: UserDocument;
  createdAt: string;
  content: string;
};

export type MessageDocument = mongoose.Document & IMessage;

export type MessageModel = mongoose.Model<MessageDocument>;

export const messageSchema = new mongoose.Schema<MessageDocument, MessageModel, IMessage>({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: String,
    required: true,
    default: new Date().toLocaleString()
  },
  content: {
    type: String,
    required: true
  }
});

const Message = mongoose.model<MessageDocument, MessageModel>('Message', messageSchema);

export default Message;
