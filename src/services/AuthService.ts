import { User, UserDocument } from '../models';
import BaseService from './BaseService';

class AuthService extends BaseService<UserDocument> {
  constructor() {
    super(User, undefined, { path: 'games' });
  }
}

const authService = new AuthService();

export default authService;
