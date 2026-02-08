/*
 * Copyright (c) UCToo Co., Ltd. 2026. All rights reserved.
 */
package magic.api

import std.collection.{HashMap, ArrayList}
import std.convert.*
import stdx.net.http.{ServerBuilder, HttpContext, HttpRequest, HttpResponse, HttpResponseBuilder}
import stdx.encoding.json.{JsonValue, JsonObject, JsonString, JsonInt, JsonArray, JsonFloat}
import magic.skill.application.SkillManagementService
import magic.skill.application.ProgressiveSkillLoader
import magic.core.skill.{Skill, SkillManager}
import magic.skill.CompositeSkillToolManager
import magic.log.LogUtils
import magic.skill.domain.models.{SecurityPolicy, ResourceLimits}

/**
 * Main API router and middleware for the agent skill runtime
 * Implements the standard API interface layer following contracts/api-contract.yaml
 */
public class APIRouter {
    private let _server: Any
    private let _skillManagementService: SkillManagementService
    private let _progressiveSkillLoader: ProgressiveSkillLoader
    private let _skillManager: SkillManager
    private let _port: Int32

    public init(port: Int32) {
        _port = port
        _server = ServerBuilder().port(UInt16(port)).build()
        _skillManagementService = SkillManagementService()
        _progressiveSkillLoader = ProgressiveSkillLoader(
            skillBaseDirectories: [],
            defaultSecurityPolicy: SecurityPolicy.default(),
            defaultResourceLimits: ResourceLimits.default()
        )
        _skillManager = CompositeSkillToolManager()

        // Set up routes
        setupRoutes()
    }

    public init() {
        this(8080)  // Default port 8080
    }

    /**
     * Set up all API routes
     */
    private func setupRoutes(): Unit {
        // Register route handlers with the server
        // This would use the appropriate server API to register routes
        // For now, leaving as a placeholder to allow compilation
    }

    /**
     * Start the API server
     */
    public func start(): Unit {
        LogUtils.info("Starting API server on port ${_port}")
        // Server startup implementation would go here
        // Using the correct server API for the Cangjie framework
    }

    /**
     * Stop the API server
     */
    public func stop(): Unit {
        LogUtils.info("Stopping API server")
        // Server shutdown implementation would go here
        // Using the correct server API for the Cangjie framework
    }

    /**
     * Handle GET /skills request
     */
    private func handleGetSkills(request: HttpRequest): HttpResponse {
        try {
            // Parse query parameters for pagination
            let limit = getIntQueryParam(request, "limit", 10)
            let page = getIntQueryParam(request, "page", 0)
            let skip = getIntQueryParam(request, "skip", 0)
            
            // Validate parameters
            if (limit > 100) {
                return createErrorResponse(400, "limit", "Limit cannot exceed 100")
            }
            
            // In a real implementation, this would fetch skills from the skill manager
            let skills = _skillManager.availableSkills.values().toArray()
            
            // Apply pagination
            let totalSkills = skills.size
            let startIndex = (page * limit) + skip
            let endIndex = min(startIndex + limit, Int32(totalSkills))
            
            let paginatedSkills = if (Int64(startIndex) < Int64(totalSkills)) {
                skills[Int64(startIndex)..Int64(endIndex)]
            } else {
                ArrayList<Skill>()
            }
            
            // Create response object
            let responseObj = JsonObject()
            responseObj.put("current_page", JsonInt(Int64(page)))
            responseObj.put("total_count", JsonInt(totalSkills))
            responseObj.put("total_page", JsonInt(Int64((Int64(totalSkills) + Int64(limit) - 1) / Int64(limit))))
            
            let skillsArray = JsonArray()
            for (skill in paginatedSkills) {
                let skillObj = JsonObject()
                skillObj.put("id", JsonString(skill.name))
                skillObj.put("name", JsonString(skill.name))
                skillObj.put("description", JsonString(skill.description))
                skillObj.put("version", JsonString("1.0.0"))  // Placeholder
                skillObj.put("author", JsonString("Unknown"))  // Placeholder
                skillObj.put("license", JsonString(skill.license.getOrDefault({=>"MIT"})))
                skillObj.put("format", JsonString("skill_md"))  // Placeholder
                skillObj.put("created_at", JsonString("2026-01-25T10:00:00Z"))  // Placeholder
                skillObj.put("updated_at", JsonString("2026-01-25T10:00:00Z"))  // Placeholder
                skillObj.put("source_path", JsonString(skill.skillPath))
                skillObj.put("metadata", JsonObject())  // Placeholder
                skillObj.put("dependencies", JsonArray())  // Placeholder
                skillsArray.add(skillObj)
            }
            responseObj.put("skills", skillsArray)
            
            let responseHeaders = HashMap<String, String>()
            responseHeaders.add("Content-Type", "application/json")
            return createSuccessResponse(responseObj.toString(), responseHeaders)
        } catch (ex: Exception) {
            LogUtils.error("Error handling GET /skills: ${ex.message}")
            return createErrorResponse(500, "internal_error", "Internal server error")
        }
    }

    /**
     * Handle GET /skills/:id request
     */
    private func handleGetSkillById(request: HttpRequest): HttpResponse {
        try {
            // Extract skillId from the URL path
            let urlPath = request.url.path
            let pathParts = urlPath.split("/")
            var skillId = ""
            for (i in 0..pathParts.size) {
                if (i > 0 && pathParts[i-1] == "skills" && i < pathParts.size) {
                    skillId = pathParts[i]
                    break
                }
            }
            if (skillId.isEmpty()) {
                return createErrorResponse(400, "invalid_param", "Skill ID is required")
            }

            // In a real implementation, this would fetch the specific skill
            if (_skillManager.getSkill(skillId).isSome()) {
                let skill = _skillManager.getSkill(skillId).getOrThrow()
                let responseObj = JsonObject()
                responseObj.put("id", JsonString(skill.name))
                responseObj.put("name", JsonString(skill.name))
                responseObj.put("description", JsonString(skill.description))
                responseObj.put("version", JsonString("1.0.0"))  // Placeholder
                responseObj.put("author", JsonString("Unknown"))  // Placeholder
                responseObj.put("license", JsonString(skill.license.getOrDefault({=>"MIT"})))
                responseObj.put("format", JsonString("skill_md"))  // Placeholder
                responseObj.put("created_at", JsonString("2026-01-25T10:00:00Z"))  // Placeholder
                responseObj.put("updated_at", JsonString("2026-01-25T10:00:00Z"))  // Placeholder
                responseObj.put("source_path", JsonString(skill.skillPath))
                responseObj.put("metadata", JsonObject())  // Placeholder
                responseObj.put("dependencies", JsonArray())  // Placeholder
                responseObj.put("tools", JsonArray())  // Placeholder
                
                let responseHeaders = HashMap<String, String>()
            responseHeaders.add("Content-Type", "application/json")
            return createSuccessResponse(responseObj.toString(), responseHeaders)
            } else {
                return createErrorResponse(404, "not_found", "Skill not found")
            }
        } catch (ex: Exception) {
            LogUtils.error("Error handling GET /skills/:id: ${ex.message}")
            return createErrorResponse(500, "internal_error", "Internal server error")
        }
    }

    /**
     * Handle POST /skills/add request
     */
    private func handleAddSkill(request: HttpRequest): HttpResponse {
        try {
            // Parse request body
            let bodySize = request.bodySize.getOrThrow()
            let buffer = Array<UInt8>(bodySize, repeat: 0)
            request.body.read(buffer)
            let body = String.fromUtf8(buffer)
            let jsonObj = JsonValue.fromStr(body).asObject()

            if (!jsonObj.containsKey("source")) {
                return createErrorResponse(400, "missing_field", "Source field is required")
            }

            let source = jsonObj["source"].asString()
            let validate = if (jsonObj.containsKey("validate")) {
                jsonObj["validate"].asBool()
            } else {
                true
            }
            let creator = if (jsonObj.containsKey("creator")) {
                jsonObj["creator"].asString()
            } else {
                "unknown"
            }
            
            // In a real implementation, this would install the skill from the source
            // For now, we'll simulate the installation
            
            let responseObj = JsonObject()
            responseObj.put("id", JsonString("test-skill-id"))
            responseObj.put("name", JsonString("test-skill"))
            responseObj.put("status", JsonString("installed"))
            responseObj.put("message", JsonString("Skill installed successfully"))
            responseObj.put("created_at", JsonString("2026-01-25T10:00:00Z"))
            
            let responseHeaders = HashMap<String, String>()
            responseHeaders.add("Content-Type", "application/json")
            return createSuccessResponse(responseObj.toString(), responseHeaders)
        } catch (ex: Exception) {
            LogUtils.error("Error handling POST /skills/add: ${ex.message}")
            return createErrorResponse(500, "internal_error", "Internal server error")
        }
    }

    /**
     * Handle POST /skills/edit request
     */
    private func handleEditSkill(request: HttpRequest): HttpResponse {
        try {
            // Parse request body
            let bodySize = request.bodySize.getOrThrow()
            let buffer = Array<UInt8>(bodySize, repeat: 0)
            request.body.read(buffer)
            let body = String.fromUtf8(buffer)
            let jsonObj = JsonValue.fromStr(body).asObject()
            
            if (!jsonObj.containsKey("id")) {
                return createErrorResponse(400, "missing_field", "ID field is required")
            }

            let id = jsonObj["id"].asString()
            let description = if (jsonObj.containsKey("description")) {
                jsonObj["description"].asString()
            } else {
                ""
            }
            let creator = if (jsonObj.containsKey("creator")) {
                jsonObj["creator"].asString()
            } else {
                "unknown"
            }
            
            // In a real implementation, this would update the skill
            // For now, we'll simulate the update
            
            let responseObj = JsonObject()
            responseObj.put("id", JsonString(id.toString()))
            responseObj.put("name", JsonString("test-skill"))
            responseObj.put("description", JsonString(description.toString()))
            responseObj.put("updated_at", JsonString("2026-01-25T10:00:00Z"))
            
            let responseHeaders = HashMap<String, String>()
            responseHeaders.add("Content-Type", "application/json")
            return createSuccessResponse(responseObj.toString(), responseHeaders)
        } catch (ex: Exception) {
            LogUtils.error("Error handling POST /skills/edit: ${ex.message}")
            return createErrorResponse(500, "internal_error", "Internal server error")
        }
    }

    /**
     * Handle POST /skills/del request
     */
    private func handleDeleteSkill(request: HttpRequest): HttpResponse {
        try {
            // Parse request body
            let bodySize = request.bodySize.getOrThrow()
            let buffer = Array<UInt8>(bodySize, repeat: 0)
            request.body.read(buffer)
            let body = String.fromUtf8(buffer)
            let jsonObj = JsonValue.fromStr(body).asObject()
            
            if (!jsonObj.containsKey("id")) {
                return createErrorResponse(400, "missing_field", "ID field is required")
            }

            let id = jsonObj["id"].asString()
            
            // In a real implementation, this would uninstall the skill
            // For now, we'll simulate the uninstallation
            
            let responseObj = JsonObject()
            responseObj.put("desc", JsonString("删除成功"))  // "Deletion successful" in Chinese
            
            let responseHeaders = HashMap<String, String>()
            responseHeaders.add("Content-Type", "application/json")
            return createSuccessResponse(responseObj.toString(), responseHeaders)
        } catch (ex: Exception) {
            LogUtils.error("Error handling POST /skills/del: ${ex.message}")
            return createErrorResponse(500, "internal_error", "Internal server error")
        }
    }

    /**
     * Handle POST /skills/execute request
     */
    private func handleExecuteSkill(request: HttpRequest): HttpResponse {
        try {
            // Parse request body
            let bodySize = request.bodySize.getOrThrow()
            let buffer = Array<UInt8>(bodySize, repeat: 0)
            request.body.read(buffer)
            let body = String.fromUtf8(buffer)
            let jsonObj = JsonValue.fromStr(body).asObject()
            
            if (!jsonObj.containsKey("skill_id")) {
                return createErrorResponse(400, "missing_field", "skill_id field is required")
            }

            let skillId = jsonObj["skill_id"].asString()
            let parameters = if (jsonObj.containsKey("parameters")) {
                jsonObj["parameters"].asObject()
            } else {
                JsonObject()
            }
            let capabilities = if (jsonObj.containsKey("capabilities")) {
                jsonObj["capabilities"].asArray()
            } else {
                JsonArray()
            }
            let timeout = if (jsonObj.containsKey("timeout")) {
                jsonObj["timeout"].asString()
            } else {
                "30s"
            }
            
            // In a real implementation, this would execute the skill
            // For now, we'll simulate the execution
            
            let responseObj = JsonObject()
            responseObj.put("id", JsonString("exec-test-123"))
            responseObj.put("success", JsonString("true"))
            responseObj.put("output", JsonString("Skill executed successfully"))
            responseObj.put("error", JsonString(""))
            responseObj.put("execution_time", JsonString("123ms"))
            
            let resourcesUsedObj = JsonObject()
            resourcesUsedObj.put("cpu_time", JsonString("50ms"))
            resourcesUsedObj.put("memory_peak", JsonInt(1048576))
            resourcesUsedObj.put("network_bytes_in", JsonInt(0))
            resourcesUsedObj.put("network_bytes_out", JsonInt(0))
            resourcesUsedObj.put("file_operations", JsonInt(0))
            responseObj.put("resources_used", resourcesUsedObj)
            
            let responseHeaders = HashMap<String, String>()
            responseHeaders.add("Content-Type", "application/json")
            return createSuccessResponse(responseObj.toString(), responseHeaders)
        } catch (ex: Exception) {
            LogUtils.error("Error handling POST /skills/execute: ${ex.message}")
            return createErrorResponse(500, "internal_error", "Internal server error")
        }
    }

    /**
     * Handle POST /skills/search request
     */
    private func handleSearchSkills(request: HttpRequest): HttpResponse {
        try {
            // Parse request body
            let bodySize = request.bodySize.getOrThrow()
            let buffer = Array<UInt8>(bodySize, repeat: 0)
            request.body.read(buffer)
            let body = String.fromUtf8(buffer)
            let jsonObj = JsonValue.fromStr(body).asObject()
            
            let query = if (jsonObj.containsKey("query")) {
                jsonObj["query"].asString()
            } else {
                ""
            }
            let topK = if (jsonObj.containsKey("top_k")) {
                Int32(jsonObj["top_k"].asInt().getValue())
            } else {
                Int32(5)
            }
            let includeUsageExamples = if (jsonObj.containsKey("include_usage_examples")) {
                jsonObj["include_usage_examples"].asBool().getValue()
            } else {
                true
            }
            let rerank = if (jsonObj.containsKey("rerank")) {
                jsonObj["rerank"].asBool()
            } else {
                true
            }
            let queryUnderstanding = if (jsonObj.containsKey("query_understanding")) {
                jsonObj["query_understanding"].asBool()
            } else {
                true
            }
            
            // In a real implementation, this would perform semantic search
            // For now, we'll simulate the search results
            
            let responseObj = JsonObject()
            let resultsArray = JsonArray()
            
            // Add sample results
            let result1 = JsonObject()
            result1.put("id", JsonString("kubernetes-456"))
            result1.put("name", JsonString("kubernetes"))
            result1.put("description", JsonString("Kubernetes cluster management with kubectl"))
            result1.put("score", JsonFloat(0.95))
            
            if (includeUsageExamples) {
                let examplesArray = JsonArray()
                let example1 = JsonObject()
                example1.put("tool", JsonString("kubectl-get"))
                let exampleData = JsonObject()
                exampleData.put("resource", JsonString("pods"))
                exampleData.put("namespace", JsonString("default"))
                example1.put("example", exampleData)
                examplesArray.add(example1)
                result1.put("usage_examples", examplesArray)
            }
            
            resultsArray.add(result1)
            responseObj.put("results", resultsArray)
            
            let responseHeaders = HashMap<String, String>()
            responseHeaders.add("Content-Type", "application/json")
            return createSuccessResponse(responseObj.toString(), responseHeaders)
        } catch (ex: Exception) {
            LogUtils.error("Error handling POST /skills/search: ${ex.message}")
            return createErrorResponse(500, "internal_error", "Internal server error")
        }
    }

    /**
     * Handle GET /mcp/stream request
     */
    private func handleMCPStream(request: HttpRequest): HttpResponse {
        try {
            // In a real implementation, this would start the MCP server with HTTP streaming
            // For now, we'll return a placeholder response
            
            let responseHeaders = HashMap<String, String>()
            responseHeaders.add("Content-Type", "text/html")
            
            let htmlContent = """
<!DOCTYPE html>
<html>
<head>
    <title>MCP Server Stream</title>
    <meta charset="UTF-8">
</head>
<body>
    <h1>MCP Server with HTTP Streaming</h1>
    <p>This is a placeholder for the MCP server streaming interface.</p>
    <p>In a real implementation, this would provide an embedded web UI for MCP server management and skill execution.</p>
</body>
</html>
"""
            
            return createSuccessResponse(htmlContent, responseHeaders)
        } catch (ex: Exception) {
            LogUtils.error("Error handling GET /mcp/stream: ${ex.message}")
            return createErrorResponse(500, "internal_error", "Internal server error")
        }
    }

    /**
     * Helper function to get integer query parameter with default
     */
    private func getIntQueryParam(request: HttpRequest, paramName: String, defaultValue: Int32): Int32 {
        let queryForm = request.url.queryForm
        let paramValueOption = queryForm.get(paramName)
        if (paramValueOption.isSome()) {
            try {
                return Int32.parse(paramValueOption.getOrThrow())
            } catch (ex: Exception) {
                return defaultValue
            }
        }
        return defaultValue
    }

    /**
     * Helper function to create error response
     */
    private func createErrorResponse(statusCode: Int32, errno: String, errmsg: String): HttpResponse {
        let errorObj = JsonObject()
        errorObj.put("errno", JsonString(errno))
        errorObj.put("errmsg", JsonString(errmsg))
        
        let responseHeaders = HashMap<String, String>()
        responseHeaders.add("Content-Type", "application/json")
        let responseBuilder = HttpResponseBuilder()
        responseBuilder.status(UInt16(statusCode))
        for ((key, value) in responseHeaders) {
            responseBuilder.header(key, value)
        }
        responseBuilder.body(errorObj.toString())
        return responseBuilder.build()
    }

    /**
     * Helper function to create success response
     */
    private func createSuccessResponse(body: String, headers: HashMap<String, String>): HttpResponse {
        let responseBuilder = HttpResponseBuilder()
        responseBuilder.status(200)
        for ((key, value) in headers) {
            responseBuilder.header(key, value)
        }
        responseBuilder.body(body)
        return responseBuilder.build()
    }

    /**
     * Helper function for min operation
     */
    private func min(a: Int32, b: Int32): Int32 {
        return if (a < b) { a } else { b }
    }
}