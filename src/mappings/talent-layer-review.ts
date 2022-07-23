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
<<<<<<< HEAD
  let review = createAndGetReview(event.params._tokenId, event.params._toId);
  review.jobId = event.params._jobId;
<<<<<<< HEAD
  // review.toId = event.params._toId.toString();
=======
>>>>>>> f1ae20d (convert Review toId to User, add reviews reverse lookup)
=======
  let review = createAndGetReview(
    event.params._tokenId,
    event.params._jobId,
    event.params._toId
  );
>>>>>>> 1f81317 (convert jobId on Review to Job, removed generated folder)
  review.uri = event.params._reviewUri;
  review.save();
}

export function handleTransfer(event: Transfer): void {}
