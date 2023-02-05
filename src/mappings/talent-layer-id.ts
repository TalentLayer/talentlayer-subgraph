import { BigInt, DataSourceContext, store, Address, log, dataSource } from '@graphprotocol/graph-ts'
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
import { LensHubProxy } from '../../generated/TalentLayerID/LensHubProxy'

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

  user.updatedAt = event.block.timestamp
  if (!oldCid) {
    user.createdAt = event.block.timestamp
  }

  //Notice: Storing cid required to remove on userDetailUpdated
  //Reason: Datastore can not get created entities.
  //When the issue is solved it may be possible to swap cid with userId
  //Alternatively the cid can be fetched and removed in the file data source template (ipfs-data.ts)
  //Open issue: https://github.com/graphprotocol/graph-node/issues/4087
  user.cid = newCid

  // we log datasource network
  log.info('NETWORK : {}', [dataSource.network()])

  const userAddress = Address.fromString(user.address)
  log.info('userAddress: {}', [userAddress.toHexString()])
  const lensDefault = BigInt.fromI32(0)

  if (dataSource.network() == 'mainnet') {
    log.info('network is mainnet', [])
    let lensId = LensHubProxy.bind(Address.fromString('0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d'))
    let lensUsertokenId = lensId.try_tokenOfOwnerByIndex(Address.fromString(user.address), BigInt.zero())
    const tokenValue = lensUsertokenId.reverted ? lensDefault : lensUsertokenId.value
    user.lensID = tokenValue

    let lensUserHandle = lensId.try_getHandle(tokenValue)
    const handleValue = lensUserHandle.reverted ? '' : lensUserHandle.value
    user.lensHandle = handleValue
  } else if (dataSource.network() == 'mumbai') {
    log.info('network is mumbai', [])
    let lensId = LensHubProxy.bind(Address.fromString('0x60Ae865ee4C725cd04353b5AAb364553f56ceF82'))
    let lensUsertokenId = lensId.try_tokenOfOwnerByIndex(Address.fromString(user.address), BigInt.zero())
    const tokenValue = lensUsertokenId.reverted ? lensDefault : lensUsertokenId.value
    user.lensID = tokenValue

    let lensUserHandle = lensId.try_getHandle(tokenValue)
    const handleValue = lensUserHandle.reverted ? '' : lensUserHandle.value
    user.lensHandle = handleValue
  }

  user.save()

  const context = new DataSourceContext()
  context.setBigInt('userId', userId)

  // Removes user description from store to save space.
  // Problem: unsuccessful ipfs fetch sets userDescription.user to null.
  // Reason: store.remove can not be called from within file datastore (ipfs-data).
  // Solution: do not use store.remove when the following issue has been solved:
  // Open issue: https://github.com/graphprotocol/graph-node/issues/4087
  // When the issue is solved, change userDescription.id from cid to userId.
  if (oldCid) {
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
