import { ObjectId } from 'mongoose';
import { Like, LikeDocument, UserDocument } from '../models';
import BaseService from './BaseService';

class LikeService extends BaseService<LikeDocument> {
  constructor() {
    super(Like, undefined, { path: 'createdBy' });
  }

  async isLikedByUser(postId: ObjectId, user: UserDocument) {
    const like = await this.findOne({ postId, createdBy: user._id });

    return Boolean(like);
  }
}

const likeService = new LikeService();

export default likeService;
