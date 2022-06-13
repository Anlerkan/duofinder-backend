import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ObjectId } from 'mongoose';

import { InvalidInput, NotFoundError } from '../errors';
import Unauthorized from '../errors/unauthorized';
import { Post, UserDocument, UserResponse, Message, Conversation } from '../models';
import postService from '../services/PostService';
import userService from '../services/UserService';
import { getPaginationParamsFromRequest } from '../utils/pagination/getPaginationParamsFromRequest';

export async function getLoggedInUser(
  req: Request,
  res: Response
): Promise<Response<UserResponse>> {
  const errors = validationResult(req).array();
  const user = await userService.findOne({ _id: req.userId });

  if (errors.length > 0) {
    throw new InvalidInput(errors);
  }

  if (!user) {
    throw new Unauthorized();
  }

  return res.status(200).send(user);
}

export async function getUserByUsername(
  req: Request,
  res: Response
): Promise<Response<UserDocument>> {
  const user = await userService.findOne({ username: req.params.username });
  if (!user) {
    throw new InvalidInput([
      {
        location: 'params',
        value: req.params.username,
        param: 'username',
        msg: 'User was not found.'
      }
    ]);
  }

  return res.status(200).send(user);
}

export async function updateAuthUser(req: Request, res: Response): Promise<Response<UserDocument>> {
  const updatedUser = await userService.update(req.userId!, req.body);
  const errors = validationResult(req).array();

  if (!updatedUser) {
    errors.push({
      location: 'params',
      value: req.params.username,
      param: 'username',
      msg: 'User was not found.'
    });
  }

  if (errors.length > 0) {
    throw new InvalidInput(errors);
  }

  return res.status(200).send(updatedUser);
}

export async function partiallyUpdateAuthUser(
  req: Request,
  res: Response
): Promise<Response<UserDocument>> {
  const errors = validationResult(req).array();
  const updatedUser = await userService.partiallyUpdate(req.userId!, req.body);

  if (!updatedUser) {
    errors.push({
      location: 'params',
      value: req.params.username,
      param: 'username',
      msg: 'User was not found.'
    });
  }

  if (errors.length > 0) {
    throw new InvalidInput(errors);
  }

  return res.status(200).send(updatedUser);
}

// eslint-disable-next-line consistent-return
export async function getUsers(
  req: Request,
  res: Response
): Promise<Response<UserDocument[]> | undefined> {
  const { limit, offset, search, ordering } = getPaginationParamsFromRequest(req);

  const { paginatedResultEvent } = await userService.getPaginatedResult(
    { limit, offset, ordering, search },
    req,
    'username'
  );

  return res
    .status(paginatedResultEvent.getStatusCode())
    .send(paginatedResultEvent.serializeRest());
}

export async function changeCurrentUserPassword(
  req: Request,
  res: Response
): Promise<Response<UserDocument>> {
  const errors = validationResult(req).array();
  const user = await userService.findOne({ _id: req.userId });
  const { oldPassword, password } = req.body;

  if (!user) {
    errors.push({
      location: 'params',
      value: req.params.username,
      param: 'username',
      msg: 'User was not found.'
    });
  }

  if (user && oldPassword !== user.password) {
    errors.push({
      location: 'body',
      value: req.body.password,
      param: 'password',
      msg: 'Old password is incorrect.'
    });
  }

  if (errors.length > 0) {
    throw new InvalidInput(errors);
  }

  user!.password = password;
  user!.save();

  return res.status(200).send(user);
}

export async function getFriendRequestsReceived(
  req: Request,
  res: Response
): Promise<Response<UserDocument[]>> {
  const friendRequests = await userService.getFriendRequestsReceived(req.userId!);

  return res.status(200).send(friendRequests);
}

export async function getFriendRequestsSent(
  req: Request,
  res: Response
): Promise<Response<UserDocument[]>> {
  const friendRequests = await userService.getFriendRequestsSent(req.userId!);

  return res.status(200).send(friendRequests);
}

export async function getCurrentUserFriends(
  req: Request,
  res: Response
): Promise<Response<UserDocument[]>> {
  const { paginatedResultEvent } = await userService.getFriends(
    req.userId!,
    getPaginationParamsFromRequest(req),
    req
  );

  return res
    .status(paginatedResultEvent.getStatusCode())
    .send(paginatedResultEvent.serializeRest());
}

export async function sendFriendRequest(
  req: Request,
  res: Response
): Promise<Response<UserDocument>> {
  const newUser = await userService.sendFriendRequest(
    (req.userId! as unknown) as ObjectId,
    (req.params.id as unknown) as ObjectId
  );

  return res.status(200).send(newUser);
}

export async function acceptFriendRequest(
  req: Request,
  res: Response
): Promise<Response<UserDocument>> {
  const newUser = await userService.acceptFriendRequest(
    (req.userId! as unknown) as ObjectId,
    (req.params.id as unknown) as ObjectId
  );

  return res.status(200).send(newUser);
}

export async function rejectFriendRequest(
  req: Request,
  res: Response
): Promise<Response<UserDocument>> {
  const newUser = await userService.rejectFriendRequest(
    (req.userId! as unknown) as ObjectId,
    (req.params.id as unknown) as ObjectId
  );

  return res.status(200).send(newUser);
}

export async function removeFriendRequest(req: Request, res: Response) {
  const newUser = await userService.removeFriendRequest(
    (req.userId! as unknown) as ObjectId,
    (req.params.id as unknown) as ObjectId
  );

  return res.status(200).send(newUser);
}

export async function removeFriend(req: Request, res: Response) {
  const newUser = await userService.removeFriend(
    (req.userId! as unknown) as ObjectId,
    (req.params.id as unknown) as ObjectId
  );

  return res.status(200).send(newUser);
}

export async function getRecommendedUsers(
  req: Request,
  res: Response
): Promise<Response<UserDocument[]>> {
  const { paginatedResultEvent } = await userService.getRecommendedUsers(
    (req.userId! as unknown) as ObjectId,
    getPaginationParamsFromRequest(req),
    req
  );

  return res
    .status(paginatedResultEvent.getStatusCode())
    .send(paginatedResultEvent.serializeRest());
}

export async function sendMessage(req: Request, res: Response) {
  const { content } = req.body;
  const { id: receiverId } = req.params;

  let conversation;

  const existingConversation = await Conversation.findOne({
    members: {
      $all: [req.userId, receiverId]
    }
  });

  if (existingConversation) {
    conversation = existingConversation;
  } else {
    const newConversation = await Conversation.create({
      members: [req.userId, receiverId]
    });

    conversation = newConversation;
  }

  const newMessage = await Message.create({
    conversationId: conversation._id,
    createdBy: req.userId,
    content
  });

  const message = await Message.findOne({
    _id: newMessage._id
  }).populate('createdBy');

  return res.status(201).send(message);
}

export async function getMessagesByUser(req: Request, res: Response) {
  const { id: senderId } = req.params;

  try {
    const relatedConversation = await Conversation.findOne({
      members: {
        $all: [senderId, req.userId]
      }
    });

    if (!relatedConversation) {
      throw new NotFoundError('Conversation not found.');
    }

    const messages = await Message.find({
      conversationId: relatedConversation._id
    })
      .sort({ createdAt: -1 })
      .populate('createdBy');

    return res.status(200).send(messages);
  } catch (err) {
    throw new NotFoundError('Conversation not found.');
  }
}
