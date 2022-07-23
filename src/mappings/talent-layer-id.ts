import { BigInt } from '@graphprotocol/graph-ts';
import {
  Approval,
  ApprovalForAll,
  ConsecutiveTransfer,
  Mint,
  OwnershipTransferred,
  Transfer,
} from '../../generated/TalentLayerID/TalentLayerID';
import { createAndGetUser } from '../getters';

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleConsecutiveTransfer(event: ConsecutiveTransfer): void {}

export function handleMint(event: Mint): void {
  let user = createAndGetUser(event.params._user);
  user.userTokenId = event.params._tokenId;
  user.handle = event.params._handle;
  user.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleTransfer(event: Transfer): void {}
