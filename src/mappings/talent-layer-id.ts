import { BigInt, DataSourceContext, store } from '@graphprotocol/graph-ts'
import { UserData } from '../../generated/templates'
import {
  Approval,
  ApprovalForAll,
  CidUpdated,
  DelegateAdded,
  DelegateRemoved,
  Mint,
  MintFeeUpdated,
  OwnershipTransferred,
  ShortHandlesMaxPriceUpdated,
  Transfer,
} from '../../generated/TalentLayerID/TalentLayerID'
import { getOrCreatePlatform, getOrCreateProtocol, getOrCreateUser } from '../getters'
import { UserDescription } from '../../generated/schema'

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleCidUpdated(event: CidUpdated): void {
  const userId = event.params.profileId
  const user = getOrCreateUser(userId)
  const newCid = event.params.newCid
  const dataId = newCid + '-' + event.block.timestamp.toString()

  user.updatedAt = event.block.timestamp
  user.cid = newCid
  user.description = dataId

  const context = new DataSourceContext()
  context.setBigInt('userId', userId)
  context.setString('id', dataId)
  UserData.createWithContext(newCid, context)

  user.save()
}

export function handleMint(event: Mint): void {
  const user = getOrCreateUser(event.params.profileId)
  user.userStats = event.params.profileId.toString()
  user.address = event.params.user.toHex()
  user.handle = event.params.handle
  user.createdAt = event.block.timestamp
  user.updatedAt = event.block.timestamp

  if (event.params.platformId.notEqual(BigInt.fromI32(0))) {
    const platform = getOrCreatePlatform(event.params.platformId)
    user.platform = platform.id
  }
  user.save()

  const protocol = getOrCreateProtocol()
  const currentTotalMintFees = protocol.totalMintFees || new BigInt(0)
  protocol.totalMintFees = currentTotalMintFees.plus(event.params.fee)
  protocol.save()
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleTransfer(event: Transfer): void {
  const user = getOrCreateUser(event.params.tokenId)
  user.address = event.params.to.toHex()
  user.save()
}

export function handleMintFeeUpdated(event: MintFeeUpdated): void {
  const protocol = getOrCreateProtocol()
  protocol.userMintFee = event.params.mintFee
  protocol.save()
}

export function handleDelegateAdded(event: DelegateAdded): void {
  const user = getOrCreateUser(event.params.profileId)
  const delegate = event.params.delegate.toHex()

  user.delegates = addToArray(user.delegates, delegate)
  user.save()
}

export function handleDelegateRemoved(event: DelegateRemoved): void {
  const user = getOrCreateUser(event.params.profileId)
  const delegate = event.params.delegate.toHex()

  user.delegates = removeFromArray(user.delegates, delegate)
  user.save()
}

function addToArray(arr: string[], value: string): string[] {
  if (arr.indexOf(value) === -1) {
    arr.push(value)
  }
  return arr
}

function removeFromArray(arr: string[], value: string): string[] {
  const index = arr.indexOf(value)
  if (index !== -1) {
    arr.splice(index, 1)
  }
  return arr
}

export function handleShortHandlesMaxPriceUpdate(event: ShortHandlesMaxPriceUpdated): void {
  const protocol = getOrCreateProtocol()
  protocol.shortHandlesMaxPrice = event.params.price
  protocol.save()
}
