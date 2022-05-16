import { Request } from 'express';
import { ObjectId } from 'mongoose';

import { InvalidInput } from '../errors';
import NotFoundError from '../errors/not-found';
import { User, UserDocument } from '../models';
import { PaginationParams } from '../utils/pagination/paginationTypes';
import BaseService from './BaseService';
import notificationService, { NOTIFICATION_MESSAGES } from './NotificationService';

class UserService extends BaseService<UserDocument> {
  constructor() {
    super(User, '-password', { path: 'games', select: '-password' });
  }

  async sendFriendRequest(userId: ObjectId, friendId: ObjectId) {
    const user = await this.findOne({ _id: userId });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const friend = await this.findOne({ _id: friendId });

    if (!friend) {
      throw new NotFoundError('User not found');
    }

    if (friend?._id === userId) {
      throw new InvalidInput([
        {
          msg: 'You cannot send a friend request to yourself',
          param: 'userId',
          value: friendId,
          location: 'body'
        }
      ]);
    }

    if (user.friendRequestsSent.includes(friend._id)) {
      throw new InvalidInput([
        {
          msg: 'You have already sent a friend request to this user',
          param: 'userId',
          value: friendId,
          location: 'body'
        }
      ]);
    }

    user.friendRequestsSent.push(friend);
    await user.save();

    await notificationService.create({
      user: friendId,
      createdBy: userId,
      message: NOTIFICATION_MESSAGES.FRIEND_REQUEST
    });

    return user;
  }

  async acceptFriendRequest(userId: ObjectId, friendId: ObjectId) {
    const user = await this.findOne({ _id: userId });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const friend = await this.findOne({ _id: friendId });

    if (!friend) {
      throw new NotFoundError('User not found');
    }

    user.friends.push(friend);
    user.friendRequestsReceived.filter((fr) => fr.toString() !== friend._id.toString());
    await user.save();

    return user;
  }

  async rejectFriendRequest(userId: ObjectId, friendId: ObjectId) {
    const user = await this.findOne({ _id: userId });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const friend = await this.findOne({ _id: friendId });

    if (!friend) {
      throw new NotFoundError('User not found');
    }

    user.friendRequestsReceived.filter((fr) => fr.toString() !== friend._id.toString());
    await user.save();

    return user;
  }

  async removeFriendRequest(userId: ObjectId, friendId: ObjectId) {
    const user = await this.findOne({ _id: userId });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = this.partiallyUpdate((userId as unknown) as string, {
      $pull: { friendRequestsSent: friendId }
    });

    // await User.updateOne({_id:userId}, {$pull: {friendRequestsSent: friendId}});

    // user.friendRequestsSent.filter((fr) => fr.toString() !== friendId.toString());
    // await user.save();

    return updatedUser;
  }

  async removeFriend(userId: string, friendId: string) {
    const user = await this.findOne({ _id: userId });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const friend = await this.findOne({ _id: friendId });

    if (!friend) {
      throw new NotFoundError('User not found');
    }

    user.friends.filter((fr) => fr.toString() !== friend._id.toString());
    await user.save();

    return user;
  }

  async getFriends(userId: string, params: PaginationParams, req: Request) {
    const user = await this.findOne({ _id: userId });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const paginatedResult = this.getPaginatedResult(params, req, 'username', {
      _id: { $in: user.friends }
    });

    return paginatedResult;
  }

  async getFriendRequestsSent(userId: string) {
    const user = await this.findOne({ _id: userId });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user.friendRequestsSent;
  }

  async getFriendRequestsReceived(userId: string) {
    const user = await this.findOne({ _id: userId });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user.friendRequestsReceived;
  }

  async getNotifications(userId: ObjectId, params: PaginationParams, req: Request) {
    const paginatedResult = await notificationService.getPaginatedResult(params, req, 'message', {
      user: userId
    });

    return paginatedResult;
  }

  async getRecommendedUsers(userId: ObjectId, params: PaginationParams, req: Request) {
    const user = await this.findOne({ _id: userId });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const paginatedResult = this.getPaginatedResult(params, req, 'username', {
      _id: { $nin: [...user.friends, ...user.friendRequestsSent] }
    });

    return paginatedResult;
  }
}

const userService = new UserService();

export default userService;
