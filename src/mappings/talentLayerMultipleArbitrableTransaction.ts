import { log } from "@graphprotocol/graph-ts";
import { User } from "../../generated/schema";
import { createAndGetJob, createAndGetProposal } from "../getters";
import {
  JobProposalConfirmedWithDeposit,
  PaymentCompleted,
} from "../../generated/TalentLayerMultipleArbitrableTransaction/TalentLayerMultipleArbitrableTransaction";
import { generateProposalId } from "./utils";

export function handleJobProposalConfirmedWithDeposit(
    { params }: JobProposalConfirmedWithDeposit
): void {
  const job = createAndGetJob(params.jobId);

  const proposalId = generateProposalId(params.jobId.toString(), params.employeeId.toString());
  const proposal = createAndGetProposal(proposalId);

  log.warning("!!!!!! proposal ID", [proposalId]);
  log.warning("!!!!!! job ID", [params.jobId.toString()]);

  job.status = "Confirmed";
  job.transactionId = params.transactionId.toString();
  job.employee = User.load(params.employeeId.toString())!.id;
  job.save();

  proposal.status = "Validated";
  proposal.save();
}

export function handlePaymentCompleted({ params }: PaymentCompleted): void {
  const job = createAndGetJob(params._jobId);
  job.status = "Finished";
  job.save();
}
