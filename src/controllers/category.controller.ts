import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { InvalidInput } from '../errors';
import categoryService from '../services/CategoryService';

import { getPaginationParamsFromRequest } from '../utils/pagination/getPaginationParamsFromRequest';

export async function getCategories(req: Request, res: Response) {
  const { limit, offset, search, ordering } = getPaginationParamsFromRequest(req);

  const { paginatedResultEvent } = await categoryService.getPaginatedResult(
    { limit, offset, search, ordering },
    req,
    'name'
  );

  return res
    .status(paginatedResultEvent.getStatusCode())
    .send(paginatedResultEvent.serializeRest());
}

export async function addCategory(req: Request, res: Response) {
  const errors = validationResult(req).array();

  if (errors.length > 0) {
    throw new InvalidInput(errors);
  }
  const { name, description } = req.body;

  const newCategory = await categoryService.create({
    name,
    description
  });

  return res.status(200).send(newCategory);
}
