# DAO - Role Removal Changes

## MODIFIED Requirements

### Requirement: Arbitration List Access
Users SHALL be able to view arbitrations if they have active DAO membership.

#### Scenario: DAO member views arbitrations
- **WHEN** a user with DAO membership requests arbitration list
- **THEN** the system returns the arbitrations

#### Scenario: Non-member attempts to view arbitrations
- **WHEN** a user without DAO membership requests arbitration list
- **THEN** the system rejects with "DAO membership required" error

### Requirement: Arbitration Voting
Users SHALL be able to vote on arbitrations if they have active DAO membership.

#### Scenario: DAO member votes
- **WHEN** a user with DAO membership submits a vote
- **THEN** the system records the vote

#### Scenario: Non-member attempts to vote
- **WHEN** a user without DAO membership attempts to vote
- **THEN** the system rejects with "DAO membership required" error
