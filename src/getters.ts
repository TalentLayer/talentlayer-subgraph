import { BigInt, Bytes, Address, log, dataSource } from '@graphprotocol/graph-ts'
import {
  User,
  Review,
  Service,
  Proposal,
  Payment,
  Platform,
  Token,
  FeeClaim,
  FeePayment,
  PlatformGain,
  UserGain,
  Protocol,
  Transaction,
  Evidence,
  Keyword,
  UserStats,
} from '../generated/schema'
import { PROTOCOL_ID, ZERO, ZERO_ADDRESS, ZERO_BIGDEC, ZERO_TOKEN_ADDRESS } from './constants'
import { ERC20 } from '../generated/TalentLayerEscrow/ERC20'

export function getOrCreateService(id: BigInt): Service {
  let service = Service.load(id.toString())
  if (!service) {
    service = new Service(id.toString())
    service.status = 'Opened'
    service.createdAt = ZERO
    service.updatedAt = ZERO
    service.save()
  }
  return service
}

export function getOrCreateProposal(id: string, serviceId: BigInt): Proposal {
  let proposal = Proposal.load(id)
  if (!proposal) {
    proposal = new Proposal(id)
    proposal.status = 'Pending'
    proposal.createdAt = ZERO
    proposal.updatedAt = ZERO
    proposal.service = getOrCreateService(serviceId).id
    proposal.rateToken = getOrCreateToken(ZERO_ADDRESS).id
    proposal.expirationDate = ZERO
    proposal.save()
  }
  return proposal
}

export function getOrCreateReview(id: BigInt, serviceId: BigInt, toId: BigInt): Review {
  let review = Review.load(id.toString())
  if (!review) {
    review = new Review(id.toString())
    review.to = getOrCreateUser(toId).id
    review.service = getOrCreateService(serviceId).id
    review.createdAt = ZERO
    review.save()
  }
  return review
}

export function getOrCreateUser(id: BigInt): User {
  let user = User.load(id.toString())
  if (!user) {
    user = new User(id.toString())
    user.index = id
    user.address = ZERO_ADDRESS.toHex()
    user.handle = ''
    user.rating = ZERO_BIGDEC
    user.createdAt = ZERO
    user.updatedAt = ZERO
    user.delegates = []
    user.save()

    user.userStats = getOrCreateUserStats(id).id
    user.save()
  }

  return user
}

export function getOrCreateUserStats(id: BigInt): UserStats {
  let userStats = UserStats.load(id.toString())
  if (!userStats) {
    userStats = new UserStats(id.toString())
    userStats.user = getOrCreateUser(id).id
    userStats.numReceivedReviews = ZERO
    userStats.numGivenReviews = ZERO
    userStats.numCreatedServices = ZERO
    userStats.numFinishedServicesAsBuyer = ZERO
    userStats.numCreatedProposals = ZERO
    userStats.numFinishedServicesAsSeller = ZERO
    userStats.save()
  }
  return userStats
}

export function getOrCreateTransaction(id: BigInt, blockTimestamp: BigInt = ZERO): Transaction {
  let transaction = Transaction.load(id.toString())
  if (!transaction) {
    transaction = new Transaction(id.toString())
    transaction.token = ''
    transaction.amount = ZERO
    transaction.protocolEscrowFeeRate = 0
    transaction.originServiceFeeRate = 0
    transaction.originValidatedProposalFeeRate = 0
    transaction.senderFee = ZERO
    transaction.receiverFee = ZERO
    transaction.lastInteraction = blockTimestamp
    transaction.status = 'NoDispute'
    transaction.arbitrator = ZERO_ADDRESS
    transaction.arbitratorExtraData = Bytes.empty()
    transaction.arbitrationFeeTimeout = ZERO
    transaction.metaEvidenceUri = ''
    transaction.save()
  }
  return transaction
}

export function getOrCreatePayment(paymentId: string, serviceId: BigInt): Payment {
  let payment = Payment.load(paymentId)
  if (!payment) {
    payment = new Payment(paymentId.toString())
    payment.service = getOrCreateService(serviceId).id
    payment.amount = ZERO
    payment.paymentType = ''
  }
  return payment
}

export function getOrCreatePlatform(platformId: BigInt): Platform {
  let platform = Platform.load(platformId.toString())
  if (!platform) {
    platform = new Platform(platformId.toString())
    platform.address = ZERO_ADDRESS
    platform.createdAt = ZERO
    platform.updatedAt = ZERO
    platform.name = ''
    platform.originServiceFeeRate = 0
    platform.originValidatedProposalFeeRate = 0
    platform.servicePostingFee = ZERO
    platform.proposalPostingFee = ZERO
    platform.arbitrator = ZERO_ADDRESS
    platform.arbitratorExtraData = Bytes.empty()
    platform.arbitrationFeeTimeout = ZERO
    platform.signer = ZERO_ADDRESS
    platform.save()
  }
  return platform
}

export function getOrCreateToken(tokenAddress: Bytes): Token {
  let contract = ERC20.bind(Address.fromBytes(tokenAddress))
  let token = Token.load(tokenAddress.toHex())

  if (!token) {
    token = new Token(tokenAddress.toHex())
    token.address = tokenAddress
    token.minimumTransactionAmount = ZERO

    if (tokenAddress.toHex() == ZERO_TOKEN_ADDRESS) {
      if (dataSource.network() == 'matic' || dataSource.network() == 'mumbai') {
        token.symbol = 'MATIC'
        token.name = 'Polygon'
      } else if (dataSource.network() == 'avalanche' || dataSource.network() == 'fuji') {
        token.symbol = 'AVAX'
        token.name = 'Avalanche'
      } else if (dataSource.network() == 'iexec') {
        token.symbol = 'RLC'
        token.name = 'iExec RLC'
      } else {
        token.symbol = 'ETH'
        token.name = 'Ether'
      }
      token.decimals = BigInt.fromString('18')
    } else {
      let callResultSymbol = contract.try_symbol()
      if (callResultSymbol.reverted) {
        log.warning('Symbol Reverted {}', ['Reverted'])
        token.symbol = 'UKN'
      } else {
        let result = callResultSymbol.value
        log.info('Symbol {}', [result])
        token.symbol = result
      }

      let callResultName = contract.try_name()
      if (callResultName.reverted) {
        log.warning('Name Reverted {}', ['Reverted'])
        token.name = 'Unknown'
      } else {
        let result = callResultName.value
        log.info('Name {}', [result])
        token.name = result
      }

      let callResultDecimal = contract.try_decimals()
      if (callResultDecimal.reverted) {
        log.warning('Decimals Reverted {}', ['Reverted'])
        token.decimals = ZERO
      } else {
        let result = callResultDecimal.value
        log.info('Decimals {}', [result.toString()])
        token.decimals = BigInt.fromI32(result)
      }
    }
    // Token initially set to non-allowed. Status will be handled in "handleAllowedTokenListUpdated" handler
    token.allowed = false
    token.save()
  }
  return token
}

export function getOrCreateOriginPlatformFee(paymentId: string): FeePayment {
  let originPlatformFeePayment = FeePayment.load(paymentId)
  if (!originPlatformFeePayment) {
    originPlatformFeePayment = new FeePayment(paymentId)
    originPlatformFeePayment.type = 'OriginPlatform'
    originPlatformFeePayment.amount = ZERO
    originPlatformFeePayment.save()
  }
  return originPlatformFeePayment
}

export function getOrCreatePlatformFee(paymentId: string): FeePayment {
  let platformFeePayment = FeePayment.load(paymentId)
  if (!platformFeePayment) {
    platformFeePayment = new FeePayment(paymentId)
    platformFeePayment.type = 'Platform'
    platformFeePayment.amount = ZERO
    platformFeePayment.save()
  }
  return platformFeePayment
}

export function getOrCreateClaim(claimId: string): FeeClaim {
  let claim = FeeClaim.load(claimId)
  if (!claim) {
    claim = new FeeClaim(claimId)
    claim.amount = ZERO
    claim.save()
  }
  return claim
}

export function getOrCreatePlatformGain(gainId: string): PlatformGain {
  let platformGain = PlatformGain.load(gainId)
  if (!platformGain) {
    platformGain = new PlatformGain(gainId)
    platformGain.totalOriginPlatformFeeGain = ZERO
    platformGain.totalPlatformFeeGain = ZERO
    platformGain.save()
  }
  return platformGain
}

export function getOrCreateUserGain(gainId: string, userId: BigInt): UserGain {
  let userGain = UserGain.load(gainId)
  if (!userGain) {
    userGain = new UserGain(gainId)
    userGain.totalGain = ZERO
    userGain.user = getOrCreateUser(userId).id
    userGain.save()
  }
  return userGain
}

export function getOrCreateProtocol(): Protocol {
  let protocol = Protocol.load(PROTOCOL_ID)
  if (!protocol) {
    protocol = new Protocol(PROTOCOL_ID)
    protocol.userMintFee = ZERO
    protocol.platformMintFee = ZERO
    protocol.protocolEscrowFeeRate = 0
    protocol.totalMintFees = ZERO
    protocol.minArbitrationFeeTimeout = ZERO
    protocol.shortHandlesMaxPrice = ZERO
    protocol.minServiceCompletionPercentage = ZERO
  }
  return protocol
}

export function getOrCreateEvidence(evidenceId: string, transactionId: BigInt): Evidence {
  let evidence = Evidence.load(evidenceId)
  if (!evidence) {
    evidence = new Evidence(evidenceId)
    evidence.createdAt = ZERO
    evidence.cid = ''
    evidence.transaction = getOrCreateTransaction(transactionId).id
  }
  return evidence
}

export function getOrCreateKeyword(id: string): Keyword {
  let keyword = Keyword.load(id)
  if (!keyword) {
    keyword = new Keyword(id)
    keyword.save()
  }
  return keyword
}
