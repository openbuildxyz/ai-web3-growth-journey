/*
 * Copyright (c) 2024-2025. UCToo Team. All rights reserved.
 *
 * Main entry point for MCP Server adapter for uctoo-backend APIs
 */

package magic.examples.uctoo_api_mcp_server

import magic.dsl.*
import magic.prelude.*
import magic.mcp.StdioMCPServer
import magic.config.Config
import magic.examples.uctoo_api_mcp_server.src.UctooMCPAdapterAgent
import magic.skill.application.ProgressiveSkillLoader
import magic.skill.CompositeSkillToolManager
import magic.examples.uctoo_api_skill.src.UctooAPISkillFactory
import magic.tool.AgentAsTool
import std.collection.ArrayList

// Main entry point
main(): Unit {
    // Set up logging configuration to save logs to the logs directory
    Config.logLevel = "TRACE"  // Enable all levels of logging
    Config.logFile = "./logs/uctoo-mcp-server.log"

    // Set the base URL for API requests
    Config.BASE_URL = Some("http://localhost:3000")  // Default to localhost, adjust as needed
/**/
    // Use multiple skill directories - supporting both absolute and relative paths
    let skillDirectories = [
        "./skills",                    // Relative path to local skills directory
        "D:/UCT/projects/miniapp/uctoo/Delivery/uctoo-admin/apps/CangjieMagic/src/examples",  // Absolute path to examples
        "./custom-skills"              // Another relative path for custom skills
    ]

    // Create a ProgressiveSkillLoader to load skills from multiple directories
    let skillLoader = ProgressiveSkillLoader(skillBaseDirectories: skillDirectories)

    // Register skill factories before loading skills
    // This avoids circular dependencies between magic.skill.application and magic.examples
    let skillRegistry = skillLoader.getSkillRegistry()
    skillRegistry.registerFactory("uctoo-api-skill", UctooAPISkillFactory())
    // Removed println to prevent interference with MCP protocol

    // Create a skill manager
    let skillManager = CompositeSkillToolManager()

    // Removed println to prevent interference with MCP protocol

    // Load skills using the progressive loader
    let skills = skillLoader.loadSkillsToManager(skillManager)
    // Removed println to prevent interference with MCP protocol

    // Create an instance of the MCP adapter agent
    let agent = UctooMCPAdapterAgent()

    // Combine agent's tools with skill manager's tools
    // This ensures both the original MCP tools and loaded skills are available
    let allTools = ArrayList<Tool>()
    
    // Add agent's tools
    allTools.add(all: agent.toolManager.tools)
    
    // Add the agent itself as a tool
    allTools.add(AgentAsTool(agent))
    
    // Add skills from skill manager
    allTools.add(all: skillManager.tools)

    // Removed println to prevent interference with MCP protocol

    // Start MCP server with combined tools
    StdioMCPServer.startWith(allTools.toArray())
}