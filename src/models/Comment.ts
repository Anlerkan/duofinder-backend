import mongoose from 'mongoose';
import { UserDocument } from './User';

export type IComment = {
  createdBy: UserDocument;
  createdAt: string;
  content: string;
};

export type CommentDocument = mongoose.Document & IComment;

export type CommentModel = mongoose.Model<CommentDocument>;

export const commentSchema = new mongoose.Schema<CommentDocument, CommentModel, IComment>({
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

const Comment = mongoose.model<CommentDocument, CommentModel>('Comment', commentSchema);

export default Comment;
