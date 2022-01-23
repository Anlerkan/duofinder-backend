import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { InvalidInput } from '../errors';
import NotFoundError from '../errors/not-found';
import gameService from '../services/GameService';
import { getPaginationParamsFromRequest } from '../utils/pagination/getPaginationParamsFromRequest';

export async function getGames(req: Request, res: Response) {
  const { limit, offset, search, ordering } = getPaginationParamsFromRequest(req);

  const { paginatedResultEvent } = await gameService.getPaginatedResult(
    { limit, offset, search, ordering },
    req,
    'name'
  );

  return res
    .status(paginatedResultEvent.getStatusCode())
    .send(paginatedResultEvent.serializeRest());
}

export async function addGame(req: Request, res: Response) {
  const errors = validationResult(req).array();

  if (errors.length > 0) {
    throw new InvalidInput(errors);
  }
  const { name, description, image, categories } = req.body;

  const newGame = await gameService.create({
    name,
    description,
    image,
    categories
  });

  return res.status(200).send(newGame);
}

export async function getGameById(req: Request, res: Response) {
  const game = await gameService.findOne({ id: req.params.id });

  if (!game) {
    throw new NotFoundError('Game not found');
  }

  return res.status(200).send(game);
}
