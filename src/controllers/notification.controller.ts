import { Request, Response } from 'express';
import { ObjectId } from 'mongoose';

import userService from '../services/UserService';
import { getPaginationParamsFromRequest } from '../utils/pagination/getPaginationParamsFromRequest';

export async function getCurrentUserNotifications(req: Request, res: Response) {
  const { paginatedResultEvent } = await userService.getNotifications(
    (req.userId! as unknown) as ObjectId,
    getPaginationParamsFromRequest(req),
    req
  );

  return res
    .status(paginatedResultEvent.getStatusCode())
    .send(paginatedResultEvent.serializeRest());
}
