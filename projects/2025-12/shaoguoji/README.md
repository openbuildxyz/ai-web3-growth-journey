# Project intro

AAcount: A Decentralized and Transparent On-Chain Collective Ledger for Payment and Distribution Services.

## Introduction

AAcount is a decentralized application (DApp) based on Ethereum that provides a transparent service for collective ledger payments and distributions. It solves the pain points of traditional collective ledgers, such as centralized account authority and opaque transaction records. It can be applied to scenarios like event registration fee collection and expense sharing.

## Concepts

Core concepts include **Pool**, **Rule**, **Organizer**, **Participant**, and **Creator**.

### Pool

The Pool is the core concept of AAcount. It is a decentralized collective ledger used to store and manage collective assets. Assets in the pool can be any ERC20 token or ETH.

### Creator

The Creator is the person who creates the pool. They have full control over the pool, including adding members and modifying pool configurations. The Creator can establish different types of transaction rules for a pool, such as Inflow Rules (Receiving Funds) and Outflow Rules (Fund Settlement/Distribution, Reimbursement).

### Organizer

An Organizer helps manage the pool. They can transfer assets into the pool, add new pending reimbursement items, and receive distributions or reimbursements from the pool.

### Participant

A Participant is a member of the pool. They can transfer assets into the pool and receive refunds. Participants can also perform "check-in" operations within the pool (e.g., event sign-ins, requiring the participant's private key signature).

### Rules

Rules define the operations for the addition, subtraction, and distribution of pool funds. Transaction rules are divided into Inflow Rules and Outflow Rules.

#### Inflow Rules

Inflow Rules define how the pool balance increases. Examples include:
1.  **Collection**: e.g., registration fees, event fees.
2.  **Deposit**: e.g., event sponsorship, donations.

#### Outflow Rules

Outflow Rules define how the pool funds are distributed. Examples include:
1.  **Fund Settlement/Distribution**: e.g., event expenses, reimbursements.
2.  **Fund Refund**: e.g., event cancellation refunds.

## Use Case Examples

### Scenario 1: Event Fees, Reimbursement, and Profit Distribution

Three organizations, A, B, and C, jointly organize a tech salon. They select a Creator to set up a pool in AAcount, configuring registration payment rules, deposit rules, and profit distribution rules. The Creator adds A, B, and C as Organizers. If there are sponsorships or financial support, the three Organizers can use the deposit rules to transfer assets into the pool.

Before the event:
*   A is responsible for the venue cost (200 USDT).
*   B is responsible for event planning cost (100 USDT).
*   C is responsible for event execution cost (500 USDT).

They each register a pending reimbursement item in the pool to record their respective expenditures, ensuring they receive corresponding reimbursement income during settlement.

During the promotion period, an Organizer creates a rule named "Collect Registration Fee" (Inflow Rule) to provide a payment page for participants when publishing the event. Suppose the registration fee is 30 USDT, and 60 people register, totaling 1800 USDT.

When the event ends and settlement begins, the venue, planning, and execution costs are first deducted from the pool and refunded to the reimburser. The remaining 1000 USDT is then distributed equally among the three Organizers.

### Scenario 2: 100-Day Reading Challenge Cashback

Suppose Organizer A wants to encourage more people to persist in reading books and initiates a "100-Day Reading Challenge". They create a pool in AAcount and set up registration payment rules and refund rules. Participants need to pay a deposit into the pool in advance and perform a check-in operation every day for 100 days after the event starts.

After the event ends, refunds are made based on the number of days the participant checked in (or the deposits of those who did not complete the challenge are confiscated and redistributed).

More application scenarios, such as product crowdfunding, are yet to be explored.

# Team info

Solo team: shaoguoji (Jim/国际哥) —— a new bee in ETHChiangMai Bootcamp.

# Tech details

The technical architecture uses Ethereum EVM smart contracts to ensure the transparency and security of the capital pool, while ensuring that transaction rules are executed by code. All data is stored on-chain, achieving complete decentralization.

## Tech stack

Adopting a Frontend + Contract architecture.

1.  **Ethereum EVM Smart Contracts**: Written in Solidity, managed using the Foundry framework.
2.  **Frontend**: Uses React + Vite framework, leveraging libraries like viem, wagmi, and RainbowKit.

## Module Division and Page Design

*   **Home Page**: AAcount landing page, displaying AAcount's functions and usage methods, including creating pools, adding members, and adding transaction rules, serving as a product introduction.
*   **Pools**: Displays all current on-chain pools. Users can click to enter the Pool Details page, which shows additional information: Creator, Organizers, Participants, active transaction rules (Payment, Refund, Reimbursement, etc.), pool balance, and historical transaction records. All information is retrieved via smart contracts. Data is stored in on-chain storage or receipts. If a pool requires user check-in, a check-in page should be provided.
*   **User Dashboard**: Requires connecting a user wallet (MetaMask). Displays pools created by the current user, pools joined, transaction records, etc. For Creators, it should provide pool management functions such as adding members, modifying transaction rules, and executing rules. For Organizers, it should provide the ability to add pending reimbursement items.
*   **Rule Page**: All rules have their own details page. For payment-type rules, an interface is provided for users to perform payment operations (e.g., payment info, amount). After payment, the smart contract checks for success and stores the transaction record on-chain, publicly displaying the payer list and payment transaction record list. Allocation happens subsequently. If an Organizer initiates a reimbursement, a reimbursement rule is automatically generated, recording the reimburser's address and amount.
*   **Transaction Records**: Display related transaction records on the details pages of pools and rules.


# Github link

https://github.com/shaoguoji/AAcount
