import { AccountVerification, AccountVerificationDocument } from '../models';
import BaseService from './BaseService';

class AccountVerificationService extends BaseService<AccountVerificationDocument> {
  constructor() {
    super(AccountVerification);
  }
}

const accountVerificationService = new AccountVerificationService();

export default accountVerificationService;
