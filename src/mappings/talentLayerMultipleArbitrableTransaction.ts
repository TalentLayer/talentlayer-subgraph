import { log } from "@graphprotocol/graph-ts";
import { Job, User } from "../../generated/schema";
// import {
//   Approval,
//   ApprovalForAll,
//   Mint,
//   Transfer,
// } from "../../generated/TalentLayerReview/TalentLayerReview";
import { createAndGetJob, createAndGetProposal } from "../getters";
import {
  JobProposalConfirmedWithDeposit,
  Payment,
} from "../../generated/TalentLayerMultipleArbitrableTransaction/TalentLayerMultipleArbitrableTransaction";

export function handleJobProposalConfirmedWithDeposit(
  event: JobProposalConfirmedWithDeposit
): void {
  let job = createAndGetJob(event.params.id);
  let proposal = createAndGetProposal(event.params.proposalId);
  log.warning("!!!!!! proposal ID", [event.params.proposalId.toString()]);
  log.warning("!!!!!! job ID", [event.params.id.toString()]);

  job.status = "Confirmed";
  job.transactionId = event.params.transactionId.toString();
  job.employer = User.load(event.params.employeeId.toString())!.id;
  job.save();

  proposal.status = "Validated";
  proposal.save();
}

// export function handlePayment(event: Payment): void {
//   let job = createAndGetJob(event.params.jobId);
//   let proposal = createAndGetProposal(event.params._transactionID);

//   job.transactionId = event.params._transactionID.toString();
//   job.proposals.rateAmount = event.params._amount;
//   job.sender = event.params._party;
//   job.status = "Finished";
//   job.save();

//   proposal.rateAmount = event.params._amount;
//   proposal.id = event.params._transactionID.toString();
//   proposal.status = "Validated";
//   proposal.save();
// }
