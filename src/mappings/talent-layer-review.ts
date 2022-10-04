import { User } from '../../generated/schema';
import {
  Approval,
  ApprovalForAll,
  Mint,
  Transfer,
} from '../../generated/TalentLayerReview/TalentLayerReview';
import { getOrCreateReview } from '../getters';
import { ONE } from '../constants';

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleMint(event: Mint): void {
  let review = getOrCreateReview(
    event.params._tokenId,
    event.params._jobId,
    event.params._toId
  );
  review.uri = event.params._reviewUri;
  review.save();

  let user = User.load(event.params._toId.toString());
  if (!user) return;
  let rating = user.rating
    .times(user.numReviews.toBigDecimal())
    .plus(event.params._rating.toBigDecimal())
    .div(user.numReviews.plus(ONE).toBigDecimal());
  user.rating = rating;
  user.numReviews = user.numReviews.plus(ONE);
  user.save();
}

export function handleTransfer(event: Transfer): void {}
