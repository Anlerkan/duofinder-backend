import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { InvalidInput } from '../errors';
import Unauthorized from '../errors/unauthorized';
import PaginatedResultEvent from '../events/paginated-result';
import { User, UserDocument } from '../models';
import { getPaginationParamsFromRequest } from '../utils/pagination/getPaginationParamsFromRequest';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function getLoggedInUser(req: Request, res: Response) {
  const errors = validationResult(req).array();
  const user = await User.findById(req.userId).select('-password');

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
  const user = await User.findOne({ username: req.params.username }).select('-password');

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

export async function updateUser(req: Request, res: Response): Promise<Response<UserDocument>> {
  const user = await User.findByIdAndUpdate(req.userId, req.body, { new: true });

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

export async function getUsers(req: Request, res: Response): Promise<Response<UserDocument[]>> {
  const { limit, offset, search, ordering } = getPaginationParamsFromRequest(req);

  const users = await User.find({ username: new RegExp(search || '', 'i') })
    .limit(limit)
    .skip(offset)
    .sort(ordering);

  const paginatedResultEvent = new PaginatedResultEvent({
    items: users,
    count: await User.countDocuments({ username: new RegExp(search || '', 'i') }),
    offset,
    limit,
    req,
    search
  });

  return res
    .status(paginatedResultEvent.getStatusCode())
    .send(paginatedResultEvent.serializeRest());
}

export async function changeCurrentUserPassword(
  req: Request,
  res: Response
): Promise<Response<UserDocument>> {
  const errors = validationResult(req).array();
  const user = await User.findById(req.userId);
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
