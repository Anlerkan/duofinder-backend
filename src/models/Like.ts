import mongoose, { ObjectId } from 'mongoose';
import { UserDocument } from './User';

export type ILike = {
  createdBy: UserDocument;
  createdAt: string;
  postId: ObjectId;
};

export type LikeDocument = mongoose.Document & ILike;

export type LikeModel = mongoose.Model<LikeDocument>;

export const likeSchema = new mongoose.Schema<LikeDocument, LikeModel, ILike>({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: String,
    required: true,
    default: new Date().getDate().toString()
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

const Like = mongoose.model<LikeDocument, LikeModel>('Like', likeSchema);

export default Like;
