import { Address, BigInt } from '@graphprotocol/graph-ts';
import { User, Review, Job } from '../generated/schema';
import { ZERO, ZERO_ADDRESS } from './constants';

export function createAndGetJob(id: BigInt): Job {
  let job = Job.load(id.toString());
  if (!job) {
    job = new Job(id.toString());
    job.status = 'Initialized';
    job.employerId = ZERO;
    job.employeeId = ZERO;
    job.senderId = ZERO;
    job.recipientId = ZERO;
    job.uri = '';
    job.save();
  }
  return job;
}

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
