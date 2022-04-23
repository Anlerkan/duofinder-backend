import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ObjectId } from 'mongoose';

import { InvalidInput } from '../errors';
import Unauthorized from '../errors/unauthorized';
import { UserDocument, UserResponse } from '../models';
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
