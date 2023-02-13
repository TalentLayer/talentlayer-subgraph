import { ethereum, BigInt } from "@graphprotocol/graph-ts"
import { newMockEvent } from "matchstick-as"
import { ServiceDataCreated } from "../../generated/ServiceRegistry/ServiceRegistry"

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