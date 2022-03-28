import { Game, GameDocument } from '../models';
import BaseService from './BaseService';

class GameService extends BaseService<GameDocument> {
  constructor() {
    super(Game, undefined, { path: 'categories' });
  }
}

const gameService = new GameService();

export default gameService;
