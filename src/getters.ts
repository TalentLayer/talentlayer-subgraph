import { BigInt } from "@graphprotocol/graph-ts";
import {
  User,
  Review,
  Service,
  Proposal,
  Payment,
  Platform,
  PlatformClaim,
  FeePayment
} from "../generated/schema";
import { ZERO, ZERO_ADDRESS, ZERO_BIGDEC } from "./constants";

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

export function getOrCreateOriginPlatformFee(paymentId: string): FeePayment {
  let originPlatformFeePayment = FeePayment.load(paymentId);
  if (!originPlatformFeePayment) {
    originPlatformFeePayment = new FeePayment(paymentId);
    originPlatformFeePayment.type = 'OriginPlatform';
    originPlatformFeePayment.token = ZERO_ADDRESS;
    originPlatformFeePayment.amount = ZERO;
    originPlatformFeePayment.save();
  }
  return originPlatformFeePayment;
}

export function getOrCreatePlatformFee(paymentId: string): FeePayment {
  let platformFeePayment = FeePayment.load(paymentId);
  if (!platformFeePayment) {
    platformFeePayment = new FeePayment(paymentId);
    platformFeePayment.type = 'Platform';
    platformFeePayment.token = ZERO_ADDRESS;
    platformFeePayment.amount = ZERO;
    platformFeePayment.save();
  }
  return platformFeePayment;
}

export function getOrCreateClaim(claimId: string): PlatformClaim {
  let claim = PlatformClaim.load(claimId);
  if (!claim) {
    claim = new PlatformClaim(claimId);
    claim.token = ZERO_ADDRESS;
    claim.amount = ZERO;
    claim.save();
  }
  return claim;
}
