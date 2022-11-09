import { log } from '@graphprotocol/graph-ts'
import { Service, User } from '../../generated/schema'
import { getOrCreateService, getOrCreatePayment, getOrCreateProposal } from '../getters'
import {
  ServiceProposalConfirmedWithDeposit,
  Payment,
  PaymentCompleted,
} from '../../generated/TalentLayerMultipleArbitrableTransaction/TalentLayerMultipleArbitrableTransaction'
import { generateProposalId, generateUniqueId } from './utils'

export function handleServiceProposalConfirmedWithDeposit(event: ServiceProposalConfirmedWithDeposit): void {
  const service = getOrCreateService(event.params.serviceId)

  const proposalId = generateProposalId(event.params.serviceId.toString(), event.params.sellerId.toString())
  const proposal = getOrCreateProposal(proposalId)

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

  payment.service = Service.load(event.params._serviceId.toString())!.id
  payment.amount = event.params._amount
  payment.rateToken = event.params._token

  if (event.params._paymentType === 0) {
    payment.paymentType = 'Release'
  }
  if (event.params._paymentType === 1) {
    payment.paymentType = 'Reimburse'
  }

  payment.transactionHash = event.transaction.hash.toHex()
  payment.save()
}
