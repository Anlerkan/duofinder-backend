import { Request } from 'express';

export interface PaginationParams {
  offset: number;
  limit: number;
  search?: string;
  ordering?: string;
}

export interface PaginatedResult<T> {
  count: number;
  results: T[];
  next: null | string;
  previous: null | string;
}

export type SerializePaginationResultProps<T> = PaginationProps & {
  items: T[];
  count: number;
  req: Request;
};
