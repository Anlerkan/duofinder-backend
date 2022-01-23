import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { FilterQuery, Model, Document, UpdateQuery } from 'mongoose';
import PaginatedResultEvent from '../events/paginated-result';
import { PaginationParams } from '../utils/pagination/paginationTypes';

abstract class BaseService<T extends Document<unknown>> {
  Model: Model<T>;

  constructor(model: Model<T>) {
    this.Model = model;
  }

  async getAll(select?: string) {
    return this.Model.find({}).select(select);
  }

  async findOne(options: FilterQuery<T>, select?: string): Promise<T | null> {
    return this.Model.findOne(options).select(select);
  }

  async create(data: Partial<T>): Promise<T> {
    return this.Model.create(data);
  }

  async update(id: string, options: FilterQuery<T>): Promise<T | null> {
    return this.Model.findByIdAndUpdate(id, options, { new: true, runValidators: true });
  }

  async partiallyUpdate(id: string | ObjectId, payload: UpdateQuery<T>): Promise<T | null> {
    return this.Model.findByIdAndUpdate(id, { ...payload }, { new: true, runValidators: true });
  }

  async delete(id: string | ObjectId): Promise<T | null> {
    return this.Model.findByIdAndDelete(id);
  }

  async getPaginatedResult(
    params: PaginationParams,
    req: Request,
    searchKey: keyof T,
    select?: string
  ): Promise<{ items: T[]; paginatedResultEvent: PaginatedResultEvent<T> }> {
    const { limit, offset, ordering, search } = params;

    const items = await this.Model.find({
      [searchKey]: new RegExp(search || '', 'i')
    } as FilterQuery<T>)
      .limit(limit)
      .skip(offset)
      .sort(ordering)
      .select(select);

    const paginatedResultEvent = new PaginatedResultEvent<T>({
      items,
      count: await this.Model.countDocuments({
        [searchKey]: new RegExp(search || '', 'i')
      } as FilterQuery<T>),
      offset,
      limit,
      req,
      search
    });

    return { items, paginatedResultEvent };
  }
}

export default BaseService;
