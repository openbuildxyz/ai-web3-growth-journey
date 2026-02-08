/*
 * Copyright (c) 2025. All rights reserved.
 */
package magic.examples.uctoo_api_skill.src

import magic.skill.BaseSkill
import magic.skill.domain.models.SkillManifest
import std.collection.HashMap
import stdx.encoding.json.JsonValue
import magic.examples.uctoo_api_skill.src.models.ApiRequest
import std.core.StringBuilder
import std.collection.ArrayList
import std.io.StringReader
import stdx.net.http.*
import stdx.net.tls.*
import std.time.*


/**
 * Uctoo API Skill implementation following the agentskills standard
 * This skill processes natural language requests and converts them to API calls
 * Designed to work consistently with the original MCP server implementation
 */
public class UctooAPISkill <: BaseSkill {
    private var nlpProcessor: NaturalLanguageProcessor;
    private var apiMapper: ApiMapper;
    private var authManager: AuthManager;

    /**
     * Constructor that accepts a SkillManifest for progressive loading
     * This allows the skill to be loaded from SKILL.md files
     */
    public init(manifest: SkillManifest) {
        super(
            name: manifest.name,
            description: manifest.description,
            license: manifest.license,
            compatibility: manifest.compatibility,
            metadata: manifest.metadata,
            allowedTools: manifest.allowedTools,
            instructions: manifest.instructions,
            skillPath: manifest.skillPath
        )

        // Initialize components
        this.nlpProcessor = NaturalLanguageProcessor();
        this.apiMapper = ApiMapper();
        this.authManager = AuthManager();
    }

    override public func execute(args: HashMap<String, JsonValue>): String {
        let argSizeVal = args.size;
        let argCountStr = argSizeVal.toString();

        // Validate input first
        let validationResult = ErrorHandler.validateInput(args)
        if (validationResult.isSome()) {
            let error = validationResult.getOrThrow()
            return ErrorHandler.formatErrorResponse(error)
        }

        // Record start time for execution tracking
        let startTime = (DateTime.now() - DateTime.UnixEpoch).toMilliseconds()

        try {
            // Extract the natural language request
            // Support "request", "query", and "question" parameters for compatibility
            let requestText = if (let Some(requestValue) <- args.get("request")) {
                let strValue = requestValue.toString()
                if (strValue.startsWith("\"") && strValue.endsWith("\"")) {
                    strValue[1..(strValue.size - 1)]
                } else {
                    strValue
                }
            } else if (let Some(queryValue) <- args.get("query")) {
                // Also support "query" parameter (used by processNaturalLanguageRequest tool)
                let strValue = queryValue.toString()
                if (strValue.startsWith("\"") && strValue.endsWith("\"")) {
                    strValue[1..(strValue.size - 1)]
                } else {
                    strValue
                }
            } else if (let Some(questionValue) <- args.get("question")) {
                // Also support "question" parameter (used by UctooMCPAdapterAgent tool)
                let strValue = questionValue.toString()
                if (strValue.startsWith("\"") && strValue.endsWith("\"")) {
                    strValue[1..(strValue.size - 1)]
                } else {
                    strValue
                }
            } else {
                "no request provided"
            }

            // Check if this is an authentication request (login, register, etc.)
            let lowerRequest = requestText.toAsciiLower()
            if (lowerRequest.contains("login") || lowerRequest.contains("sign in") ||
                lowerRequest.contains("register") || lowerRequest.contains("create account")) {
                let result = handleAuthRequest(requestText)
                return result
            }

            // For non-authentication requests, ensure user is authenticated
            let authLowerRequest = requestText.toAsciiLower()
            if (!(authLowerRequest.contains("login") || authLowerRequest.contains("sign in") ||
                  authLowerRequest.contains("register") || authLowerRequest.contains("create account"))) {
                // Ensure user is authenticated for other requests
                if (!authManager.isAuthenticated()) {
                    // Try to authenticate with stored credentials or API key
                    // Note: Config.API_KEY is not available due to import conflict resolution
                    // This functionality would need to be handled differently
                }
            }

            // Map the natural language request to an API endpoint
            let (endpoint, method, params) = apiMapper.mapNaturalLanguageToEndpoint(nlpProcessor, requestText)

            // Create the API request
            let apiRequest = ApiRequest(method, endpoint);

            // Add parameters to the request
            for ((key, value) in params.iterator()) {
                apiRequest.addQueryParam(key, value);
            }

            // Add authentication headers only for non-public endpoints
            let isPublicEndpoint = checkIfPublicEndpoint(apiRequest.buildUrl())
            if (!isPublicEndpoint) {
                let headers = HashMap<String, String>()
                authManager.addAuthHeaders(headers)
                for ((key, value) in headers.iterator()) {
                    apiRequest.addHeader(key, value)
                }
            }

            // Perform the API call
            let result = callAPI(apiRequest)

            // Return the raw API response to maintain compatibility with client expectations
            return result
        } catch (ex: Exception) {
            // Record end time for execution tracking
            let endTime = (DateTime.now() - DateTime.UnixEpoch).toMilliseconds()

            // Still return the error in the expected JSON format
            return ErrorHandler.handleError(ex)
        }
    }

    /**
     * Handle authentication requests (login, register, etc.)
     */
    private func handleAuthRequest(request: String): String {
        let lowerRequest = request.toAsciiLower()

        if (lowerRequest.contains("login") || lowerRequest.contains("sign in")) {
            // Extract credentials from the request
            let params = nlpProcessor.extractParameters(request)

            let username = if (let Some(user) <- params.get("username")) {
                user
            } else if (let Some(account) <- params.get("account")) {
                account
            } else {
                // Try to extract from the whole request
                extractUsernameFromRequest(request)
            }

            let password = if (let Some(pwd) <- params.get("password")) {
                pwd
            } else {
                extractPasswordFromRequest(request)
            }

            if (username != "" && password != "") {
                if (authManager.authenticate(username, password)) {
                    // Return JSON response for successful login
                    let successResponse = "{\"status\": \"success\", \"message\": \"Login successful. You are now authenticated and can access protected resources.\", \"authenticated\": true}"
                    return successResponse
                } else {
                    // Return JSON response for failed login
                    let failResponse = "{\"status\": \"error\", \"message\": \"Login failed. Please check your credentials and try again.\", \"authenticated\": false}"
                    return failResponse
                }
            } else {
                // Return JSON response for missing credentials
                let missingResponse = "{\"status\": \"error\", \"message\": \"Login failed. Username and password are required.\", \"authenticated\": false}"
                return missingResponse
            }
        } else if (lowerRequest.contains("register") || lowerRequest.contains("create account")) {
            // Registration would typically require more complex handling
            let notSupportedResponse = "{\"status\": \"error\", \"message\": \"Account registration is not supported through this interface. Please use the appropriate registration endpoint.\", \"authenticated\": false}"
            return notSupportedResponse
        }

        let errorResponse = "{\"status\": \"error\", \"message\": \"Authentication request could not be processed.\", \"authenticated\": false}"
        return errorResponse
    }

    /**
     * Extract username from a request string
     */
    private func extractUsernameFromRequest(request: String): String {
        // Look for common patterns like "with account demo" or "username demo"
        let lowerRequest = request.toAsciiLower()

        if (lowerRequest.contains("account") || lowerRequest.contains("username")) {
            let parts = request.split(" ")
            var afterKeyword = ""
            var found = false
            for (i in 0..parts.size) {
                if (!found && (parts[i].toAsciiLower() == "account" || parts[i].toAsciiLower() == "username" || parts[i].toAsciiLower() == "user")) {
                    if (i + 1 < parts.size) {
                        afterKeyword = parts[i + 1]
                        found = true
                    }
                }
            }
            if (afterKeyword != "") {
                // Take the first word after the keyword
                let cleanAfterKeyword = afterKeyword.replace(",", "").replace(".", "").replace("!", "").replace("?", "").replace(":", "").replace(";", "").trimAscii()
                return cleanAfterKeyword
            }
        }

        return ""
    }

    /**
     * Extract password from a request string
     */
    private func extractPasswordFromRequest(request: String): String {
        // Look for common patterns like "password 123456"
        let lowerRequest = request.toAsciiLower()

        if (lowerRequest.contains("password")) {
            let parts = request.split("password")
            if (parts.size > 1) {
                let afterKeyword = parts[1].trimAscii()
                // Take the first word after the keyword
                let words = afterKeyword.split(" ")
                if (words.size > 0) {
                    return words[0].trimAscii()
                }
            }
        }

        return ""
    }

    /**
     * Check if the endpoint is public and doesn't require authentication
     */
    private func checkIfPublicEndpoint(url: String): Bool {
        // List of public endpoints that don't require authentication
        let publicEndpoints = [
            "/hello",
            "/health",
            "/status",
            "/api/status",
            "/api/health",
            "/api/hello"
        ]

        for (endpoint in publicEndpoints) {
            if (url.contains(endpoint)) {
                return true
            }
        }

        return false
    }

    /**
     * Call the backend API
     * Compliant with uctooAPI design specification - only GET and POST methods are used
     */
    private func callAPI(apiRequest: ApiRequest): String {
        // Ensure the URL is absolute by prepending the base URL if needed
        var fullUrl = apiRequest.buildUrl()

        // If the URL is relative (doesn't start with http:// or https://), prepend the base URL
        if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
            let baseUrl = if (Config.BASE_URL.isSome()) {
                Config.BASE_URL.getOrThrow()
            } else {
                "http://localhost:3000"  // Default to localhost for relative URLs
            }

            // Ensure proper URL formation
            if (baseUrl.endsWith("/") && fullUrl.startsWith("/")) {
                fullUrl = baseUrl + fullUrl[1..fullUrl.size]
            } else if (!baseUrl.endsWith("/") && !fullUrl.startsWith("/")) {
                fullUrl = baseUrl + "/" + fullUrl
            } else {
                fullUrl = baseUrl + fullUrl
            }
        }

        try {
            // Build the HTTP client
            let clientBuilder = ClientBuilder()
            clientBuilder.readTimeout(Duration.minute * 1)  // 1 minute read timeout

            // Configure TLS for HTTPS URLs
            if (fullUrl.startsWith("https://")) {
                var tlsConfig = TlsClientConfig()
                tlsConfig.verifyMode = TrustAll  // For testing purposes
                // Extract host from URL by splitting on slashes
                let urlParts = fullUrl.split("://")
                if (urlParts.size > 1) {
                    let remainingPart = urlParts[1]
                    let hostPart = remainingPart.split("/")[0]  // Get everything before the first slash
                    let hostName = hostPart.split(":")[0]  // Remove port if present
                    tlsConfig.domain = hostName
                } else {
                    tlsConfig.domain = "localhost"
                }
                clientBuilder.tlsConfig(tlsConfig)
            }

            let client = clientBuilder.build()

            // Build the request
            let requestBuilder = HttpRequestBuilder()
                .url(fullUrl)

            // Add headers
            for ((key, value) in apiRequest.headers.iterator()) {
                requestBuilder.header(key, value)
            }

            // Handle different HTTP methods
            let request = if (apiRequest.method == "GET") {
                // For GET requests, add query parameters to URL
                let queryString = buildQueryString(apiRequest.queryParams)
                let urlWithParams = if (queryString != "") {
                    if (fullUrl.contains("?")) {
                        fullUrl + "&" + queryString
                    } else {
                        fullUrl + "?" + queryString
                    }
                } else {
                    fullUrl
                }

                HttpRequestBuilder()
                    .url(urlWithParams)
                    .header("Content-Type", "application/json")
                    .get()
                    .build()
            } else if (apiRequest.method == "POST") {
                // For POST requests, add body and query parameters
                let bodyStr = if (apiRequest.body.isSome()) {
                    apiRequest.body.getOrThrow()
                } else {
                    "{}"
                }

                // Add query parameters to URL
                let queryString = buildQueryString(apiRequest.queryParams)
                let urlWithParams = if (queryString != "") {
                    if (fullUrl.contains("?")) {
                        fullUrl + "&" + queryString
                    } else {
                        fullUrl + "?" + queryString
                    }
                } else {
                    fullUrl
                }

                HttpRequestBuilder()
                    .url(urlWithParams)
                    .header("Content-Type", "application/json")
                    .post()
                    .body(bodyStr)
                    .build()
            } else {
                // Default to GET
                HttpRequestBuilder()
                    .url(fullUrl)
                    .header("Content-Type", "application/json")
                    .get()
                    .build()
            }

            // Send the request
            let httpResponse = client.send(request)

            // Read the response body from the actual HTTP response
            let responseBody = try {
                let reader = StringReader(httpResponse.body)
                reader.readToEnd()
            } catch (readEx: Exception) {
                ""
            }

            // Close the client
            client.close()

            // Validate that the response is valid JSON
            if (responseBody != "") {
                try {
                    let _ = JsonValue.fromStr(responseBody)
                    // If we get here, the response is valid JSON
                    return responseBody
                } catch (jsonEx: Exception) {
                    // If the response is not valid JSON, return an error
                    return "{\"error\":\"API returned invalid JSON\",\"message\":\"The API response is not in valid JSON format\"}"
                }
            } else {
                // If the response body is empty, return an error
                return "{\"error\":\"API returned empty response\",\"message\":\"The API response is empty\"}"
            }
        } catch (ex: Exception) {
            // Return error in JSON format to maintain consistency
            return "{\"error\":\"API call failed\",\"message\":\"" + ex.message + "\"}"
        }
    }

    /**
     * Helper function to build query string from parameters
     */
    private func buildQueryString(params: HashMap<String, String>): String {
        let pairs = ArrayList<String>()
        for ((key, value) in params.iterator()) {
            pairs.add(encodeURIComponent(key) + "=" + encodeURIComponent(value))
        }
        return String.join(pairs.toArray(), delimiter: "&")
    }

    /**
     * Helper function to encode URI component
     */
    private func encodeURIComponent(str: String): String {
        // Simplified implementation - in real code, this would properly encode URI components
        return str.replace(" ", "%20").replace("#", "%23").replace("&", "%26").replace("+", "%2B")
                  .replace("<", "%3C").replace(">", "%3E").replace("\"", "%22").replace("'", "%27")
                  .replace("/", "%2F").replace("?", "%3F").replace("=", "%3D").replace("@", "%40")
    }

}