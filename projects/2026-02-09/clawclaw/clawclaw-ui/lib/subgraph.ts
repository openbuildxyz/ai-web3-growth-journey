import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client/core";
import { gql } from "@apollo/client/core";

const SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_SUBGRAPH_URL ||
  "https://api.studio.thegraph.com/query/YOUR_ID/agentbridge/version/latest";

/**
 * Apollo Client for querying AgentBridge subgraph
 * Update endpoint after subgraph deployment
 */
export const subgraphClient = new ApolloClient({
  link: new HttpLink({ uri: SUBGRAPH_URL }),
  cache: new InMemoryCache(),
});

/** Query: Get all agents with trust scores */
export const GET_AGENTS = gql`
  query GetAgents($first: Int!, $skip: Int!, $orderBy: String) {
    agents(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: desc) {
      id
      agentId
      owner
      agentURI
      agentWallet
      trustScore
      feedbackCount
      createdAt
      updatedAt
    }
  }
`;

/** Query: Get a single agent by ID */
export const GET_AGENT = gql`
  query GetAgent($id: ID!) {
    agent(id: $id) {
      id
      agentId
      owner
      agentURI
      agentWallet
      trustScore
      feedbackCount
      createdAt
      updatedAt
      feedbacks(first: 50, orderBy: createdAt, orderDirection: desc) {
        id
        clientAddress
        feedbackIndex
        value
        valueDecimals
        tag1
        tag2
        isRevoked
        createdAt
      }
    }
  }
`;

/** Query: Search agents by owner address */
export const SEARCH_AGENTS = gql`
  query SearchAgents($owner: Bytes!) {
    agents(where: { owner: $owner }) {
      id
      agentId
      owner
      agentURI
      agentWallet
      trustScore
      feedbackCount
      createdAt
    }
  }
`;

/** Query: Get payment events for an agent */
export const GET_PAYMENTS = gql`
  query GetPayments($agentId: BigInt!) {
    paymentEvents(where: { agentId: $agentId }, orderBy: blockTimestamp, orderDirection: desc) {
      id
      agentId
      from
      to
      amount
      isCrossChain
      destinationDomain
      blockTimestamp
      transactionHash
    }
  }
`;

/** Interface for Agent data from subgraph */
export interface SubgraphAgent {
  id: string;
  agentId: string;
  owner: string;
  agentURI: string | null;
  agentWallet: string | null;
  trustScore: string | null;
  feedbackCount: string;
  createdAt: string;
  updatedAt: string;
}

/** Interface for Feedback data from subgraph */
export interface SubgraphFeedback {
  id: string;
  clientAddress: string;
  feedbackIndex: string;
  value: string;
  valueDecimals: number;
  tag1: string | null;
  tag2: string | null;
  isRevoked: boolean;
  createdAt: string;
}
