import { BigInt, DataSourceContext } from '@graphprotocol/graph-ts'
import { UserData } from '../../generated/templates'
import {
  AccountRecovered,
  Approval,
  ApprovalForAll,
  CidUpdated,
  ConsecutiveTransfer,
  Mint,
  MintFeeUpdated,
  OwnershipTransferred,
  PohActivated,
  Transfer,
} from '../../generated/TalentLayerID/TalentLayerID'
import { getOrCreatePlatform, getOrCreateProtocol, getOrCreateUser } from '../getters'

export function handleAccountRecovered(event: AccountRecovered): void {
  const user = getOrCreateUser(event.params._tokenId)
  user.address = event.params._newAddress.toHex()
  user.save()
}

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleCidUpdated(event: CidUpdated): void {
  const user = getOrCreateUser(event.params._tokenId)
  user.uri = event.params._newCid
  user.save()

  const context = new DataSourceContext();
  context.setString("userId", user.id);
  context.setBigInt("timestamp", event.block.timestamp)
  UserData.createWithContext(user.uri, context);
}

export function handleConsecutiveTransfer(event: ConsecutiveTransfer): void {}

export function handleMint(event: Mint): void {
  const user = getOrCreateUser(event.params._tokenId)
  user.address = event.params._user.toHex()
  user.handle = event.params._handle
  user.withPoh = event.params._withPoh
  const platform = getOrCreatePlatform(event.params._platformId)
  user.platform = platform.id
  user.save()

  const protocol = getOrCreateProtocol()
  const currentTotalMintFees = protocol.totalMintFees || new BigInt(0)
  protocol.totalMintFees = currentTotalMintFees.plus(event.params._fee)
  protocol.save()
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handlePohActivated(event: PohActivated): void {
  const user = getOrCreateUser(event.params._tokenId)
  user.withPoh = true
  user.save()
}

export function handleTransfer(event: Transfer): void {}

export function handleMintFeeUpdated(event: MintFeeUpdated): void {
  const protocol = getOrCreateProtocol()
  protocol.userMintFee = event.params._mintFee
  protocol.save()
}
