import BaseCustomError from './base-custom-error';
import { SerializedError } from './types/serialized-error-output';

export default class Unauthorized extends BaseCustomError {
  private statusCode = 401;

  private defaultErrorMessage = 'User is not authenticated.';

  constructor() {
    super();

    Object.setPrototypeOf(this, Unauthorized.prototype);
  }

  getStatusCode(): number {
    return this.statusCode;
  }

  serializeErrorOutput(): SerializedError {
    return {
      message: this.defaultErrorMessage
    };
  }
}
