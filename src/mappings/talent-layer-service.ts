import { log, store, BigInt, DataSourceContext } from '@graphprotocol/graph-ts'
import { Platform, User } from '../../generated/schema'
import { ServiceData, ProposalData } from '../../generated/templates'
import {
  ServiceCreated,
  ServiceDetailedUpdated,
  ProposalCreated,
  ProposalUpdated,
  AllowedTokenListUpdated,
} from '../../generated/TalentLayerService/TalentLayerService'
import {
  getOrCreateService,
  getOrCreateProposal,
  getOrCreateToken,
  getOrCreatePlatform,
  getOrCreateUser,
} from '../getters'
import { generateIdFromTwoElements } from './utils'

export function handleServiceCreated(event: ServiceCreated): void {
  const service = getOrCreateService(event.params.id)
  service.createdAt = event.block.timestamp
  service.updatedAt = event.block.timestamp
  service.buyer = getOrCreateUser(event.params.ownerId).id
  service.status = 'Opened'
  const platform = getOrCreatePlatform(event.params.platformId)
  service.platform = platform.id
  service.cid = event.params.dataUri
  service.save()

  const context = new DataSourceContext()
  context.setBigInt('serviceId', event.params.id)
  ServiceData.createWithContext(event.params.dataUri, context)
}

export function handleServiceDetailedUpdated(event: ServiceDetailedUpdated): void {
  const serviceId = event.params.id
  const service = getOrCreateService(serviceId)
  const oldCid = service.cid
  const newCid = event.params.dataUri

  //service.created set in handleServiceCreated.
  service.updatedAt = event.block.timestamp

  //Notice: Storing cid required to remove on serviceDetailUpdated
  //Reason: Datastore can not get created entities.
  //When the issue is solved it may be possible to swap cid with serviceId
  //Alternatively the cid can be fetched and removed in the file data source template (ipfs-data.ts)
  //Open issue: https://github.com/graphprotocol/graph-node/issues/4087
  service.cid = newCid

  service.save()

  const context = new DataSourceContext()
  context.setBigInt('serviceId', serviceId)

  // Removes service description from store to save space.
  // Problem: unsuccessful ipfs fetch sets serviceDescription.service to null.
  // Reason: store.remove can not be called from within file datastore (ipfs-data).
  // Solution: do not use store.remove when the following issue has been solved:
  // Open issue: https://github.com/graphprotocol/graph-node/issues/4087
  // When the issue is solved, change serviceDescription.id from cid to serviceId.
  if (oldCid) {
    store.remove('ServiceDescription', oldCid)
  }

  ServiceData.createWithContext(newCid, context)
}

export function handleProposalCreated(event: ProposalCreated): void {
  const proposalId = generateIdFromTwoElements(event.params.serviceId.toString(), event.params.ownerId.toString())
  const proposal = getOrCreateProposal(proposalId, event.params.serviceId)
  proposal.status = 'Pending'

  proposal.service = getOrCreateService(event.params.serviceId).id
  proposal.seller = User.load(event.params.ownerId.toString())!.id
  // proposal.uri = event.params.proposalDataUri
  proposal.rateToken = event.params.rateToken.toHexString()
  proposal.rateAmount = event.params.rateAmount
  proposal.platform = Platform.load(event.params.platformId.toString())!.id
  proposal.expirationDate = event.params.expirationDate

  // we get the token address
  const tokenAddress = event.params.rateToken
  // we get the token contract to fill the entity
  let token = getOrCreateToken(tokenAddress)

  proposal.createdAt = event.block.timestamp
  proposal.updatedAt = event.block.timestamp

  const cid = event.params.dataUri

  //Notice: Storing cid required to remove serviceDetailUpdated
  //Reason: Datastore can not get created entities.
  //When the issue is solved it may be possible to swap cid with serviceId.
  //Alternatively the cid can be fetched and removed in the file data source template (ipfs-data.ts)
  //Open issue: https://github.com/graphprotocol/graph-node/issues/4087
  proposal.cid = cid

  proposal.save()

  const context = new DataSourceContext()
  context.setString('proposalId', proposalId)
  ProposalData.createWithContext(cid, context)
}

export function handleAllowedTokenListUpdated(event: AllowedTokenListUpdated): void {
  const token = getOrCreateToken(event.params._tokenAddress)
  token.allowed = event.params._status

  token.save()
}

export function handleProposalUpdated(event: ProposalUpdated): void {
  const token = event.params.rateToken
  const proposalId = generateIdFromTwoElements(event.params.serviceId.toString(), event.params.ownerId.toString())
  const proposal = getOrCreateProposal(proposalId, event.params.serviceId)
  const newCid = event.params.dataUri
  const oldCid = proposal.cid

  proposal.rateToken = getOrCreateToken(token).id
  proposal.rateAmount = event.params.rateAmount

  //proposal.created set in handleProposalCreated.
  proposal.updatedAt = event.block.timestamp

  //Notice: Storing cid required to remove on proposalUpdated
  //Reason: Datastore can not get created entities.
  //When the issue is solved it may be possible to swap cid with proposalId
  //Alternatively the cid can be fetched and removed in the file data source template (ipfs-data.ts)
  //Open issue: https://github.com/graphprotocol/graph-node/issues/4087
  proposal.cid = newCid
  proposal.expirationDate = event.params._expirationDate
  const context = new DataSourceContext()
  context.setString('proposalId', proposalId)

  // Removes proposal description from store to save space.
  // Problem: unsuccessful ipfs fetch sets proposalDescription.proposal to null.
  // Reason: store.remove can not be called from within file datastore (ipfs-data).
  // Solution: do not use store.remove when the following issue has been solved:
  // Open issue: https://github.com/graphprotocol/graph-node/issues/4087
  // When the issue is solved, change proposalDescription.id from cid to proposalId.
  if (oldCid) {
    store.remove('ProposalDescription', oldCid)
  }

  ProposalData.createWithContext(newCid, context)
}
