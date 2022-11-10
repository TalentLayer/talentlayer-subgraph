import { BigDecimal, log, BigInt, Bytes, Address } from '@graphprotocol/graph-ts'
import { Service, User, Token } from '../../generated/schema'
import { getOrCreateService, getOrCreatePayment, getOrCreateProposal, getOrCreateToken } from '../getters'
import {
  ServiceProposalConfirmedWithDeposit,
  Payment,
  PaymentCompleted,
} from '../../generated/TalentLayerMultipleArbitrableTransaction/TalentLayerMultipleArbitrableTransaction'
import { simpleERC20 } from '../../generated/simpleERC20/simpleERC20'
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

  // we generate a unique ID for the payment
  const paymentId = generateUniqueId(event.params.transactionId.toString(), event.params.serviceId.toString())
  // we get or create the payment
  const payment = getOrCreatePayment(paymentId, event.params.serviceId)
  // we get the token address used for the payment
  const tokenAddress = Address.fromBytes(payment.rateToken!)
  // we get the token contract to fill the entity
  let token = getOrCreateToken(tokenAddress)
  //we get the token contract to get all the information about the token
  let contract = simpleERC20.bind(tokenAddress)

  //we check if the token exist then fill the Token entity
  if (!token) {
    token = new Token(tokenAddress.toHex())
    token.code = contract.symbol()
    token.name = contract.name()
    token.decimals = BigInt.fromI32(contract.decimals())
    token.save()
  }
}

export function handlePaymentCompleted(event: PaymentCompleted): void {
  const service = getOrCreateService(event.params._serviceId)
  service.status = 'Finished'
  service.save()
}

export function handlePayment(event: Payment): void {
  const paymentId = generateUniqueId(event.transaction.hash.toHex(), event.logIndex.toString())
  const payment = getOrCreatePayment(paymentId, event.params._serviceId)
  // const token = getOrCreateToken(event.params._token)
  // let contract = simpleERC20.bind(event.params._token)

  payment.amount = event.params._amount
  payment.rateToken = event.params._token
  payment.createdAt = event.block.timestamp

  if (event.params._paymentType === 0) {
    payment.paymentType = 'Release'
  }
  if (event.params._paymentType === 1) {
    payment.paymentType = 'Reimburse'
  }

  // token.code = contract.symbol()
  // token.name = contract.name()
  // token.decimals = BigInt.fromI32(contract.decimals())
  // token.save()

  payment.transactionHash = event.transaction.hash.toHex()
  payment.save()
}
