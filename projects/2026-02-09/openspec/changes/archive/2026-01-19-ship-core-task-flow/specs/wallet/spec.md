## ADDED Requirements

### Requirement: Role-Aware Wallet Authentication
The system SHALL provide a secure authentication flow that associates a wallet signature with a specific user role (Buyer or Seller) to issue a JSON Web Token (JWT).

#### Scenario: Successful login with role selection
- **GIVEN** a user has connected their wallet
- **WHEN** the user selects the "Seller" role and clicks "Sign & Login"
- **THEN** the system SHALL request a signature for a unique challenge message
- **AND** upon successful signature, the system SHALL submit the signature and role to the backend
- **AND** the backend SHALL return a JWT containing the user's address and chosen role
- **AND** the frontend SHALL store this JWT for subsequent authenticated requests
