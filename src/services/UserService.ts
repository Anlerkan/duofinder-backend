import { User, UserDocument } from '../models';
import BaseService from './BaseService';

class UserService extends BaseService<UserDocument> {
  constructor() {
    super(User, '-password', { path: 'games', select: '-password' });
  }
}

const userService = new UserService();

export default userService;
