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
  SignerUpdated,
  Transfer,
} from '../../generated/TalentLayerPlatformID/TalentLayerPlatformID'
import { getOrCreatePlatform, getOrCreateProtocol } from '../getters'

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleCidUpdated(event: CidUpdated): void {
  const platformId = event.params._platformId
  const platform = getOrCreatePlatform(platformId)
  const oldCid = platform.cid
  const newCid = event.params._newCid
  const dataId = newCid + '-' + event.block.timestamp.toString()

  platform.updatedAt = event.block.timestamp
  if (!oldCid) {
    platform.createdAt = event.block.timestamp
  }

  platform.cid = newCid

  const context = new DataSourceContext()
  context.setBigInt('platformId', platformId)
  context.setString('id', dataId)

  if (oldCid) {
    store.remove('PlatformDescription', oldCid)
  }

  PlatformData.createWithContext(newCid, context)

  platform.description = dataId
  platform.save()
}

export function handleMint(event: Mint): void {
  const platform = getOrCreatePlatform(event.params._platformId)
  platform.address = event.params._platformOwnerAddress
  platform.name = event.params._platformName

  platform.createdAt = event.block.timestamp
  platform.updatedAt = event.block.timestamp

  platform.arbitrationFeeTimeout = event.params._arbitrationFeeTimeout
  platform.signer = event.params._platformOwnerAddress

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
  platform.servicePostingFee = event.params._servicePostingFee
  platform.save()
}

export function handleProposalPostingFeeUpdated(event: ProposalPostingFeeUpdated): void {
  const platform = getOrCreatePlatform(event.params._platformId)
  platform.proposalPostingFee = event.params._proposalPostingFee
  platform.save()
}

export function handleSignerUpdated(event: SignerUpdated): void {
  const platform = getOrCreatePlatform(event.params._platformId)
  platform.signer = event.params._signer
  platform.save()
}
