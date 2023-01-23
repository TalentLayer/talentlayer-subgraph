import { BigInt, DataSourceContext, store } from '@graphprotocol/graph-ts'
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
  const userId = event.params._tokenId
  const user = getOrCreateUser(userId)
  const newCid = event.params._newCid
  const oldCid = user.cid
  
  user.updated = event.block.timestamp
  if(!oldCid){
    user.created = event.block.timestamp
  }

  //Notice: Storing cid required to remove on userDetailUpdated
  //Reason: Datastore can not get created entities.
  //When the issue is solved it may be possible to swap cid with userId
  //Alternatively the cid can be fetched and removed in the file data source template (ipfs-data.ts)
  //Open issue: https://github.com/graphprotocol/graph-node/issues/4087
  user.cid = newCid

  user.save()

  const context = new DataSourceContext()
  context.setBigInt('userId', userId)

 // Removes user description from store to save space.
 // Problem: unsuccessful ipfs fetch sets userDescription.user to null.
 // Reason: store.remove can not be called from within file datastore (ipfs-data).
 // Solution: do not use store.remove when the following issue has been solved:
 // Open issue: https://github.com/graphprotocol/graph-node/issues/4087
 // When the issue is solved, change userDescription.id from cid to userId.
  if(oldCid){
    store.remove('UserDescription', oldCid)
  }

  UserData.createWithContext(newCid, context) 
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
