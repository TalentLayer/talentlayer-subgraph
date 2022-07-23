// import { BigInt } from '@graphprotocol/graph-ts';
import {
  Approval,
  ApprovalForAll,
  Mint,
  Transfer,
} from '../../generated/TalentLayerReview/TalentLayerReview';
import { createAndGetReview } from '../getters';

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleMint(event: Mint): void {
  let review = createAndGetReview(event.params._tokenId, event.params._toId);
  review.jobId = event.params._jobId;
  // review.toId = event.params._toId.toString();
  review.uri = event.params._reviewUri;
  review.save();
}

export function handleTransfer(event: Transfer): void {}
