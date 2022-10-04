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
  let job = getOrCreateJob(event.params.id);
  let proposal = getOrCreateProposal(event.params.proposalId);
  log.warning("!!!!!! proposal ID", [event.params.proposalId.toString()]);
  log.warning("!!!!!! job ID", [event.params.id.toString()]);

  job.status = "Confirmed";
  job.transactionId = event.params.transactionId.toString();
  job.employer = User.load(event.params.employeeId.toString())!.id;
  job.save();

  proposal.status = "Validated";
  proposal.save();
}

export function handlePaymentCompleted(event: PaymentCompleted): void {
  let job = getOrCreateJob(event.params._jobId);
  job.status = "Finished";
  job.save();
}

export function handlePayment(event: Payment): void {
  //TODO: For payment Id, use transactionID ?
  let payment = getOrCreatePayment(event.params._transactionID, event.params._jobId);
  payment.job = Job.load(event.params._jobId.toString())!.id;
  payment.amount = event.params._amount;
  payment.party = event.params._party;
  payment.rateToken = event.params._token;
  payment.save();
}
