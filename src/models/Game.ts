import mongoose, { UpdateQuery } from 'mongoose';

import { InvalidInput } from '../errors';
import { CategoryDocument } from './Category';

export type GameDocument = mongoose.Document & {
  name: string;
  description: string;
  image: string;
  categories: CategoryDocument[];
};

export type GameModel = mongoose.Model<GameDocument>;

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  image: {
    type: String,
    required: false
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }
  ]
});

async function validateUniqueness(gameDoc: GameDocument) {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const existingGame = await Game.findOne({ name: gameDoc.name });
  // eslint-disable-next-line @typescript-eslint/no-use-before-define

  if (existingGame) {
    throw new InvalidInput([
      {
        value: gameDoc.name,
        location: 'body',
        param: 'name',
        msg: `Game with name ${gameDoc.name} is already exists.`
      }
    ]);
  }
}

gameSchema.pre('save', async function preValidateUniqueness(this: GameDocument) {
  await validateUniqueness(this);
});

gameSchema.pre(
  /^.*([Uu]pdate).*$/,
  async function preValidateUniqueness(this: UpdateQuery<GameDocument>) {
    await validateUniqueness(this._update);
  }
);

const Game = mongoose.model<GameDocument, GameModel>('Game', gameSchema);

export default Game;
