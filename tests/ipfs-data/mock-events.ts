import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import { newMockEvent } from "matchstick-as"
import { ProposalCreated, ServiceCreated, ServiceDataCreated } from "../../generated/ServiceRegistry/ServiceRegistry"

export function createNewServiceDataCreatedEvent(id: BigInt, serviceDataUri: string): ServiceDataCreated {
  let mockEvent = newMockEvent()
  let serviceDataCreatedEvent = new ServiceDataCreated(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    null
  )
  
  serviceDataCreatedEvent.parameters = new Array()
  let idParam = new ethereum.EventParam('id', ethereum.Value.fromUnsignedBigInt(id))
  let serviceDataUriParam = new ethereum.EventParam('serviceDataUri', ethereum.Value.fromString(serviceDataUri))

  serviceDataCreatedEvent.parameters.push(idParam)
  serviceDataCreatedEvent.parameters.push(serviceDataUriParam)

  return serviceDataCreatedEvent
} 

export function createNewServiceCreatedEvent(id: BigInt, buyerId: BigInt, initiatorId: BigInt, platformId: BigInt, sellerId: BigInt): ServiceCreated {
  let mockEvent = newMockEvent()
  let serviceCreatedEvent = new ServiceCreated(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    null
  )
  
  serviceCreatedEvent.parameters = new Array()
  let idParam = new ethereum.EventParam('id', ethereum.Value.fromUnsignedBigInt(id))
  let buyerIdParam = new ethereum.EventParam('buyerId', ethereum.Value.fromUnsignedBigInt(buyerId))
  let initiatorIdParam = new ethereum.EventParam('initiatorId', ethereum.Value.fromUnsignedBigInt(initiatorId))
  let platformIdParam = new ethereum.EventParam('platformId', ethereum.Value.fromUnsignedBigInt(platformId))
  let sellerIdParam = new ethereum.EventParam('sellerId', ethereum.Value.fromUnsignedBigInt(sellerId))

  serviceCreatedEvent.parameters.push(idParam)
  serviceCreatedEvent.parameters.push(buyerIdParam)
  serviceCreatedEvent.parameters.push(initiatorIdParam)
  serviceCreatedEvent.parameters.push(platformIdParam)
  serviceCreatedEvent.parameters.push(sellerIdParam)

  return serviceCreatedEvent
}

export function createNewProposalCreatedEvent(serviceId: BigInt, sellerId: BigInt, rateToken: Address, rateAmount: BigInt, cid: string): ProposalCreated {
  let mockEvent = newMockEvent()
  let proposalCreatedEvent = new ProposalCreated(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    null
  )

  proposalCreatedEvent.parameters = new Array()
  let serviceIdParam = getUintParam('serviceId', serviceId)
  let sellerIdParam = getUintParam('sellerId', sellerId)
  let rateTokenParam = getAddressParam('rateToken', rateToken)
  let rateAmountParam = getUintParam('rateAmount', rateAmount)
  let cidParam = getStringParam('proposalDataUri', cid)

  proposalCreatedEvent.parameters.push(serviceIdParam)
  proposalCreatedEvent.parameters.push(sellerIdParam)
  proposalCreatedEvent.parameters.push(rateTokenParam)
  proposalCreatedEvent.parameters.push(rateAmountParam)
  proposalCreatedEvent.parameters.push(cidParam)

  return proposalCreatedEvent
}

// --------------- help functions ------------------

function getUintParam(param: string, i: BigInt): ethereum.EventParam {
  return new ethereum.EventParam(param, ethereum.Value.fromUnsignedBigInt(i))
}

function getStringParam(param: string, s: string): ethereum.EventParam {
  return new ethereum.EventParam(param, ethereum.Value.fromString(s))
}

function getAddressParam(param: string, a: Address): ethereum.EventParam {
  return new ethereum.EventParam(param, ethereum.Value.fromAddress(a))
}