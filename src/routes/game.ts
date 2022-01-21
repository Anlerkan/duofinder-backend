import express from 'express';
import { body } from 'express-validator';

import { addGame, getGameById, getGames } from '../controllers/game.controller';
import { requireAdmin, validateToken } from '../middlewares';
import { GAMES_ROUTE, GAME_DETAIL_ROUTE } from './route-defs';

const gamesRouter = express.Router();

gamesRouter.post(
  GAMES_ROUTE,
  [
    body('name')
      .not()
      .isEmpty({ ignore_whitespace: true })
      .withMessage('Name field may not be blank.'),
    body('description')
      .not()
      .isEmpty({ ignore_whitespace: true })
      .withMessage('Description field may not be blank.'),
    validateToken,
    requireAdmin
  ],
  addGame
);
gamesRouter.get(GAMES_ROUTE, getGames);
gamesRouter.get(GAME_DETAIL_ROUTE, getGameById);

export default gamesRouter;
