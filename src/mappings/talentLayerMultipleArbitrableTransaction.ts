import { BigInt, log } from '@graphprotocol/graph-ts'
import { Service, User } from '../../generated/schema'
import {
  getOrCreateService,
  getOrCreatePayment,
  getOrCreateProposal,
  getOrCreateToken,
  getOrCreateOriginPlatformFee,
  getOrCreatePlatformFee,
  getOrCreateClaim,
  getOrCreatePlatformGain,
  getOrCreateUserGain,
} from '../getters'
import {
  ServiceProposalConfirmedWithDeposit,
  Payment,
  PaymentCompleted,
  OriginPlatformFeeReleased,
  PlatformFeeReleased,
  FeesClaimed,
} from '../../generated/TalentLayerMultipleArbitrableTransaction/TalentLayerMultipleArbitrableTransaction'
import { generateIdFromTwoElements, generateUniqueId } from './utils'

export function handleServiceProposalConfirmedWithDeposit(event: ServiceProposalConfirmedWithDeposit): void {
  const service = getOrCreateService(event.params.serviceId)

  const proposalId = generateIdFromTwoElements(event.params.serviceId.toString(), event.params.sellerId.toString())
  const proposal = getOrCreateProposal(proposalId, event.params.serviceId)

  log.warning('!!!!!! proposal ID', [proposalId])
  log.warning('!!!!!! service ID', [event.params.serviceId.toString()])

  service.status = 'Confirmed'
  service.transactionId = event.params.transactionId.toString()
  service.seller = User.load(event.params.sellerId.toString())!.id
  service.save()

  proposal.status = 'Validated'
  proposal.save()
}

export function handlePaymentCompleted(event: PaymentCompleted): void {
  const service = getOrCreateService(event.params._serviceId)
  service.status = 'Finished'
  service.save()
}

export function handlePayment(event: Payment): void {
  const paymentId = generateUniqueId(event.transaction.hash.toHex(), event.logIndex.toString())
  const payment = getOrCreatePayment(paymentId, event.params._serviceId)
  const token = event.params._token

  payment.amount = event.params._amount
  payment.rateToken = getOrCreateToken(token).id
  payment.createdAt = event.block.timestamp

  if (event.params._paymentType === 0) {
    payment.paymentType = 'Release'

    const service = getOrCreateService(event.params._serviceId)
    const seller = service.seller
    if (seller) {
      const userGainId = generateIdFromTwoElements(seller, event.params._token.toHex())
      const userGain = getOrCreateUserGain(userGainId, BigInt.fromString(seller))
      userGain.token = getOrCreateToken(token).id
      userGain.user = seller!
      userGain.totalGain = userGain.totalGain.plus(event.params._amount)
      userGain.save()
    }
  }
  if (event.params._paymentType === 1) {
    payment.paymentType = 'Reimburse'
  }

  payment.transactionHash = event.transaction.hash.toHex()
  payment.save()
}

export function handleFeesClaimed(event: FeesClaimed): void {
  const claimId = generateUniqueId(event.transaction.hash.toHex(), event.logIndex.toString())
  const claim = getOrCreateClaim(claimId)
  const token = event.params._token
  claim.platform = event.params._platformId.toString()
  claim.token = getOrCreateToken(token).id
  claim.amount = event.params._amount

  claim.transactionHash = event.transaction.hash.toHex()
  claim.createdAt = event.block.timestamp
  claim.save()
}

export function handleOriginPlatformFeeReleased(event: OriginPlatformFeeReleased): void {
  const paymentId = generateUniqueId(event.transaction.hash.toHex(), event.logIndex.toString())
  const originPlatformFeePayment = getOrCreateOriginPlatformFee(paymentId)
  const token = event.params._token
  originPlatformFeePayment.amount = event.params._amount
  originPlatformFeePayment.platform = event.params._platformId.toString()
  originPlatformFeePayment.service = event.params._serviceId.toString()
  originPlatformFeePayment.token = getOrCreateToken(token).id

  originPlatformFeePayment.createdAt = event.block.timestamp
  originPlatformFeePayment.save()

  const platformGainId = generateIdFromTwoElements(event.params._platformId.toString(), event.params._token.toHex())
  const platformGain = getOrCreatePlatformGain(platformGainId)
  platformGain.platform = event.params._platformId.toString()
  platformGain.token = getOrCreateToken(token).id
  platformGain.totalOriginPlatformFeeGain = platformGain.totalOriginPlatformFeeGain.plus(event.params._amount)

  platformGain.save()
}

export function handlePlatformFeeReleased(event: PlatformFeeReleased): void {
  const paymentId = generateUniqueId(event.transaction.hash.toHex(), event.logIndex.toString())
  const platformFeePayment = getOrCreatePlatformFee(paymentId)
  const token = event.params._token
  platformFeePayment.amount = event.params._amount
  platformFeePayment.platform = event.params._platformId.toString()
  platformFeePayment.service = event.params._serviceId.toString()
  platformFeePayment.token = getOrCreateToken(token).id

  platformFeePayment.createdAt = event.block.timestamp
  platformFeePayment.save()

  const platformGainId = generateIdFromTwoElements(event.params._platformId.toString(), event.params._token.toHex())
  const platformGain = getOrCreatePlatformGain(platformGainId)
  platformGain.platform = event.params._platformId.toString()
  platformGain.token = getOrCreateToken(token).id
  platformGain.totalPlatformFeeGain = platformGain.totalPlatformFeeGain.plus(event.params._amount)

  platformGain.save()
}
