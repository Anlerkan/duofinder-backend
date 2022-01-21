import BaseCustomError from './base-custom-error';
import { SerializedError } from './types/serialized-error-output';

export default class NotFoundError extends BaseCustomError {
  private statusCode = 404;

  private errorMessage = 'Not found.';

  constructor(errorMessage?: string) {
    super();

    if (errorMessage) {
      this.errorMessage = errorMessage;
    }

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  getStatusCode(): number {
    return this.statusCode;
  }

  serializeErrorOutput(): SerializedError {
    return {
      message: this.errorMessage
    };
  }
}
