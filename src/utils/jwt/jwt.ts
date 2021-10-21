import { sign } from 'jsonwebtoken';

import { UserDocument } from '../../models';

export type CreateTokenArgs = {
  user: UserDocument;
};

export default class Jwt {
  static createToken(args: CreateTokenArgs): string {
    const { user } = args;

    return sign({ id: user._id }, process.env.SESSION_TOKEN_SECRET!, {
      expiresIn: '2days'
    });
  }
}
