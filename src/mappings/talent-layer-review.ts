import { BigInt, DataSourceContext } from '@graphprotocol/graph-ts'
import { User } from '../../generated/schema'
import {
  Approval,
  ApprovalForAll,
  Mint,
  Mint1 as MintV1,
  Transfer,
} from '../../generated/TalentLayerReview/TalentLayerReview'
import {
  getOrCreateReview,
  getOrCreateReviewV1,
  getOrCreateService,
  getOrCreateUser,
  getOrCreateUserStat,
} from '../getters'
import { ONE, ZERO } from '../constants'
import { ReviewData } from '../../generated/templates'

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleMint(event: Mint): void {
  const review = getOrCreateReview(
    event.params.tokenId,
    event.params.serviceId,
    event.params.toId,
    event.params.proposalId,
  )
  review.rating = event.params.rating
  review.createdAt = event.block.timestamp
  review.cid = event.params.reviewUri

  const receiver = getOrCreateUser(event.params.toId)
  const receiverStats = getOrCreateUserStat(event.params.toId)

  // if (!receiver) return

  // Update receiver rating stats
  if (receiverStats.numReceivedReviews == ZERO) {
    receiver.rating = receiver.rating.plus(event.params.rating.toBigDecimal())
  } else {
    receiver.rating = receiver.rating
      .times(receiverStats.numReceivedReviews.toBigDecimal())
      .plus(event.params.rating.toBigDecimal())
      .div(receiverStats.numReceivedReviews.plus(ONE).toBigDecimal())
  }
  receiverStats.numReceivedReviews = receiverStats.numReceivedReviews.plus(ONE)

  receiver.save()
  receiverStats.save()

  const service = getOrCreateService(event.params.serviceId)
  const buyerStats = getOrCreateUserStat(BigInt.fromString(service.buyer!))
  const sellerStats = getOrCreateUserStat(BigInt.fromString(service.seller!))

  // Increase given reviews by ONE for buyer or seller
  if (receiverStats.id == buyerStats.id) {
    sellerStats.numGivenReviews = sellerStats.numGivenReviews.plus(ONE)
    sellerStats.save()
  } else {
    buyerStats.numGivenReviews = buyerStats.numGivenReviews.plus(ONE)
    buyerStats.save()
  }

  //If the service included a referral amount && a referrer; & if the user receiving the review was the person referred
  if (service.referrer != null && service.referralAmount.gt(ZERO) && receiver.id == service.seller) {
    const referrerStats = getOrCreateUserStat(BigInt.fromString(service.referrer!))
    referrerStats.numReferredUsers = referrerStats.numReferredUsers.plus(ONE)
    if (referrerStats.numReferredUsersReviewsReceived == ZERO) {
      referrerStats.averageReferredRating = referrerStats.averageReferredRating.plus(event.params.rating.toBigDecimal())
    } else {
      referrerStats.averageReferredRating = referrerStats.averageReferredRating
        .times(referrerStats.numReferredUsersReviewsReceived.toBigDecimal())
        .plus(event.params.rating.toBigDecimal())
        .div(referrerStats.numReferredUsersReviewsReceived.plus(ONE).toBigDecimal())
    }
    referrerStats.numReferredUsersReviewsReceived = referrerStats.numReferredUsersReviewsReceived.plus(ONE)
    referrerStats.save()
  }

  const cid = event.params.reviewUri
  const dataId = cid + '-' + event.block.timestamp.toString()
  const context = new DataSourceContext()
  context.setString('reviewId', review.id)
  context.setString('id', dataId)

  ReviewData.createWithContext(cid, context)

  review.description = dataId
  review.save()
}

export function handleTransfer(event: Transfer): void {}
