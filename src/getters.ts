import { BigInt, ByteArray, Bytes } from '@graphprotocol/graph-ts'
import { User, Review, Service, Proposal, Payment, Platform, Token } from '../generated/schema'
import { ZERO, ZERO_ADDRESS, ZERO_BIGDEC } from './constants'

export function getOrCreateService(id: BigInt): Service {
  let service = Service.load(id.toString())
  if (!service) {
    service = new Service(id.toString())
    service.status = 'Filled'
    service.uri = ''
    service.save()
  }
  return service
}

export function getOrCreateProposal(id: string): Proposal {
  let proposal = Proposal.load(id)
  if (!proposal) {
    proposal = new Proposal(id)
    proposal.status = 'Pending'
    proposal.save()
  }
  return proposal
}

export function getOrCreateReview(id: BigInt, serviceId: BigInt, toId: BigInt): Review {
  let review = Review.load(id.toString())
  if (!review) {
    review = new Review(id.toString())
    review.to = getOrCreateUser(toId).id
    review.service = getOrCreateService(serviceId).id
    review.uri = ''
    review.save()
  }
  return review
}

export function getOrCreateUser(id: BigInt): User {
  let user = User.load(id.toString())
  if (!user) {
    user = new User(id.toString())
    user.address = ZERO_ADDRESS.toHex()
    user.handle = ''
    user.uri = ''
    user.withPoh = false
    user.numReviews = ZERO
    user.rating = ZERO_BIGDEC
    user.save()
  }
  return user
}

export function getOrCreatePayment(paymentId: string, serviceId: BigInt): Payment {
  let payment = Payment.load(paymentId)
  if (!payment) {
    payment = new Payment(paymentId.toString())
    payment.service = getOrCreateService(serviceId).id
    payment.amount = ZERO
    payment.rateToken = ZERO_ADDRESS
    payment.paymentType = ''
  }
  return payment
}

export function getOrCreatePlatform(platformId: BigInt): Platform {
  let platform = Platform.load(platformId.toString())
  if (!platform) {
    platform = new Platform(platformId.toString())
    platform.address = ZERO_ADDRESS
    platform.name = ''
    platform.uri = ''
    platform.save()
  }
  return platform
}

// creation of getOrCreateToken function
export function getOrCreateToken(tokenAddress: Bytes): Token {
  let token = Token.load(tokenAddress.toHex())
  if (!token) {
    token = new Token(tokenAddress.toHex())
    token.tokenAddress = tokenAddress
    token.name = ''
    token.code = ''
    token.decimals = ZERO
    token.save()
  }
  return token
}
