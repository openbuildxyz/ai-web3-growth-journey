---
name: uctoo-api-skill
description: Converts natural language requests to uctoo-backend API calls
license: MIT
compatibility: 
  os: 
    - Windows
    - Linux
    - macOS
  cangjie_version: ">=1.0.0"
metadata:
  author: UCToo Team
  version: "1.0.0"
  domain: backend-api-integration
  category: api-connector
allowedTools: []
---

# Uctoo API Skill

This skill converts natural language requests to API calls for the uctoo-backend server. It handles authentication, parameter extraction, and response formatting.

## Functionality

The Uctoo API Skill enables natural language interaction with the uctoo-backend server by:

- Converting natural language queries to appropriate API endpoints
- Extracting parameters from natural language requests
- Managing authentication tokens for API calls
- Formatting API responses for consumption by AI assistants

## Usage Examples

- "Get all users" → Fetches all user records from the backend
- "Find user with ID 123" → Retrieves a specific user by ID
- "Create a new user named John Doe with email john@example.com" → Creates a new user
- "Update user 456 with phone number 555-1234" → Updates user information
- "Delete user with ID 789" → Removes a user from the system
- "Login with account demo and password 123456" → Authenticates the user

## Capabilities

- Natural language intent recognition (GET, CREATE, UPDATE, DELETE operations)
- Parameter extraction from natural language
- Authentication and session management
- Error handling and response formatting
- Support for various entity types (users, products, orders, etc.)

## Integration

This skill integrates with the uctoo-backend server API and can be used by AI assistants that support the agentskills standard. It follows the standard skill interface and can be loaded dynamically from this SKILL.md file.