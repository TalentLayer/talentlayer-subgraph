import { BigInt } from "@graphprotocol/graph-ts";
import {
  User,
  Review,
  Job,
  Proposal,
  Payment,
  Platform
} from "../generated/schema";
import { ZERO, ZERO_ADDRESS, ZERO_BIGDEC } from "./constants";

export function getOrCreateJob(id: BigInt): Job {
  let job = Job.load(id.toString());
  if (!job) {
    job = new Job(id.toString());
    job.status = "Filled";
    job.uri = "";
    job.save();
  }
  return job;
}

export function getOrCreateProposal(id: string): Proposal {
  let proposal = Proposal.load(id);
  if (!proposal) {
    proposal = new Proposal(id);
    proposal.status = "Pending";
    proposal.save();
  }
  return proposal;
}

export function getOrCreateReview(
  id: BigInt,
  jobId: BigInt,
  toId: BigInt
): Review {
  let review = Review.load(id.toString());
  if (!review) {
    review = new Review(id.toString());
    review.to = getOrCreateUser(toId).id;
    review.job = getOrCreateJob(jobId).id;
    review.uri = "";
    review.save();
  }
  return review;
}

export function getOrCreateUser(id: BigInt): User {
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

export function getOrCreatePayment(paymentId: string, jobId: BigInt): Payment {
  let payment = Payment.load(paymentId);
  if (!payment) {
    payment = new Payment(paymentId.toString());
    payment.job = getOrCreateJob(jobId).id;
    payment.amount = ZERO;
    payment.rateToken = ZERO_ADDRESS;
    payment.paymentType = '';
  }
  return payment;
}

export function getOrCreatePlatform(platformId: BigInt): Platform {
  let platform = Platform.load(platformId.toString());
  if (!platform) {
    platform = new Platform(platformId.toString());
    platform.address = ZERO_ADDRESS;
    platform.name = "";
    platform.uri = "";
    platform.save();
  }
  return platform;
}