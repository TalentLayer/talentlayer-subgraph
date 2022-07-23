import { Address, BigInt } from '@graphprotocol/graph-ts';
import { User, Review, Job } from '../generated/schema';
import { ZERO } from './constants';

export function createAndGetJob(id: BigInt): Job {
  let job = Job.load(id.toString());
  if (!job) {
    job = new Job(id.toString());
    job.employerId = ZERO;
    job.employeeId = ZERO;
    job.initiatorId = ZERO;
    job.jobDataUri = '';
    job.save();
  }
  return job;
}

export function createAndGetReview(address: Address): Review {
  let review = Review.load(address.toHex());
  if (!review) {
    review = new Review(address.toHex());
    review.jobId = ZERO;
    review.toId = ZERO;
    review.tokenId = ZERO;
    review.reviewUri = '';
    review.save();
  }
  return review;
}

export function createAndGetUser(address: Address): User {
  let user = User.load(address.toHex());
  if (!user) {
    user = new User(address.toHex());
    user.userTokenId = ZERO;
    user.handle = '';
    user.save();
  }
  return user;
}
