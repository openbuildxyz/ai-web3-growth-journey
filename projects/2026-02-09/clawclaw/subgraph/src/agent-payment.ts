import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { AgentTipped } from "../generated/AgentPayment/AgentPayment";
import { PaymentEvent } from "../generated/schema";

/**
 * Handle agent tipped event
 */
export function handleAgentTipped(event: AgentTipped): void {
  let paymentEvent = new PaymentEvent(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );

  paymentEvent.agentId = event.params.agentId;
  paymentEvent.from = event.params.from;
  paymentEvent.to = event.params.to;
  paymentEvent.amount = event.params.amount;
  paymentEvent.isCrossChain = event.params.isCrossChain;
  paymentEvent.destinationDomain = event.params.destinationDomain
    ? BigInt.fromI32(event.params.destinationDomain as i32)
    : null;
  paymentEvent.blockNumber = event.block.number;
  paymentEvent.blockTimestamp = event.block.timestamp;
  paymentEvent.transactionHash = event.transaction.hash;

  paymentEvent.save();
}
