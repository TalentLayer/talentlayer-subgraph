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
  JobDataCreated,
} from "../../generated/JobRegistry/JobRegistry";
import { getOrCreateJob, getOrCreateProposal } from "../getters";
import { generateProposalId } from "./utils";

export function handleJobCreated(event: JobCreated): void {
  const job = getOrCreateJob(event.params.id);
  job.employer = User.load(event.params.employerId.toString())!.id;

  const employeeId = event.params.employeeId.toString();
  log.warning("employee: {}", [employeeId]);
  if (employeeId != "0") {
    job.employee = User.load(employeeId)!.id;
  } else {
    job.status = "Opened";
  }

  job.sender = User.load(event.params.initiatorId.toString())!.id;
  if (event.params.initiatorId == event.params.employerId) {
    job.recipient = job.employee;
  } else if (event.params.initiatorId == event.params.employeeId) {
    job.recipient = job.employer;
  } else {
    log.error("Job created by neither employer nor employee, senderId: {}", [
      event.params.initiatorId.toString(),
    ]);
  }

  job.createdAt = event.block.timestamp;
  job.updatedAt = event.block.timestamp;

  job.platformId = event.params.platformId.toString();

  job.save();
}
export function handleJobDataCreated(event: JobDataCreated): void {
  const job = getOrCreateJob(event.params.id);

  job.uri = event.params.jobDataUri;

  job.save();
}

export function handleJobConfirmed(event: JobConfirmed): void {
  const job = getOrCreateJob(event.params.id);
  job.status = "Confirmed";
  job.updatedAt = event.block.timestamp;
  job.save();
}

export function handleJobFinished(event: JobFinished): void {
  const job = getOrCreateJob(event.params.id);
  job.status = "Finished";
  job.updatedAt = event.block.timestamp;
  job.save();
}

export function handleJobRejected(event: JobRejected): void {
  const job = getOrCreateJob(event.params.id);
  job.status = "Rejected";
  job.updatedAt = event.block.timestamp;
  job.save();
}

export function handleProposalCreated(event: ProposalCreated): void {
  const proposalId = generateProposalId(event.params.jobId.toString(), event.params.employeeId.toString());
  const proposal = getOrCreateProposal(proposalId);
  proposal.status = "Pending";

  proposal.rateToken = event.params.rateToken;
  proposal.rateAmount = event.params.rateAmount;
  proposal.uri = event.params.proposalDataUri;
  proposal.job = Job.load(event.params.jobId.toString())!.id;
  proposal.employee = User.load(event.params.employeeId.toString())!.id;

  proposal.createdAt = event.block.timestamp;
  proposal.updatedAt = event.block.timestamp;

  proposal.save();
}

export function handleProposalRejected(event: ProposalRejected): void {
  const proposalId = generateProposalId(event.params.jobId.toString(), event.params.employeeId.toString());
  const proposal = getOrCreateProposal(proposalId);
  proposal.status = "Rejected";
  proposal.updatedAt = event.block.timestamp;
  proposal.save();
}

export function handleProposalUpdated(event: ProposalUpdated): void {
  const proposalId = generateProposalId(event.params.jobId.toString(), event.params.employeeId.toString());
  const proposal = getOrCreateProposal(proposalId);
  proposal.rateToken = event.params.rateToken;
  proposal.rateAmount = event.params.rateAmount;
  proposal.uri = event.params.proposalDataUri;
  proposal.updatedAt = event.block.timestamp;
  proposal.save();
}
