import { ObjectId } from 'mongoose';
import NotFoundError from '../errors/not-found';
import { Post, PostDocument, UserDocument } from '../models';
import Like from '../models/Like';
import { pickKeys } from '../utils/object/objectUtils';
import BaseService from './BaseService';
import likeService from './LikeService';

class PostService extends BaseService<PostDocument> {
  constructor() {
    super(Post, undefined, [
      { path: 'likes' },
      { path: 'comments' },
      { path: 'author', select: '-password' }
    ]);
  }

  async likePost(postId: string, user: UserDocument) {
    await Like.create({ createdAt: new Date().toString(), createdBy: user, postId });

    const post = await this.findOne({ _id: postId });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    return this.partiallyUpdate(postId, {
      likeCount: post.likeCount + 1
    });
  }

  async unlikePost(postId: ObjectId, user: UserDocument) {
    const post = await this.findOne({ _id: postId });

    await Like.findOneAndDelete({ postId, createdBy: user });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    return this.partiallyUpdate((postId as unknown) as string, {
      likeCount: post.likeCount - 1
    });
  }

  async getLikedUsers(postId: ObjectId) {
    const post = await this.findOne({ _id: postId });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const likes = await likeService.getAll({ postId });
    const likedUsers = likes.map((like) => like.createdBy);

    return likedUsers.map((user) => pickKeys(user, '_id', 'username', 'bio', 'avatar'));
  }
}

const postService = new PostService();

export default postService;
