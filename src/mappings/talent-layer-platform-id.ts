import { MintFeeUpdated } from '../../generated/TalentLayerID/TalentLayerID'
import {
  Approval,
  ApprovalForAll,
  CidUpdated,
  ConsecutiveTransfer,
  Mint,
  Transfer,
} from '../../generated/TalentLayerPlatformID/TalentLayerPlatformID'
import { PROTOCOL_ID } from '../constants'
import { getOrCreatePlatform, getOrCreateProtocol } from '../getters'

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleCidUpdated(event: CidUpdated): void {
  const platform = getOrCreatePlatform(event.params._tokenId)
  platform.uri = event.params._newCid
  platform.save()
}

export function handleConsecutiveTransfer(event: ConsecutiveTransfer): void {}

export function handleMint(event: Mint): void {
  const platform = getOrCreatePlatform(event.params._tokenId)
  platform.address = event.params._platformOwnerAddress
  platform.name = event.params._platformName

  platform.createdAt = event.block.timestamp

  platform.save()
}

export function handleTransfer(event: Transfer): void {}

export function handleMintFeeUpdated(event: MintFeeUpdated): void {
  const protocol = getOrCreateProtocol()
  protocol.platformMintFee = event.params._mintFee
  protocol.save()
}
