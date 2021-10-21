import { Request } from 'express';

export interface PaginatedResult<T> {
  count: number;
  results: T[];
  next: null | string;
  previous: null | string;
}

export interface SerializePaginationResultProps<T> {
  items: T[];
  count: number;
  offset: number;
  limit: number;
  req: Request;
  search?: string;
}
