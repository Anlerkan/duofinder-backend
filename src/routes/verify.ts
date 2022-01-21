import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

import { VERIFY_ROUTE } from './route-defs';
import { verifyUser } from '../controllers/auth.controller';

export const verifyRouter = express.Router();

verifyRouter.post(
  VERIFY_ROUTE,
  [body('emailVerificationToken').trim().isLength({ min: 64, max: 64 })],
  verifyUser
);

export default verifyRouter;
