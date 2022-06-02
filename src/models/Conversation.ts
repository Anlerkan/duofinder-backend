import mongoose from 'mongoose';
import { UserDocument } from './User';

export type IConversation = {
  members: UserDocument[];
};

export type ConversationDocument = mongoose.Document & IConversation;

export type ConversationModel = mongoose.Model<ConversationDocument>;

export const conversationSchema = new mongoose.Schema<
  ConversationDocument,
  ConversationModel,
  IConversation
>({
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  ]
});

const Conversation = mongoose.model<ConversationDocument, ConversationModel>(
  'Conversation',
  conversationSchema
);

export default Conversation;
