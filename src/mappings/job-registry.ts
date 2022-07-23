import {
  JobCreated,
  JobConfirmed,
  JobFinished,
  JobRejected,
} from '../../generated/JobRegistry/JobRegistry';
import { createAndGetJob } from '../getters';

export function handleJobCreated(event: JobCreated): void {
  let job = createAndGetJob(event.params.id);
  job.employerId = event.params.employerId;
  job.employeeId = event.params.employeeId;
  job.senderId = event.params.initiatorId;
  job.jobDataUri = event.params.jobDataUri;
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
