// import { BigInt } from '@graphprotocol/graph-ts';
import {
  Approval,
  ApprovalForAll,
  Mint,
  Transfer,
} from '../../generated/TalentLayerReview/TalentLayerReview';
// import { createAndGetReview } from '../getters';

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleMint(event: Mint): void {
  // let review = createAndGetReview(event.params._review);
  // review = new Review(address.toHex());
  // review.jobId = ZERO;
  // review.toId = ZERO;
  // review.tokenId = ZERO;
  // review.reviewUri = '';
  // review.save();
}

export function handleTransfer(event: Transfer): void {}
