# UCToo API MCP Client

## Overview
This project is a client for testing the UCToo API MCP Server. It demonstrates how to use the Model Context Protocol (MCP) to communicate with the uctoo backend APIs through natural language queries.

## Usage

To run the client, execute the following command from the CangjieMagic directory:

```bash
cjpm run --name magic.examples.uctoo_api_mcp_client
```

The client will connect to the uctoo_api_mcp_server and perform various API operations on the entity resource:

1. Get a single entity
2. Get multiple entities
3. Add a new entity
4. Edit an entity
5. Delete an entity

## How it works

The client uses Magic Framework's @agent annotation to create an AI agent that can communicate with the MCP server. The agent is configured to use stdioMCP to connect to the uctoo_api_mcp_server.

The agent is prompted to act as a tester for uctoo backend APIs, specifically for entity operations. It can process natural language queries and convert them to appropriate API calls.