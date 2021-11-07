import { Request } from 'express';

import { PaginationParams } from './paginationTypes';

function getPaginationParamsFromRequest(req: Request): PaginationParams {
  const {
    limit: queryLimit,
    offset: queryOffset,
    search: querySearch,
    ordering: queryOrdering
  } = req.query;

  const limit = parseInt(queryLimit as string, 10);
  const offset = parseInt(queryOffset as string, 10);
  const search = querySearch as string;
  const ordering = queryOrdering as string;

  return {
    limit,
    offset,
    search,
    ordering
  };
}

export { getPaginationParamsFromRequest };
