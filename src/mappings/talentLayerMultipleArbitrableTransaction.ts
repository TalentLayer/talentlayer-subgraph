import { log } from "@graphprotocol/graph-ts";
import {Job, User} from "../../generated/schema";
import {
  getOrCreateJob,
  getOrCreatePayment,
  getOrCreateProposal
} from "../getters";
import {
  JobProposalConfirmedWithDeposit, Payment,
  PaymentCompleted,
} from "../../generated/TalentLayerMultipleArbitrableTransaction/TalentLayerMultipleArbitrableTransaction";

export function handleJobProposalConfirmedWithDeposit(
  event: JobProposalConfirmedWithDeposit
): void {
  const job = getOrCreateJob(event.params.id);
  const proposal = getOrCreateProposal(event.params.proposalId);
  log.warning("!!!!!! proposal ID", [event.params.proposalId.toString()]);
  log.warning("!!!!!! job ID", [event.params.id.toString()]);

  job.status = "Confirmed";
  job.transactionId = event.params.transactionId.toString();
  job.employee = User.load(event.params.employeeId.toString())!.id;
  job.save();

  proposal.status = "Validated";
  proposal.save();
}

export function handlePaymentCompleted(event: PaymentCompleted): void {
  const job = getOrCreateJob(event.params._jobId);
  job.status = "Finished";
  job.save();
}

// export function handlePayment({ params, transaction, logIndex }: Payment): void {
export function handlePayment(event: Payment): void {
  const paymentId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  const payment = getOrCreatePayment(paymentId, event.params._jobId);

  payment.job = Job.load(event.params._jobId.toString())!.id;
  payment.amount = event.params._amount;

  if(event.params._paymentType === 0){
    payment.paymentType = 'Release';
  }
  if(event.params._paymentType === 1){
    payment.paymentType = 'Reimburse';
  }

  payment.transactionHash = event.transaction.hash.toHexString();
  payment.rateToken = event.params._token;
  payment.save();
}
