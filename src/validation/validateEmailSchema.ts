import { body, ValidationChain } from 'express-validator';

function validateEmailSchema(): ValidationChain {
  return body('email').isEmail().withMessage('Email must be in a valid format').normalizeEmail();
}

export default validateEmailSchema;
