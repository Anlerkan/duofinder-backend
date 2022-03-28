import mongoose, { UpdateQuery } from 'mongoose';

import { PasswordHash } from '../utils';
import { IGame } from './Game';

export type IUser = {
  email: string;
  password: string;
  username: string;
  isAdmin: boolean;
  games: IGame[];
  nextOnboardingStep: 'personal-info' | 'connect-platforms' | 'select-games' | 'complete';
  isVerified?: boolean;
  bio?: string;
  avatar?: string;
};

export type UserDocument = mongoose.Document & IUser;

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
  nextOnboardingStep: {
    type: String,
    required: true,
    default: 'personal-info'
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
  ],
  bio: {
    type: String,
    default: '',
    required: false
  }
});

function hashPassword(newPassword: string): string {
  const hashedPassword = PasswordHash.toHashSync({ password: newPassword });

  return hashedPassword;
}

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
