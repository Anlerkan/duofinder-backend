import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { InvalidInput } from '../errors';
import NotFoundError from '../errors/not-found';
import PaginatedResultEvent from '../events/paginated-result';
import Game from '../models/Game';
import { getPaginationParamsFromRequest } from '../utils/pagination/getPaginationParamsFromRequest';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function getGames(req: Request, res: Response) {
  const { limit, offset, search, ordering } = getPaginationParamsFromRequest(req);

  // TODO:  Refactor this regexp
  const games = await Game.find({ name: new RegExp(search || '', 'i') })
    .limit(limit)
    .skip(offset)
    .sort(ordering);

  const paginatedResultEvent = new PaginatedResultEvent({
    items: games,
    count: await Game.countDocuments({ name: new RegExp(search || '', 'i') }),
    offset,
    limit,
    req,
    search
  });

  return res
    .status(paginatedResultEvent.getStatusCode())
    .send(paginatedResultEvent.serializeRest());
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function addGame(req: Request, res: Response) {
  const errors = validationResult(req).array();

  if (errors.length > 0) {
    throw new InvalidInput(errors);
  }

  const { name, description, image, categories } = req.body;

  const newGame = await Game.create({
    name,
    description,
    image,
    categories
  });

  return res.status(200).send(newGame);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function getGameById(req: Request, res: Response) {
  // TODO: Improve this approach, what if this service call fails because of another reason?
  try {
    const game = await Game.findById(req.params.id);

    return res.status(200).send(game);
  } catch (error) {
    throw new NotFoundError('Game not found');
  }
}
