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
import {generateProposalId, generateUniqueId} from "./utils";

export function handleJobProposalConfirmedWithDeposit(
    event: JobProposalConfirmedWithDeposit): void {
  const job = getOrCreateJob(event.params.jobId);

  const proposalId = generateProposalId(event.params.jobId.toString(), event.params.employeeId.toString());
  const proposal = getOrCreateProposal(proposalId);

  log.warning("!!!!!! proposal ID", [proposalId]);
  log.warning("!!!!!! job ID", [event.params.jobId.toString()]);

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

export function handlePayment(event: Payment): void {
  const paymentId = generateUniqueId(event.transaction.hash.toHex(), event.logIndex.toString());
  const payment = getOrCreatePayment(paymentId, event.params._jobId);

  payment.job = Job.load(event.params._jobId.toString())!.id;
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
