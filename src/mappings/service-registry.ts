import { log, DataSourceContext } from '@graphprotocol/graph-ts'
import { Service, User, Token } from '../../generated/schema'
import { MetadataRegistry } from '../../generated/templates'
import {
  ServiceCreated,
  ServiceDetailedUpdated,
  ProposalCreated,
  ProposalRejected,
  ProposalUpdated,
  ServiceDataCreated,
} from '../../generated/ServiceRegistry/ServiceRegistry'
import { getOrCreateService, getOrCreateProposal, getOrCreateToken, getOrCreatePlatform } from '../getters'
import { generateIdFromTwoElements } from './utils'

export function handleServiceCreated(event: ServiceCreated): void {
  const service = getOrCreateService(event.params.id)
  service.buyer = User.load(event.params.buyerId.toString())!.id

  const sellerId = event.params.sellerId.toString()
  log.warning('seller: {}', [sellerId])
  if (sellerId != '0') {
    service.seller = User.load(sellerId)!.id
  } else {
    service.status = 'Opened'
  }

  service.sender = User.load(event.params.initiatorId.toString())!.id
  if (event.params.initiatorId == event.params.buyerId) {
    service.recipient = service.seller
  } else if (event.params.initiatorId == event.params.sellerId) {
    service.recipient = service.buyer
  } else {
    log.error('Service created by neither buyer nor seller, senderId: {}', [event.params.initiatorId.toString()])
  }

  service.createdAt = event.block.timestamp
  service.updatedAt = event.block.timestamp

  const platform = getOrCreatePlatform(event.params.platformId)
  service.platform = platform.id

  service.save()
}

// ============================ START OF IPFS SEARCH WIP ================================================

export function handleServiceDataCreated(event: ServiceDataCreated): void {
  const service = getOrCreateService(event.params.id)

  let cid = event.params.serviceDataUri
  service.uri = cid
  service.save()

  let context = new DataSourceContext();

  context.setString("serviceId", event.params.id.toString())

  MetadataRegistry.createWithContext(cid, context)
  // ServiceMetadataTemplate.create(cid)
}

//===================================== END OF IPFS SEARCH WIP ===========================================

export function handleServiceDetailedUpdated(event: ServiceDetailedUpdated): void {
  const service = getOrCreateService(event.params.id)
  service.uri = event.params.newServiceDataUri
  service.updatedAt = event.block.timestamp
  service.save()
}

export function handleProposalCreated(event: ProposalCreated): void {
  const proposalId = generateIdFromTwoElements(event.params.serviceId.toString(), event.params.sellerId.toString())
  const proposal = getOrCreateProposal(proposalId, event.params.serviceId)
  proposal.status = 'Pending'

  proposal.rateToken = event.params.rateToken.toHexString()
  proposal.rateAmount = event.params.rateAmount
  proposal.uri = event.params.proposalDataUri
  proposal.service = Service.load(event.params.serviceId.toString())!.id
  proposal.seller = User.load(event.params.sellerId.toString())!.id

  proposal.createdAt = event.block.timestamp
  proposal.updatedAt = event.block.timestamp

  proposal.save()

  // we get the token address
  const tokenAddress = event.params.rateToken
  // we get the token contract to fill the entity
  let token = getOrCreateToken(tokenAddress)
}

export function handleProposalRejected(event: ProposalRejected): void {
  const proposalId = generateIdFromTwoElements(event.params.serviceId.toString(), event.params.sellerId.toString())
  const proposal = getOrCreateProposal(proposalId, event.params.serviceId)
  proposal.status = 'Rejected'
  proposal.updatedAt = event.block.timestamp
  proposal.save()
}

export function handleProposalUpdated(event: ProposalUpdated): void {
  const token = event.params.rateToken
  const proposalId = generateIdFromTwoElements(event.params.serviceId.toString(), event.params.sellerId.toString())
  const proposal = getOrCreateProposal(proposalId, event.params.serviceId)
  proposal.rateToken = getOrCreateToken(token).id
  proposal.rateAmount = event.params.rateAmount
  proposal.uri = event.params.proposalDataUri
  proposal.updatedAt = event.block.timestamp
  proposal.save()
}
