import BaseCustomError from './base-custom-error';
import { SerializedErrorOutput } from './types/serialized-error-output';

export default class DuplicatedUsername extends BaseCustomError {
  private statusCode = 422;

  private defaultErrorMessage = 'The username is already in the database';

  constructor() {
    super();

    Object.setPrototypeOf(this, DuplicatedUsername.prototype);
  }

  getStatusCode(): number {
    return this.statusCode;
  }

  serializeErrorOutput(): SerializedErrorOutput {
    return {
      errors: [
        {
          message: this.defaultErrorMessage
        }
      ]
    };
  }
}
