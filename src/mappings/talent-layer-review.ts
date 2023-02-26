import { DataSourceContext } from '@graphprotocol/graph-ts'
import { User } from '../../generated/schema'
import { Approval, ApprovalForAll, Mint, Transfer } from '../../generated/TalentLayerReview/TalentLayerReview'
import { getOrCreateReview } from '../getters'
import { ONE } from '../constants'
import { ReviewData } from '../../generated/templates'

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleMint(event: Mint): void {
  const review = getOrCreateReview(event.params._tokenId, event.params._serviceId, event.params._toId)
  review.rating = event.params._rating
  review.createdAt = event.block.timestamp
  review.cid = event.params._reviewUri

  let user = User.load(event.params._toId.toString())
  if (!user) return
  const rating = user.rating
    .times(user.numReviews.toBigDecimal())
    .plus(event.params._rating.toBigDecimal())
    .div(user.numReviews.plus(ONE).toBigDecimal())
  user.rating = rating
  user.numReviews = user.numReviews.plus(ONE)
  user.save()

  const cid = event.params._reviewUri
  const context = new DataSourceContext()
  context.setString('reviewId', review.id)

  ReviewData.createWithContext(cid, context)

  review.description = cid
  review.save()
}

export function handleTransfer(event: Transfer): void {}
