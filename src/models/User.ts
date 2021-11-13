import mongoose, { UpdateQuery } from 'mongoose';

import { DuplicatedEmail } from '../errors';
import DuplicatedUsername from '../errors/duplicated-username';
import { PasswordHash } from '../utils';
import { GameDocument } from './Game';

export type UserDocument = mongoose.Document & {
  email: string;
  password: string;
  username: string;
  isAdmin: boolean;
  games: GameDocument[];
  isVerified?: boolean;
};

export type UserModel = mongoose.Model<UserDocument>;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: false
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  games: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      default: []
    }
  ]
});

async function validateUniqueness(userDoc: UserDocument) {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const existingEmail = await User.findOne({ email: userDoc.email });
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const existingUsername = await User.findOne({ username: userDoc.username });

  const { isVerified } = userDoc;

  if (existingEmail && !isVerified) {
    throw new DuplicatedEmail();
  }

  if (existingUsername && !isVerified) {
    throw new DuplicatedUsername();
  }
}

function hashPassword(newPassword: string): string {
  const hashedPassword = PasswordHash.toHashSync({ password: newPassword });

  return hashedPassword;
}

userSchema.pre('save', async function preValidateUniqueness(this: UserDocument) {
  await validateUniqueness(this);
});

userSchema.pre(
  /^.*([Uu]pdate).*$/,
  async function preValidateUniqueness(this: UpdateQuery<UserDocument>) {
    await validateUniqueness(this._update);
  }
);

userSchema.pre('save', async function setIsVerifiedToFalseOnFirstSave(this: UserDocument) {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const existingUser = await User.findOne({ email: this.email });

  if (!existingUser) {
    this.set('isVerified', false);
  }
});

userSchema.pre('save', function preHashPassword(this: UserDocument) {
  const newPassword = this.isModified('password') ? this.get('password') : null;

  if (newPassword) {
    this.set('password', hashPassword(newPassword));
  }
});

userSchema.pre(/^.*([Uu]pdate).*$/, function preHashPassword(this: UpdateQuery<UserDocument>) {
  const newPassword = this._update.password || null;

  if (newPassword) {
    this._update.password = hashPassword(newPassword);
  }
});

const User = mongoose.model<UserDocument, UserModel>('User', userSchema);

export default User;
