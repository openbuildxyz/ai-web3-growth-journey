import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  Registered,
  URIUpdated,
  MetadataSet,
  AgentWalletSet,
} from "../generated/IdentityRegistry/IdentityRegistry";
import { Agent, RegistrationEvent, URIUpdateEvent } from "../generated/schema";

/**
 * Handle agent registration event
 */
export function handleRegistered(event: Registered): void {
  let agentId = event.params.agentId.toString();
  let agent = Agent.load(agentId);

  if (agent == null) {
    agent = new Agent(agentId);
    agent.agentId = event.params.agentId;
    agent.owner = event.params.owner;
    agent.agentURI = event.params.agentURI;
    agent.createdAt = event.block.timestamp;
    agent.feedbackCount = BigInt.fromI32(0);
  }

  agent.updatedAt = event.block.timestamp;
  agent.save();

  // Create registration event
  let registrationEvent = new RegistrationEvent(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  registrationEvent.agent = agentId;
  registrationEvent.agentId = event.params.agentId;
  registrationEvent.agentURI = event.params.agentURI;
  registrationEvent.owner = event.params.owner;
  registrationEvent.blockNumber = event.block.number;
  registrationEvent.blockTimestamp = event.block.timestamp;
  registrationEvent.transactionHash = event.transaction.hash;
  registrationEvent.save();
}

/**
 * Handle agent URI update event
 */
export function handleURIUpdated(event: URIUpdated): void {
  let agentId = event.params.agentId.toString();
  let agent = Agent.load(agentId);

  if (agent != null) {
    agent.agentURI = event.params.newURI;
    agent.updatedAt = event.block.timestamp;
    agent.save();

    // Create URI update event
    let uriUpdateEvent = new URIUpdateEvent(
      event.transaction.hash.toHex() + "-" + event.logIndex.toString()
    );
    uriUpdateEvent.agent = agentId;
    uriUpdateEvent.agentId = event.params.agentId;
    uriUpdateEvent.newURI = event.params.newURI;
    uriUpdateEvent.updatedBy = event.params.updatedBy;
    uriUpdateEvent.blockNumber = event.block.number;
    uriUpdateEvent.blockTimestamp = event.block.timestamp;
    uriUpdateEvent.transactionHash = event.transaction.hash;
    uriUpdateEvent.save();
  }
}

/**
 * Handle metadata set event (including agentWallet)
 */
export function handleMetadataSet(event: MetadataSet): void {
  let agentId = event.params.agentId.toString();
  let agent = Agent.load(agentId);

  if (agent != null) {
    // Check if this is the agentWallet metadata
    if (event.params.metadataKey == "agentWallet") {
      agent.agentWallet = Bytes.fromHexString(
        event.params.metadataValue.toHexString().slice(0, 42)
      );
    }
    agent.updatedAt = event.block.timestamp;
    agent.save();
  }
}

/**
 * Handle agent wallet set event
 */
export function handleAgentWalletSet(event: AgentWalletSet): void {
  let agentId = event.params.agentId.toString();
  let agent = Agent.load(agentId);

  if (agent != null) {
    agent.agentWallet = event.params.newWallet;
    agent.updatedAt = event.block.timestamp;
    agent.save();
  }
}
