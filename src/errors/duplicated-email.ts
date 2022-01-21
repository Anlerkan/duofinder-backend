import BaseCustomError from './base-custom-error';
import { SerializedError } from './types/serialized-error-output';

export default class DuplicatedEmail extends BaseCustomError {
  private statusCode = 422;

  private defaultErrorMessage = 'The email is already in the database';

  constructor() {
    super();

    Object.setPrototypeOf(this, DuplicatedEmail.prototype);
  }

  getStatusCode(): number {
    return this.statusCode;
  }

  serializeErrorOutput(): SerializedError {
    return {
      message: this.defaultErrorMessage,
      fields: {
        email: [this.defaultErrorMessage]
      }
    };
  }
}
