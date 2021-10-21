import { Request } from 'express';
import { generateBaseUrlByRequest } from '../network/generateBaseUrlByRequest';

import { PaginatedResult, SerializePaginationResultProps } from './paginationTypes';

function generatePaginationUrl<T>(
  totalCount: number,
  offset: number,
  limit: number,
  req: Request,
  search?: string
): Pick<PaginatedResult<T>, 'next' | 'previous'> {
  let next = null;
  let previous = null;

  const baseUrl = generateBaseUrlByRequest(req);

  if (totalCount >= offset && offset + limit >= 0 && offset > 0) {
    previous = `${baseUrl}/posts?offset=${offset - limit < 0 ? 0 : offset - limit}&limit=${limit}${
      search ? `&search=${search}` : ''
    }`;
  }

  if (totalCount > limit + offset) {
    next = `${baseUrl}/posts?offset=${offset + limit}&limit=${limit}${
      search ? `&search=${search}` : ''
    }`;
  }

  return { next, previous };
}

export function serializePaginationResult<T>({
  items,
  count,
  offset,
  limit,
  search,
  req
}: SerializePaginationResultProps<T>): PaginatedResult<T> {
  return {
    results: items,
    count,
    ...generatePaginationUrl<T>(count, offset, limit, req, search)
  };
}
