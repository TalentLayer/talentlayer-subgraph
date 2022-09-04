import { log } from '@graphprotocol/graph-ts';
import { User } from '../../generated/schema';
import {
  JobCreated,
  JobConfirmed,
  JobFinished,
  JobRejected,
} from '../../generated/JobRegistry/JobRegistry';
import { createAndGetJob } from '../getters';

export function handleJobCreated(event: JobCreated): void {
  let job = createAndGetJob(event.params.id);
  job.employer = User.load(event.params.employerId.toString())!.id;
  job.employee = User.load(event.params.employeeId.toString())!.id;
  job.sender = User.load(event.params.initiatorId.toString())!.id;
  if (event.params.initiatorId == event.params.employerId) {
    job.recipient = job.employee;
  } else if (event.params.initiatorId == event.params.employeeId) {
    job.recipient = job.employer;
  } else {
    log.error('Job created by neither employer nor employee, senderId: {}', [
      event.params.initiatorId.toString(),
    ]);
  }
  job.uri = event.params.jobDataUri;
  job.status = event.params.status;
  job.save();
}

export function handleJobConfirmed(event: JobConfirmed): void {
  let job = createAndGetJob(event.params.id);
  job.status = 'Confirmed';
  job.save();
}

export function handleJobFinished(event: JobFinished): void {
  let job = createAndGetJob(event.params.id);
  job.status = 'Finished';
  job.save();
}

export function handleJobRejected(event: JobRejected): void {
  let job = createAndGetJob(event.params.id);
  job.status = 'Rejected';
  job.save();
}
