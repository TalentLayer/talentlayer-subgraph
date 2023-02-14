import { BigInt, DataSourceContext, store } from '@graphprotocol/graph-ts'
import { PlatformData } from '../../generated/templates'
import { MintFeeUpdated } from '../../generated/TalentLayerID/TalentLayerID'
import {
  Approval,
  ApprovalForAll,
  ArbitrationFeeTimeoutUpdated,
  ArbitratorUpdated,
  CidUpdated,
  MinArbitrationFeeTimeoutUpdated,
  Mint,
  OriginServiceFeeRateUpdated,
  OriginValidatedProposalFeeRateUpdated,
  ProposalPostingFeeUpdated,
  ServicePostingFeeUpdated,
  Transfer,
} from '../../generated/TalentLayerPlatformID/TalentLayerPlatformID'
import { getOrCreatePlatform, getOrCreateProtocol } from '../getters'

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleCidUpdated(event: CidUpdated): void {
  const platformId = event.params._tokenId
  const platform = getOrCreatePlatform(platformId)
  const oldCid = platform.cid
  const newCid = event.params._newCid

  platform.updatedAt = event.block.timestamp
  if(!oldCid){
    platform.createdAt = event.block.timestamp
  }

  //Notice: Storing cid required to remove on platformDetailUpdated
  //Reason: Datastore can not get created entities.
  //When the issue is solved it may be possible to swap cid with platformId
  //Alternatively the cid can be fetched and removed in the file data source template (ipfs-data.ts)
  //Open issue: https://github.com/graphprotocol/graph-node/issues/4087
  platform.cid = newCid

  platform.save()

  const context = new DataSourceContext()
  context.setBigInt('platformId', platformId)

  // Removes platform description from store to save space.
  // Problem: unsuccessful ipfs fetch sets platformDescription.platform to null.
  // Reason: store.remove can not be called from within file datastore (ipfs-data).
  // Solution: do not use store.remove when the following issue has been solved:
  // Open issue: https://github.com/graphprotocol/graph-node/issues/4087
  // When the issue is solved, change platformDescription.id from cid to platformId.
  if(oldCid){
    store.remove('PlatformDescription', oldCid)
  }

  PlatformData.createWithContext(newCid, context)
}

export function handleMint(event: Mint): void {
  const platform = getOrCreatePlatform(event.params._tokenId)
  platform.address = event.params._platformOwnerAddress
  platform.name = event.params._platformName

  platform.createdAt = event.block.timestamp
  platform.updatedAt = event.block.timestamp
  
  platform.arbitrationFeeTimeout = event.params._arbitrationFeeTimeout

  platform.save()

  const protocol = getOrCreateProtocol()
  const currentTotalMintFees = protocol.totalMintFees || new BigInt(0)
  protocol.totalMintFees = currentTotalMintFees.plus(event.params._fee)
  protocol.save()
}

export function handleTransfer(event: Transfer): void {}

export function handleMintFeeUpdated(event: MintFeeUpdated): void {
  const protocol = getOrCreateProtocol()
  protocol.platformMintFee = event.params._mintFee
  protocol.save()
}

export function handleOriginServiceFeeRateUpdated(event: OriginServiceFeeRateUpdated): void {
  const platform = getOrCreatePlatform(event.params._platformId)
  platform.originServiceFeeRate = event.params._originServiceFeeRate
  platform.save()
}

export function handleOriginValidatedProposalFeeRateUpdated(event: OriginValidatedProposalFeeRateUpdated): void {
  const platform = getOrCreatePlatform(event.params._platformId)
  platform.originValidatedProposalFeeRate = event.params._originValidatedProposalFeeRate
  platform.save()
}

export function handleArbitratorUpdated(event: ArbitratorUpdated): void {
  const platform = getOrCreatePlatform(event.params._platformId)
  platform.arbitrator = event.params._arbitrator
  platform.arbitratorExtraData = event.params._extraData
  platform.save()
}

export function handleArbitrationFeeTimeoutUpdated(event: ArbitrationFeeTimeoutUpdated): void {
  const platform = getOrCreatePlatform(event.params._platformId)
  platform.arbitrationFeeTimeout = event.params._arbitrationFeeTimeout
  platform.save()
}

export function handleMinArbitrationFeeTimeoutUpdated(event: MinArbitrationFeeTimeoutUpdated): void {
  const protocol = getOrCreateProtocol()
  protocol.minArbitrationFeeTimeout = event.params._minArbitrationFeeTimeout
  protocol.save()
}

export function handleServicePostingFeeUpdated(event: ServicePostingFeeUpdated): void {
  const platform = getOrCreatePlatform(event.params._platformId)
  platform.servicePostingFee= event.params._servicePostingFee
  platform.save()
}

export function handleProposalPostingFeeUpdated(event: ProposalPostingFeeUpdated): void {
  const platform = getOrCreatePlatform(event.params._platformId)
  platform.proposalPostingFee= event.params._proposalPostingFee
  platform.save()
}
