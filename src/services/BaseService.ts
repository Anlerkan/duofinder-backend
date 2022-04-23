import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { FilterQuery, Model, Document, UpdateQuery, PopulateOptions } from 'mongoose';
import PaginatedResultEvent from '../events/paginated-result';
import { PaginationParams } from '../utils/pagination/paginationTypes';

abstract class BaseService<T extends Document<unknown>> {
  Model: Model<T>;

  select: string | undefined = undefined;

  populate: PopulateOptions | PopulateOptions[] | undefined = undefined;

  constructor(model: Model<T>, select?: string, populate?: PopulateOptions | PopulateOptions[]) {
    this.Model = model;
    this.select = select;
    this.populate = populate;
  }

  async getAll(options: FilterQuery<T>) {
    return this.Model.find(options).populate(this.populate).select(this.select);
  }

  async findOne(options: FilterQuery<T>): Promise<T | null> {
    return this.Model.findOne(options).populate(this.populate).select(this.select);
  }

  async create(data: Partial<T>): Promise<T> {
    return this.Model.create(data);
  }

  async update(id: string, options: FilterQuery<T>): Promise<T | null> {
    return this.Model.findByIdAndUpdate(id, options, { new: true, runValidators: true })
      .populate(this.populate)
      .select(this.select);
  }

  async partiallyUpdate(id: string | ObjectId, payload: UpdateQuery<T>): Promise<T | null> {
    return this.Model.findByIdAndUpdate(id, { ...payload }, { new: true, runValidators: true })
      .populate(this.populate)
      .select(this.select);
  }

  async delete(id: string | ObjectId): Promise<T | null> {
    return this.Model.findByIdAndDelete(id);
  }

  async getPaginatedResult(
    params: PaginationParams,
    req: Request,
    searchKey: keyof T,
    filterQuery?: FilterQuery<T>
  ): Promise<{ items: T[]; paginatedResultEvent: PaginatedResultEvent<T> }> {
    const { limit, offset, ordering, search } = params;

    const items = await this.Model.find({
      [searchKey]: new RegExp(search || '', 'i'),
      ...filterQuery
    } as FilterQuery<T>)
      .populate(this.populate)
      .limit(limit)
      .skip(offset)
      .sort(ordering)
      .select(this.select);

    const paginatedResultEvent = new PaginatedResultEvent<T>({
      items,
      count: await this.Model.countDocuments({
        [searchKey]: new RegExp(search || '', 'i'),
        ...filterQuery
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
