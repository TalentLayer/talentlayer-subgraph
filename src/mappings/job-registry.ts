import { JobCreated } from '../../generated/JobRegistry/JobRegistry';
import { createAndGetJob } from '../getters';

export function handleCreateJob(event: JobCreated): void {
  let job = createAndGetJob(event.params.id);
  job.employerId = event.params.employerId;
  job.employeeId = event.params.employeeId;
  job.initiatorId = event.params.initiatorId;
  job.jobDataUri = event.params.jobDataUri;
  job.save();
}
