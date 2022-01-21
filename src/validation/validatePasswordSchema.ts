import { body, ValidationChain } from 'express-validator';

function validatePasswordSchema(): ValidationChain {
  return body('password')
    .trim()
    .isLength({ min: 8, max: 32 })
    .withMessage('Password must be between 8 and 32 characters')
    .matches(/^(.*[a-z].*)$/)
    .withMessage('Password must contain at least one lower-case letter')
    .matches(/^(.*[A-Z].*)$/)
    .withMessage('Password must contain at least one upper-case letter')
    .matches(/^(.*\d.*)$/)
    .withMessage('Password must contain at least one digit')
    .escape();
}

export default validatePasswordSchema;
