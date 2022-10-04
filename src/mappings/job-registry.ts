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
import { getOrCreateJob, getOrCreateProposal } from "../getters";

export function handleJobCreated(event: JobCreated): void {
  let job = getOrCreateJob(event.params.id);
  job.employer = User.load(event.params.employerId.toString())!.id;

  let employeeId = event.params.employeeId.toString();
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
  job.uri = event.params.jobDataUri;
  job.save();
}

export function handleJobConfirmed(event: JobConfirmed): void {
  let job = getOrCreateJob(event.params.id);
  job.status = "Confirmed";
  job.save();
}

export function handleJobFinished(event: JobFinished): void {
  let job = getOrCreateJob(event.params.id);
  job.status = "Finished";
  job.save();
}

export function handleJobRejected(event: JobRejected): void {
  let job = getOrCreateJob(event.params.id);
  job.status = "Rejected";
  job.save();
}

export function handleProposalCreated(event: ProposalCreated): void {
  let proposal = getOrCreateProposal(event.params.employeeId);
  proposal.status = "Pending";

  proposal.rateToken = event.params.rateToken;
  proposal.rateAmount = event.params.rateAmount;
  proposal.uri = event.params.proposalDataUri;
  proposal.job = Job.load(event.params.jobId.toString())!.id;
  proposal.employee = User.load(event.params.employeeId.toString())!.id;
  proposal.save();
}

export function handleProposalRejected(event: ProposalRejected): void {
  let proposal = getOrCreateProposal(event.params.employeeId);
  proposal.status = "Rejected";
  proposal.save();
}

export function handleProposalUpdated(event: ProposalUpdated): void {
  let proposal = getOrCreateProposal(event.params.employeeId);
  proposal.rateToken = event.params.rateToken;
  proposal.rateAmount = event.params.rateAmount;
  proposal.uri = event.params.proposalDataUri;
  proposal.save();
}
