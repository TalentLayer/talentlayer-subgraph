import { log } from "@graphprotocol/graph-ts";
import {Service, User} from "../../generated/schema";
import {
  getOrCreateService,
  getOrCreatePayment,
  getOrCreateProposal,
  getOrCreateOriginPlatformFee,
  getOrCreatePlatformFee,
  getOrCreateClaim
} from "../getters";
import {
  ServiceProposalConfirmedWithDeposit,
  Payment,
  PaymentCompleted,
  BalanceTransferred,
  OriginPlatformFeeReleased, PlatformFeeReleased,
} from "../../generated/TalentLayerMultipleArbitrableTransaction/TalentLayerMultipleArbitrableTransaction";
import {generateProposalId, generateUniqueId} from "./utils";

export function handleServiceProposalConfirmedWithDeposit(
    event: ServiceProposalConfirmedWithDeposit): void {
  const service = getOrCreateService(event.params.serviceId);

  const proposalId = generateProposalId(event.params.serviceId.toString(), event.params.sellerId.toString());
  const proposal = getOrCreateProposal(proposalId);

  log.warning("!!!!!! proposal ID", [proposalId]);
  log.warning("!!!!!! service ID", [event.params.serviceId.toString()]);

  service.status = "Confirmed";
  service.transactionId = event.params.transactionId.toString();
  service.seller = User.load(event.params.sellerId.toString())!.id;
  service.save();

  proposal.status = "Validated";
  proposal.save();
}

export function handlePaymentCompleted(event: PaymentCompleted): void {
  const service = getOrCreateService(event.params._serviceId);
  service.status = "Finished";
  service.save();
}

export function handlePayment(event: Payment): void {
  const paymentId = generateUniqueId(event.transaction.hash.toHex(), event.logIndex.toString());
  const payment = getOrCreatePayment(paymentId, event.params._serviceId);

  payment.service = Service.load(event.params._serviceId.toString())!.id;
  payment.amount = event.params._amount;
  payment.rateToken = event.params._token;

  if(event.params._paymentType === 0){
    payment.paymentType = 'Release';
  }
  if(event.params._paymentType === 1){
    payment.paymentType = 'Reimburse';
  }

  payment.transactionHash = event.transaction.hash.toHex();
  payment.save();
}

export function handleBalanceTransferred(event: BalanceTransferred): void {
  const claimId = generateUniqueId(event.transaction.hash.toHex(), event.logIndex.toString());
  const claim = getOrCreateClaim(claimId);
  claim.platform = event.params._platformId.toString();
  claim.token = event.params._token;
  claim.amount = event.params._amount;

  claim.transactionHash = event.transaction.hash.toHex();
  claim.createdAt = event.block.timestamp;
  claim.save();
}

export function handleOriginPlatformFeeReleased(event: OriginPlatformFeeReleased): void {
  const paymentId = generateUniqueId(event.transaction.hash.toHex(), event.logIndex.toString());
  const originPlatformFeePayment = getOrCreateOriginPlatformFee(paymentId);
  originPlatformFeePayment.amount = event.params._amount;
  originPlatformFeePayment.platform = event.params._platformId.toString();
  originPlatformFeePayment.service = event.params._serviceId.toString();
  originPlatformFeePayment.token = event.params._token;

  originPlatformFeePayment.createdAt = event.block.timestamp;
  originPlatformFeePayment.save();
}

export function handlePlatformFeeReleased(event: PlatformFeeReleased): void {
  const paymentId = generateUniqueId(event.transaction.hash.toHex(), event.logIndex.toString());
  const platformFeePayment = getOrCreatePlatformFee(paymentId);
  platformFeePayment.amount = event.params._amount;
  platformFeePayment.platform = event.params._platformId.toString();
  platformFeePayment.service = event.params._serviceId.toString();
  platformFeePayment.token = event.params._token;

  platformFeePayment.createdAt = event.block.timestamp;
  platformFeePayment.save();
}
