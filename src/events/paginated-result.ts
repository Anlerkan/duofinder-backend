import { BaseEvent } from './base-event';
import { serializePaginationResult } from '../utils/pagination/serializePaginationResult';
import {
  PaginatedResult,
  SerializePaginationResultProps
} from '../utils/pagination/paginationTypes';

export default class PaginatedResultEvent<T> extends BaseEvent<PaginatedResult<T>> {
  private statusCode = 200;

  private paginationProps: SerializePaginationResultProps<T>;

  constructor(paginationProps: SerializePaginationResultProps<T>) {
    super();

    this.paginationProps = paginationProps;
  }

  getStatusCode(): number {
    return this.statusCode;
  }

  serializeRest(): PaginatedResult<T> {
    return serializePaginationResult({ ...this.paginationProps });
  }
}
