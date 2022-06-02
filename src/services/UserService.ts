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

    friend.friendRequestsReceived.push(user._id);
    await friend.save();

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
    friend.friends.push(user);
    friend.friendRequestsSent.filter((fr) => fr.toString() !== user._id.toString());
    await user.save();
    await friend.save();

    await notificationService.create({
      user: friendId,
      createdBy: userId,
      message: NOTIFICATION_MESSAGES.FRIEND_REQUEST_ACCEPTED
    });

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
    friend.friendRequestsSent.filter((fr) => fr.toString() !== user._id.toString());
    await user.save();
    await friend.save();

    return user;
  }

  async removeFriendRequest(userId: ObjectId, friendId: ObjectId) {
    const user = await this.findOne({ _id: userId });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const friend = await this.findOne({ _id: friendId });

    const updatedUser = this.partiallyUpdate((userId as unknown) as string, {
      $pull: { friendRequestsSent: friendId }
    });

    if (!friend) {
      throw new NotFoundError('User not found');
    }

    friend.friendRequestsSent.filter((fr) => fr.toString() !== user._id.toString());
    await friend?.save();

    return updatedUser;
  }

  async removeFriend(userId: ObjectId, friendId: ObjectId) {
    const user = await this.findOne({ _id: userId });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const friend = await this.findOne({ _id: friendId });

    if (!friend) {
      throw new NotFoundError('User not found');
    }

    await this.partiallyUpdate((userId as unknown) as string, {
      $pull: { friends: friendId }
    });

    // await User.findByIdAndUpdate(userId, {
    //   friends: user.friends.filter((fr) => fr.username !== friend.username)
    // });

    user.friends.filter((fr) => fr.username !== friend.username);
    await user.save();
    friend.friends.filter((fr) => fr.toString() !== user.toString());
    await friend.save();

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
