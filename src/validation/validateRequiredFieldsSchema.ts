import { body, ValidationChain } from 'express-validator';

function validateRequiredFieldsSchema(fields: string[]): ValidationChain {
  return body(fields).trim().notEmpty().withMessage('This field is required');
}

export default validateRequiredFieldsSchema;
