import Category, { CategoryDocument } from '../models/Category';
import BaseService from './BaseService';

class CategoryService extends BaseService<CategoryDocument> {
  constructor() {
    super(Category);
  }
}

const categoryService = new CategoryService();

export default categoryService;
