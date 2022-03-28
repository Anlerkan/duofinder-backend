import { BaseEvent } from './base-event';
import { IUser, UserDocument } from '../models/User';
import { omitKeys } from '../utils/object/objectUtils';

export type UserLoggedInRestPayload = Omit<IUser, 'password'>;

export default class UserLoggedIn extends BaseEvent<UserLoggedInRestPayload> {
  private user: UserDocument;

  private statusCode = 200;

  constructor(user: UserDocument) {
    super();
    this.user = user;
  }

  getStatusCode(): number {
    return this.statusCode;
  }

  serializeRest(): UserLoggedInRestPayload {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore DADAF
    return omitKeys(this.user.toObject(), 'password');
  }
}
