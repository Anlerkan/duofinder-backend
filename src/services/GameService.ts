import { Game, GameDocument } from '../models';
import BaseService from './BaseService';

class GameService extends BaseService<GameDocument> {
  constructor() {
    super(Game);
  }
}

const gameService = new GameService();

export default gameService;
