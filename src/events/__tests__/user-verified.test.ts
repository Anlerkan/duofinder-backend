import { User } from '../../models';
import UserVerified from '../user-verified';

it('should expose only the id of the user when serializing to REST', async () => {
  const user = await User.create({
    email: 'test@test.com',
    password: 'Valid123',
    username: 'anlerkan'
  });

  const userVerifiedEvent = new UserVerified(user);
  const serializedResponse = userVerifiedEvent.serializeRest();

  expect(Object.keys(serializedResponse).sort()).toEqual(['id', 'verificationStatus'].sort());
  expect(userVerifiedEvent.getStatusCode()).toEqual(200);
});
