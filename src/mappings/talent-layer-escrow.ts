import { BigInt, DataSourceContext, log } from '@graphprotocol/graph-ts'
import { Service, Transaction, User } from '../../generated/schema'
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
  getOrCreateProtocol,
  getOrCreateTransaction,
  getOrCreateEvidence,
  getOrCreateUserStats,
} from '../getters'
import {
  Payment,
  PaymentCompleted,
  FeesClaimed,
  ProtocolEscrowFeeRateUpdated,
  TransactionCreated,
  HasToPayFee,
  Dispute,
  RulingExecuted,
  MetaEvidence,
  ArbitrationFeePayment,
  EvidenceSubmitted,
  OriginServiceFeeRateReleased,
  OriginValidatedProposalFeeRateReleased,
} from '../../generated/TalentLayerEscrow/TalentLayerEscrow'
import { generateIdFromTwoElements, generateUniqueId } from './utils'
import { ONE, ZERO } from '../constants'
import { EvidenceData } from '../../generated/templates'

enum Party {
  Sender,
  Receiver,
}

enum PaymentType {
  Release,
  Reimburse,
}

enum ArbitrationFeePaymentType {
  Pay,
  Reimburse,
}

export function handleTransactionCreated(event: TransactionCreated): void {
  const transaction = getOrCreateTransaction(event.params._transactionId, event.block.timestamp)

  transaction.sender = User.load(event.params._senderId.toString())!.id
  transaction.receiver = User.load(event.params._receiverId.toString())!.id
  transaction.token = getOrCreateToken(event.params._token).id
  transaction.amount = event.params._amount
  transaction.service = Service.load(event.params._serviceId.toString())!.id
  transaction.protocolEscrowFeeRate = event.params._protocolEscrowFeeRate
  transaction.originServiceFeeRate = event.params._originServiceFeeRate
  transaction.originValidatedProposalFeeRate = event.params._originValidatedProposalFeeRate
  transaction.arbitrator = event.params._arbitrator
  transaction.arbitratorExtraData = event.params._arbitratorExtraData
  transaction.arbitrationFeeTimeout = event.params._arbitrationFeeTimeout
  transaction.save()

  const service = getOrCreateService(event.params._serviceId)

  const proposalId = generateIdFromTwoElements(event.params._serviceId.toString(), event.params._proposalId.toString())
  const proposal = getOrCreateProposal(proposalId, event.params._serviceId)
  proposal.status = 'Validated'
  proposal.save()

  service.status = 'Confirmed'
  service.updatedAt = event.block.timestamp
  service.seller = User.load(event.params._proposalId.toString())!.id
  service.save()
}

export function handlePaymentCompleted(event: PaymentCompleted): void {
  const service = getOrCreateService(event.params._serviceId)
  service.status = 'Finished'
  service.updatedAt = event.block.timestamp
  service.save()

  const buyerUserStats = getOrCreateUserStats(BigInt.fromString(service.buyer!))
  buyerUserStats.numFinishedServicesAsBuyer.plus(ONE)
  buyerUserStats.save()

  const sellerUserStats = getOrCreateUserStats(BigInt.fromString(service.seller!))
  sellerUserStats.numFinishedServicesAsSeller.plus(ONE)
  sellerUserStats.save()
}

export function handlePayment(event: Payment): void {
  const paymentId = generateUniqueId(event.transaction.hash.toHex(), event.logIndex.toString())
  const payment = getOrCreatePayment(paymentId, event.params._serviceId)
  const token = event.params._token

  payment.amount = event.params._amount
  payment.rateToken = getOrCreateToken(token).id
  payment.createdAt = event.block.timestamp
  payment.transaction = Transaction.load(event.params._transactionId.toString())!.id

  if (event.params._paymentType === PaymentType.Release) {
    payment.paymentType = 'Release'

    const service = getOrCreateService(event.params._serviceId)
    const seller = service.seller
    if (seller) {
      const userGainId = generateIdFromTwoElements(seller, event.params._token.toHex())
      const userGain = getOrCreateUserGain(userGainId, BigInt.fromString(seller))
      userGain.token = getOrCreateToken(token).id
      userGain.totalGain = userGain.totalGain.plus(event.params._amount)
      userGain.save()
    }
  }
  if (event.params._paymentType === PaymentType.Reimburse) {
    payment.paymentType = 'Reimburse'
  }

  payment.transactionHash = event.transaction.hash.toHex()
  payment.save()

  const transaction = getOrCreateTransaction(event.params._transactionId)
  transaction.amount = transaction.amount.minus(event.params._amount)
  transaction.save()
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

export function handleOriginServiceFeeRateReleased(event: OriginServiceFeeRateReleased): void {
  const paymentId = generateUniqueId(event.transaction.hash.toHex(), event.logIndex.toString())
  const originServiceFeePayment = getOrCreateOriginPlatformFee(paymentId)
  const token = event.params._token
  originServiceFeePayment.platform = event.params._platformId.toString()
  originServiceFeePayment.service = event.params._serviceId.toString()
  originServiceFeePayment.token = getOrCreateToken(token).id
  originServiceFeePayment.amount = event.params._amount

  originServiceFeePayment.createdAt = event.block.timestamp
  originServiceFeePayment.save()

  const platformGainId = generateIdFromTwoElements(event.params._platformId.toString(), event.params._token.toHex())
  const platformGain = getOrCreatePlatformGain(platformGainId)
  platformGain.platform = event.params._platformId.toString()
  platformGain.token = getOrCreateToken(token).id
  platformGain.totalOriginPlatformFeeGain = platformGain.totalOriginPlatformFeeGain.plus(event.params._amount)

  platformGain.save()
}

export function handleOriginValidatedProposalFeeRateReleased(event: OriginValidatedProposalFeeRateReleased): void {
  const paymentId = generateUniqueId(event.transaction.hash.toHex(), event.logIndex.toString())
  const originProposalValidatedFeePayment = getOrCreatePlatformFee(paymentId)
  const token = event.params._token
  originProposalValidatedFeePayment.platform = event.params._platformId.toString()
  originProposalValidatedFeePayment.service = event.params._serviceId.toString()
  originProposalValidatedFeePayment.token = getOrCreateToken(token).id
  originProposalValidatedFeePayment.amount = event.params._amount

  originProposalValidatedFeePayment.createdAt = event.block.timestamp
  originProposalValidatedFeePayment.save()

  const platformGainId = generateIdFromTwoElements(event.params._platformId.toString(), event.params._token.toHex())
  const platformGain = getOrCreatePlatformGain(platformGainId)
  platformGain.platform = event.params._platformId.toString()
  platformGain.token = getOrCreateToken(token).id
  platformGain.totalPlatformFeeGain = platformGain.totalPlatformFeeGain.plus(event.params._amount)

  platformGain.save()
}

export function handleProtocolEscrowFeeRateUpdated(event: ProtocolEscrowFeeRateUpdated): void {
  const protocol = getOrCreateProtocol()
  protocol.protocolEscrowFeeRate = event.params._protocolEscrowFeeRate
  protocol.save()
}

export function handleArbitrationFeePayment(event: ArbitrationFeePayment): void {
  const transaction = getOrCreateTransaction(event.params._transactionId)

  if (event.params._party === Party.Sender) {
    if (event.params._paymentType === ArbitrationFeePaymentType.Pay) {
      // Payment
      transaction.senderFee = transaction.senderFee.plus(event.params._amount)
      transaction.senderFeePaidAt = event.block.timestamp
    } else {
      // Reimbursement
      transaction.senderFee = transaction.senderFee.minus(event.params._amount)
    }
  } else {
    if (event.params._paymentType === ArbitrationFeePaymentType.Pay) {
      // Payment
      transaction.receiverFee = transaction.receiverFee.plus(event.params._amount)
      transaction.receiverFeePaidAt = event.block.timestamp
    } else {
      // Reimbursement
      transaction.receiverFee = transaction.receiverFee.minus(event.params._amount)
    }
  }

  transaction.lastInteraction = event.block.timestamp
  transaction.save()
}

export function handleHasToPayFee(event: HasToPayFee): void {
  const transaction = getOrCreateTransaction(event.params._transactionId)

  if (event.params._party === Party.Sender) {
    transaction.status = 'WaitingSender'
  } else {
    transaction.status = 'WaitingReceiver'
  }

  transaction.save()
}

export function handleDispute(event: Dispute): void {
  const transaction = getOrCreateTransaction(event.params._evidenceGroupID) // evidenceGroupID is equal to the transactionId
  transaction.status = 'DisputeCreated'
  transaction.disputeId = event.params._disputeID
  // TODO: update fees paid by sender and receiver if they got refunded for overpaying
  transaction.save()
}

export function handleRulingExecuted(event: RulingExecuted): void {
  const transaction = getOrCreateTransaction(event.params._transactionId)
  transaction.amount = ZERO
  transaction.senderFee = ZERO
  transaction.receiverFee = ZERO
  transaction.status = 'Resolved'
  transaction.ruling = event.params._ruling
  transaction.save()
}

export function handleEvidenceSubmitted(event: EvidenceSubmitted): void {
  const evidenceId = generateUniqueId(event.transaction.hash.toHex(), event.logIndex.toString())
  const evidence = getOrCreateEvidence(evidenceId, event.params._transactionId)
  evidence.party = User.load(event.params._partyId.toString())!.id
  const cid = event.params._evidenceUri
  evidence.cid = cid

  const dataId = cid + '-' + event.block.timestamp.toString()
  const context = new DataSourceContext()
  context.setString('evidenceId', evidence.id)
  context.setString('id', dataId)

  EvidenceData.createWithContext(cid, context)
  evidence.description = dataId

  evidence.save()
}

export function handleMetaEvidence(event: MetaEvidence): void {
  const transaction = getOrCreateTransaction(event.params._metaEvidenceID)
  transaction.metaEvidenceUri = event.params._evidence
  transaction.save()
}
