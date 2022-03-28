import express from 'express';
import { body } from 'express-validator';
import { addCategory, getCategories } from '../controllers/category.controller';

import { requireAdmin, validateToken } from '../middlewares';
import { CATEGORIES_ROUTE } from './route-defs';

const categoriesRouter = express.Router();

categoriesRouter.post(
  CATEGORIES_ROUTE,
  [
    body('name')
      .not()
      .isEmpty({ ignore_whitespace: true })
      .withMessage('Name field may not be blank.'),
    body('description')
      .not()
      .isEmpty({ ignore_whitespace: true })
      .withMessage('Description field may not be blank.'),
    validateToken,
    requireAdmin
  ],
  addCategory
);
categoriesRouter.get(CATEGORIES_ROUTE, getCategories);

export default categoriesRouter;
