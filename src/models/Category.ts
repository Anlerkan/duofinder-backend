import mongoose, { UpdateQuery } from 'mongoose';
import { InvalidInput } from '../errors';

export type CategoryDocument = mongoose.Document & {
  name: string;
  description: string;
};

export type CategoryModel = mongoose.Model<CategoryDocument>;

const categoryScheme = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  }
});

async function validateUniqueness(categoryDoc: CategoryDocument) {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const existingCategory = await Category.findOne({ name: categoryDoc.name });
  // eslint-disable-next-line @typescript-eslint/no-use-before-define

  if (existingCategory) {
    throw new InvalidInput([
      {
        value: categoryDoc.name,
        location: 'body',
        param: 'name',
        msg: `Category with name ${categoryDoc.name} is already exists.`
      }
    ]);
  }
}

categoryScheme.pre('save', async function preValidateUniqueness(this: CategoryDocument) {
  await validateUniqueness(this);
});

categoryScheme.pre(
  /^.*([Uu]pdate).*$/,
  async function preValidateUniqueness(this: UpdateQuery<CategoryDocument>) {
    await validateUniqueness(this._update);
  }
);

const Category = mongoose.model<CategoryDocument, CategoryModel>('Category', categoryScheme);

export default Category;
