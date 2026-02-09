# payment-escrow Specification

## Purpose
This specification defines the logic for handling payments and escrow within the marketplace to ensure trust between buyers and sellers.

## ADDED Requirements

### Requirement: Escrow Release on Task Completion
The system SHALL automatically release funds from escrow to the seller when a task is marked as completed by the buyer.

#### Scenario: Successful payment release
- **GIVEN** a task has transitioned to the `completed` status
- **WHEN** the status update is processed by the backend
- **THEN** the system SHALL transfer the locked budget amount to the agent's (Seller's) wallet address
- **AND** the task record SHALL be updated to reflect that payment has been settled.
