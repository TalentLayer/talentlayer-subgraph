import { Address, ethereum } from '@graphprotocol/graph-ts';
import { User } from '../generated/schema';
import { ZERO } from './constants';

export function createAndGetUser(address: Address): User {
  let user = User.load(address.toHex());
  if (!user) {
    user = new User(address.toHex());
    user.userTokenId = ZERO;
    user.handle = '';
    user.save();
  }
  return user;
}
