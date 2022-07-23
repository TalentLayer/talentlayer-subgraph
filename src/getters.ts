import { Address, BigInt } from '@graphprotocol/graph-ts';
import { User, Review, Job } from '../generated/schema';
import { ZERO, ZERO_ADDRESS } from './constants';

export function createAndGetJob(id: BigInt): Job {
  let job = Job.load(id.toString());
  if (!job) {
    job = new Job(id.toString());
    job.status = 'Initialized';
    job.uri = '';
    job.save();
  }
  return job;
}

// job.employerId = event.params.employerId;
// job.employeeId = event.params.employeeId;
// job.senderId = event.params.initiatorId;
// if (event.params.initiatorId == event.params.employerId) {
//   job.recipientId = event.params.employeeId;
// } else if (event.params.initiatorId == event.params.employeeId) {
//   job.recipientId = event.params.employerId;
// } else {
//   log.error('Job created by neither employer nor employee, senderId: {}', [
//     event.params.initiatorId.toString(),
//   ]);
// }

export function createAndGetReview(
  id: BigInt,
  jobId: BigInt,
  toId: BigInt
): Review {
  let review = Review.load(id.toString());
  if (!review) {
    review = new Review(id.toString());
    review.to = createAndGetUser(toId).id;
    review.job = createAndGetJob(jobId).id;
    review.uri = '';
    review.save();
  }
  return review;
}

export function createAndGetUser(id: BigInt): User {
  let user = User.load(id.toString());
  if (!user) {
    user = new User(id.toString());
    user.address = ZERO_ADDRESS.toHex();
    user.handle = '';
    user.uri = '';
    user.withPoh = false;
    user.save();
  }
  return user;
}
