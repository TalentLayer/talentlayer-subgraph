import { DataSourceContext } from '@graphprotocol/graph-ts'
import { User } from '../../generated/schema'
import { Approval, ApprovalForAll, Mint, Transfer } from '../../generated/TalentLayerReview/TalentLayerReview'
import { getOrCreatePlatform, getOrCreateReview } from '../getters'
import { ONE } from '../constants'
import { ReviewData } from '../../generated/templates'

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleMint(event: Mint): void {
  const review = getOrCreateReview(event.params._tokenId, event.params._serviceId, event.params._toId)
  review.uri = event.params._reviewUri
  const platform = getOrCreatePlatform(event.params._platformId)
  review.platform = platform.id
  review.createdAt = event.block.timestamp
  review.save()

  let user = User.load(event.params._toId.toString())
  if (!user) return
  const rating = user.rating
    .times(user.numReviews.toBigDecimal())
    .plus(event.params._rating.toBigDecimal())
    .div(user.numReviews.plus(ONE).toBigDecimal())
  user.rating = rating
  user.numReviews = user.numReviews.plus(ONE)
  user.save()

  const context = new DataSourceContext();
  context.setString('id', review.id)
  context.setBigInt('timestamp', review.createdAt!)
  ReviewData.createWithContext(review.uri, context)
}

export function handleTransfer(event: Transfer): void {}
