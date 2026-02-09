import { BigInt, BigDecimal, Bytes } from "@graphprotocol/graph-ts";
import {
  NewFeedback,
  FeedbackRevoked,
  ResponseAppended,
} from "../generated/ReputationRegistry/ReputationRegistry";
import { Agent, Feedback, Response } from "../generated/schema";

/**
 * Handle new feedback event
 */
export function handleNewFeedback(event: NewFeedback): void {
  let agentId = event.params.agentId.toString();
  let agent = Agent.load(agentId);

  if (agent == null) {
    // Agent should exist, but create if missing
    agent = new Agent(agentId);
    agent.agentId = event.params.agentId;
    agent.feedbackCount = BigInt.fromI32(0);
    agent.createdAt = event.block.timestamp;
  }

  // Create feedback entity
  let feedbackId =
    agentId +
    "-" +
    event.params.clientAddress.toHexString() +
    "-" +
    event.params.feedbackIndex.toString();
  let feedback = new Feedback(feedbackId);

  feedback.agent = agentId;
  feedback.agentId = event.params.agentId;
  feedback.clientAddress = event.params.clientAddress;
  feedback.feedbackIndex = event.params.feedbackIndex;
  feedback.value = BigInt.fromSignedI128(event.params.value);
  feedback.valueDecimals = event.params.valueDecimals;
  feedback.tag1 = event.params.tag1;
  feedback.tag2 = event.params.tag2;
  feedback.isRevoked = false;
  feedback.endpoint = event.params.endpoint;
  feedback.feedbackURI = event.params.feedbackURI;
  feedback.feedbackHash = event.params.feedbackHash;
  feedback.createdAt = event.block.timestamp;
  feedback.revokedAt = BigInt.fromI32(0);
  feedback.save();

  // Update agent feedback count
  agent.feedbackCount = agent.feedbackCount.plus(BigInt.fromI32(1));
  agent.updatedAt = event.block.timestamp;

  // Recalculate trust score
  updateTrustScore(agent);
  agent.save();
}

/**
 * Handle feedback revoked event
 */
export function handleFeedbackRevoked(event: FeedbackRevoked): void {
  let agentId = event.params.agentId.toString();
  let feedbackId =
    agentId +
    "-" +
    event.params.clientAddress.toHexString() +
    "-" +
    event.params.feedbackIndex.toString();

  let feedback = Feedback.load(feedbackId);
  if (feedback != null) {
    feedback.isRevoked = true;
    feedback.revokedAt = event.block.timestamp;
    feedback.save();

    // Recalculate trust score
    let agent = Agent.load(agentId);
    if (agent != null) {
      updateTrustScore(agent);
      agent.save();
    }
  }
}

/**
 * Handle response appended event
 */
export function handleResponseAppended(event: ResponseAppended): void {
  let agentId = event.params.agentId.toString();
  let responseId =
    agentId +
    "-" +
    event.params.clientAddress.toHexString() +
    "-" +
    event.params.feedbackIndex.toString() +
    "-" +
    event.params.responder.toHexString() +
    "-" +
    event.block.timestamp.toString();

  let response = new Response(responseId);
  response.agent = agentId;
  response.agentId = event.params.agentId;
  response.clientAddress = event.params.clientAddress;
  response.feedbackIndex = event.params.feedbackIndex;
  response.responder = event.params.responder;
  response.responseURI = event.params.responseURI;
  response.responseHash = event.params.responseHash;
  response.createdAt = event.block.timestamp;
  response.save();
}

/**
 * Update trust score for an agent
 * Simple average of non-revoked feedback values (normalized to 0-100 scale)
 */
function updateTrustScore(agent: Agent): void {
  // Load all non-revoked feedbacks
  let feedbacks = agent.feedbacks;
  if (feedbacks.length == 0) {
    agent.trustScore = BigDecimal.fromString("0");
    return;
  }

  let totalValue = BigInt.fromI32(0);
  let count = 0;
  let maxDecimals = 0;

  for (let i = 0; i < feedbacks.length; i++) {
    let feedback = Feedback.load(feedbacks[i]);
    if (feedback != null && !feedback.isRevoked) {
      totalValue = totalValue.plus(feedback.value);
      count++;
      if (feedback.valueDecimals > maxDecimals) {
        maxDecimals = feedback.valueDecimals;
      }
    }
  }

  if (count == 0) {
    agent.trustScore = BigDecimal.fromString("0");
    return;
  }

  // Calculate average (simplified - assumes values are already normalized)
  // In production, you'd want more sophisticated scoring
  let average = totalValue.toBigDecimal().div(BigDecimal.fromString(count.toString()));

  // Normalize to 0-100 scale (assuming feedback values are 0-100)
  // Adjust based on your actual value range
  agent.trustScore = average;
}
