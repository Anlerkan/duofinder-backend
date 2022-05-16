import mongoose from 'mongoose';
import { IUser, UserDocument } from './User';

export type IPost = {
  author: UserDocument;
  content: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  likedByViewer: boolean;
};

export type PostResponse = {
  _id: string;
  author: IUser;
  content: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  likedByViewer: boolean;
};

export type PostDocument = mongoose.Document & IPost;

export type PostModel = mongoose.Model<PostDocument>;

export const PostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: String,
    required: true,
    default: new Date().toLocaleString()
  },
  likeCount: {
    type: Number,
    default: 0,
    required: true
  },
  commentCount: {
    type: Number,
    default: 0,
    required: true
  },
  likedByViewer: {
    type: Boolean,
    default: false,
    required: true
  }
});

const Post = mongoose.model<PostDocument, PostModel>('Post', PostSchema);

export default Post;
