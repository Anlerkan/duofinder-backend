import { BaseEvent } from './base-event';
import { UserDocument } from '../models/User';

export type UserLoggedInRestPayload = UserDocument;

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
    return this.user;
  }
}
