import { BigInt, BigDecimal, Bytes, log } from '@graphprotocol/graph-ts'
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
  ThirdPartyLinked,
} from '../../generated/TalentLayerID/TalentLayerID'
import { getOrCreatePlatform, getOrCreateProtocol, getOrCreateUser, getOrCreateExternalId } from '../getters'

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

export function handleThirdPartyLinked(event: ThirdPartyLinked): void {
  const externalId = getOrCreateExternalId(event.params._tokenId)
  externalId.user = getOrCreateUser(event.params._tokenId).id

  for (let i = 0; i < event.params._thirdPartiesStrategiesID.length; i++) {
    // will make a switch case for each strategy
    log.info('TITITIT {}', [event.params._thirdPartiesStrategiesID[i].toString()])

    if (event.params._thirdPartiesStrategiesID[i].toString() == '0') {
      externalId.lensId = event.params.thirdPartyId
    } else if (event.params._thirdPartiesStrategiesID[i].toString() == '1') {
      externalId.pohId = event.params.thirdPartyId.toHexString()
    }
  }
  externalId.save()
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
