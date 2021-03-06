import { ValidationError } from 'express-validator';

import BaseCustomError from './base-custom-error';
import { SerializedErrorField, SerializedError } from './types/serialized-error-output';

export type InvalidInputConstructorErrorsParam = ValidationError[];

export default class InvalidInput extends BaseCustomError {
  private readonly errors: ValidationError[] | undefined;

  private statusCode = 422;

  private defaultErrorMessage = 'User input is not valid';

  serializedErrorOutput = undefined;

  constructor(errors?: InvalidInputConstructorErrorsParam) {
    super('User input is not valid');
    this.errors = errors;

    Object.setPrototypeOf(this, InvalidInput.prototype);
  }

  getStatusCode(): number {
    return this.statusCode;
  }

  serializeErrorOutput(): SerializedError {
    return this.parseValidationErrors();
  }

  private parseValidationErrors(): SerializedError {
    const parsedErrors: SerializedErrorField = {};

    if (this.errors && this.errors.length > 0) {
      this.errors.forEach((error) => {
        if (parsedErrors[error.param]) {
          parsedErrors[error.param].push(error.msg);
        } else {
          parsedErrors[error.param] = [error.msg];
        }
      });
    }

    return {
      message: this.defaultErrorMessage,
      fields: parsedErrors
    };
  }
}
