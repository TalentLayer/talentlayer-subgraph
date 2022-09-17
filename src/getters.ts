import { Address, BigInt } from "@graphprotocol/graph-ts";
import { User, Review, Job, Proposal } from "../generated/schema";
import { ZERO, ZERO_ADDRESS, ZERO_BIGDEC } from "./constants";

export function createAndGetJob(id: BigInt): Job {
  let job = Job.load(id.toString());
  if (!job) {
    job = new Job(id.toString());
    job.status = "Filled";
    job.uri = "";
    job.save();
  }
  return job;
}

export function createAndGetProposal(id: BigInt): Proposal {
  let proposal = Proposal.load(id.toString());
  if (!proposal) {
    proposal = new Proposal(id.toString());
    proposal.status = "Pending";
    // proposal.uri = "test";
    proposal.save();
  }
  return proposal;
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
    review.uri = "";
    review.save();
  }
  return review;
}

export function createAndGetUser(id: BigInt): User {
  let user = User.load(id.toString());
  if (!user) {
    user = new User(id.toString());
    user.address = ZERO_ADDRESS.toHex();
    user.handle = "";
    user.uri = "";
    user.withPoh = false;
    user.numReviews = ZERO;
    user.rating = ZERO_BIGDEC;
    user.save();
  }
  return user;
}
