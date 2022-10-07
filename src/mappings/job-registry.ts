import { log } from "@graphprotocol/graph-ts";
import { Job, User } from "../../generated/schema";
import {
  JobCreated,
  JobConfirmed,
  JobFinished,
  JobRejected,
  ProposalCreated,
  ProposalRejected,
  ProposalUpdated,
} from "../../generated/JobRegistry/JobRegistry";
import { createAndGetJob, createAndGetProposal } from "../getters";
import {generateProposalId} from "./utils";

export function handleJobCreated({ params, block }: JobCreated): void {
  const job = createAndGetJob(params.id);
  job.employer = User.load(params.employerId.toString())!.id;

  const employeeId = params.employeeId.toString();
  log.warning("employee: {}", [employeeId]);
  if (employeeId != "0") {
    job.employee = User.load(employeeId)!.id;
  } else {
    job.status = "Opened";
  }

  job.sender = User.load(params.initiatorId.toString())!.id;
  if (params.initiatorId == params.employerId) {
    job.recipient = job.employee;
  } else if (params.initiatorId == params.employeeId) {
    job.recipient = job.employer;
  } else {
    log.error("Job created by neither employer nor employee, senderId: {}", [
      params.initiatorId.toString(),
    ]);
  }

  job.uri = params.jobDataUri;

  job.createdAt = block.timestamp;
  job.updatedAt = block.timestamp;

  job.save();
}

export function handleJobConfirmed({ params, block }: JobConfirmed): void {
  const job = createAndGetJob(params.id);
  job.status = "Confirmed";
  job.updatedAt = block.timestamp;
  job.save();
}

export function handleJobFinished({ params, block }: JobFinished): void {
  const job = createAndGetJob(params.id);
  job.status = "Finished";
  job.updatedAt = block.timestamp;
  job.save();
}

export function handleJobRejected({ params, block }: JobRejected): void {
  const job = createAndGetJob(params.id);
  job.status = "Rejected";
  job.updatedAt = block.timestamp;
  job.save();
}

export function handleProposalCreated({ params, block }: ProposalCreated): void {
  const proposalId = generateProposalId(params.jobId.toString(), params.employeeId.toString());
  const proposal = createAndGetProposal(proposalId);
  proposal.status = "Pending";

  proposal.rateToken = params.rateToken;
  proposal.rateAmount = params.rateAmount;
  proposal.uri = params.proposalDataUri;
  proposal.job = Job.load(params.jobId.toString())!.id;
  proposal.employee = User.load(params.employeeId.toString())!.id;

  proposal.createdAt = block.timestamp;
  proposal.updatedAt = block.timestamp;

  proposal.save();
}

export function handleProposalRejected({ params, block }: ProposalRejected): void {
  const proposalId = generateProposalId(params.jobId.toString(), params.employeeId.toString());
  const proposal = createAndGetProposal(proposalId);
  proposal.status = "Rejected";
  proposal.updatedAt = block.timestamp;
  proposal.save();
}

export function handleProposalUpdated({ params, block }: ProposalUpdated): void {
  const proposalId = generateProposalId(params.jobId.toString(), params.employeeId.toString());
  const proposal = createAndGetProposal(proposalId);
  proposal.rateToken = params.rateToken;
  proposal.rateAmount = params.rateAmount;
  proposal.uri = params.proposalDataUri;
  proposal.updatedAt = block.timestamp;
  proposal.save();
}
