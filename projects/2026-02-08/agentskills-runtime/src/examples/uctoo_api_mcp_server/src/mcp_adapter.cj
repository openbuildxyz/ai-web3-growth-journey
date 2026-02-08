/*
 * Copyright (c) 2024-2025. UCToo Team. All rights reserved.
 *
 * MCP adapter core implementation for UCToo backend API communication
 */

package magic.examples.uctoo_api_mcp_server.src

import std.collection.{ArrayList, HashMap}
import std.time.DateTime
import magic.core.*
import stdx.net.http.*
import stdx.net.tls.*
import stdx.encoding.url.URL
import std.time.*
import std.net.{SocketAddress, TcpSocket}
import std.io.*
import std.io.StringReader

// MCP Adapter class to handle communication with uctoo-backend server
class UctooMCPAdapter {
    // Reference to the configuration
    private var adapterConfig: UctooConfig

    // Static storage for authentication tokens within the class
    private static var authTokens: HashMap<String, String> = HashMap<String, String>()

    // Store authentication token for subsequent API calls
    static func storeAuthToken(token: String): Unit {
        authTokens["access_token"] = token
        Utils.logMessage("DEBUG", "Stored access token for subsequent API calls")
    }

    // Update the adapter's config with the stored token
    func updateConfigWithStoredToken(): Unit {
        let storedTokenOpt = UctooMCPAdapter.getStoredAuthToken()
        if (storedTokenOpt.isSome()) {
            let storedToken = storedTokenOpt.getOrThrow()
            if (!storedToken.isEmpty()) {
                this.adapterConfig.authToken = storedToken
                Utils.logMessage("DEBUG", "Updated adapter config with stored authentication token")
            }
        }
    }

    // Static method to update all adapter instances with the stored token
    static func updateAllConfigs(): Unit {
        // This is a placeholder - in a real implementation, you might want to maintain a list of active adapters
        // For now, we'll just log that this method exists
        Utils.logMessage("DEBUG", "Called updateAllConfigs - this would update all adapter instances with stored token")
    }

    // Get stored authentication token
    static func getStoredAuthToken(): Option<String> {
        return authTokens.get("access_token")
    }

    // Clear stored authentication token
    static func clearAuthToken(): Unit {
        authTokens.remove("access_token")
        Utils.logMessage("DEBUG", "Cleared stored access token")
    }

    // Default constructor
    init() {
        this.adapterConfig = UctooConfig()
    }

    // Set the configuration
    public func setConfig(config: UctooConfig) {
        this.adapterConfig = config
    }

    // Method to call backend API with natural language request
    func callBackendApi(nlRequest: NaturalLanguageRequest): APIResponse {
        try {
            // Update config with stored token if available (ensures token is in config)
            this.updateConfigWithStoredToken()

            // Process the natural language request to determine API call details
            let apiCallInfo = processNaturalLanguageRequest(nlRequest)

            // Construct the full URL for the backend API
            var fullUrl = this.adapterConfig.backendUrl + apiCallInfo.endpoint

            // Prepare request options based on method and parameters
            var requestOptions = HashMap<String, Any>()
            requestOptions["method"] = apiCallInfo.method

            // Create headers map with proper Cangjie syntax
            let headersMap = HashMap<String, String>()
            headersMap["Content-Type"] = "application/json"
            headersMap["User-Agent"] = "UCToo-MCP-Adapter/1.0"
            headersMap["Accept"] = "application/json"
            requestOptions["headers"] = headersMap

            // Add authentication if available in config
            if (this.adapterConfig.authToken != "") {
                headersMap["Authorization"] = "Bearer " + this.adapterConfig.authToken
                Utils.logMessage("DEBUG", "Using authentication token from adapter config for API call")
            } else {
                // Check for globally stored authentication token (from successful login)
                let storedTokenOpt = UctooMCPAdapter.getStoredAuthToken()
                if (storedTokenOpt.isSome()) {
                    let storedToken = storedTokenOpt.getOrThrow()
                    if (!storedToken.isEmpty()) {
                        headersMap["Authorization"] = "Bearer " + storedToken
                        Utils.logMessage("DEBUG", "Using stored authentication token for API call")
                    }
                }
            }

            // Log the Authorization header to verify it's being set properly
            let authHeaderOpt = headersMap.get("Authorization")
            if (authHeaderOpt.isSome()) {
                Utils.logMessage("DEBUG", "Authorization header set: " + authHeaderOpt.getOrThrow())
            } else {
                Utils.logMessage("WARN", "Authorization header NOT set for API call")
            }

            // Add parameters based on method
            if (apiCallInfo.method == "GET" || apiCallInfo.method == "DELETE") {
                // For GET/DELETE, add parameters as query string
                let queryString = buildQueryString(apiCallInfo.parameters)
                if (queryString != "") {
                    fullUrl += "?" + queryString
                }
            } else {
                // For POST/PUT, add parameters in request body as JSON
                // Special handling for login endpoint to ensure correct JSON format
                if (apiCallInfo.endpoint.contains("auth/login")) {
                    // For login, ensure we have username and password in the correct format
                    let loginBody = HashMap<String, String>()

                    // Check if we have username and password in parameters
                    let usernameOpt = apiCallInfo.parameters.get("username")
                    let passwordOpt = apiCallInfo.parameters.get("password")

                    if (usernameOpt.isSome() && passwordOpt.isSome()) {
                        let username = convertToString(usernameOpt.getOrThrow())
                        let password = convertToString(passwordOpt.getOrThrow())

                        loginBody["username"] = username
                        loginBody["password"] = password

                        // Convert to JSON string
                        let jsonStr = buildJsonString(loginBody)
                        requestOptions["body"] = jsonStr
                        Utils.logMessage("DEBUG", "Login request body prepared: " + jsonStr)
                    } else {
                        // If username/password not found in parameters, try to use original parameters
                        let jsonBody = buildJsonBody(apiCallInfo.parameters)
                        requestOptions["body"] = jsonBody
                    }
                } else {
                    // For other endpoints, use the standard JSON body
                    let jsonBody = buildJsonBody(apiCallInfo.parameters)
                    requestOptions["body"] = jsonBody
                }
            }

            // Log the API call
            Utils.logMessage("DEBUG", "Calling backend API: " + fullUrl + " with method: " + apiCallInfo.method)
            Utils.logMessage("DEBUG", "Full URL being called: " + fullUrl)
            Utils.logMessage("DEBUG", "Method: " + apiCallInfo.method)
            Utils.logMessage("DEBUG", "Parameters: " + apiCallInfo.parameters.size.toString() + " parameters")

            // Log each parameter
            for ((key, value) in apiCallInfo.parameters) {
                Utils.logMessage("DEBUG", "Parameter: " + key + " = " + convertToString(value))
            }

            // Make the actual HTTP request to the backend
            let response = makeHttpRequest(fullUrl, requestOptions)

            // Create and return API response with actual backend data
            let apiResponse = APIResponse()
            apiResponse.id = Utils.generateId()
            apiResponse.status = response.status
            apiResponse.data = response.data
            apiResponse.timestamp = (DateTime.now() - DateTime.UnixEpoch).toMilliseconds()
            apiResponse.requestId = nlRequest.id

            return apiResponse
        } catch (ex: Exception) {
            // Handle any errors and return error response
            Utils.logMessage("ERROR", "=== callBackendApi ERROR ===")
            Utils.logMessage("ERROR", "Backend API call failed with exception: " + ex.message)
            return createErrorResponse(nlRequest.id, "API call failed: " + ex.message)
        }
    }

    // Process natural language request and determine backend API to call
    private func processNaturalLanguageRequest(nlRequest: NaturalLanguageRequest): ApiCallInfo {
        // Create an API call info structure
        let apiCallInfo = ApiCallInfo()
        apiCallInfo.endpoint = determineEndpointFromIntent(nlRequest.intent, nlRequest.queryText, nlRequest.parameters)
        apiCallInfo.method = determineMethodFromIntent(nlRequest.intent)
        apiCallInfo.parameters = nlRequest.parameters
        apiCallInfo.headers = HashMap<String, String>()
        apiCallInfo.requestId = nlRequest.id

        return apiCallInfo
    }

    // Determine the API endpoint based on intent and parameters
    private func determineEndpointFromIntent(intent: String, queryText: String, parameters: HashMap<String, Any>): String {
        // Determine the endpoint based on the determined intent
        if (intent == "GET_RESOURCE") {
                // For GET operations, determine resource type from query
                let lowerQuery = queryText.toAsciiLower()

                if (lowerQuery.contains("entity") || lowerQuery.contains("实体")) {
                    if (parameters.get("id").isSome()) {
                        let idOpt = parameters.get("id")
                        if (idOpt.isSome()) {
                            let idValue = idOpt.getOrThrow()
                            let idStr = if (idValue is String) {
                                let strOpt = idValue as String
                                if (strOpt.isSome()) { strOpt.getOrThrow() } else { "unknown" }
                            } else {
                                "non_string_id"
                            }
                            return "/api/uctoo/entity/" + idStr
                        } else {
                            return "/api/uctoo/entity/unknown"
                        }
                    } else {
                        // Use proper pagination parameters for getting multiple entities
                        let limitOpt = parameters.get("limit")
                        let limit = if (limitOpt.isSome()) {
                            let limitValue = limitOpt.getOrThrow()
                            if (limitValue is String) {
                                let strOpt = limitValue as String
                                if (strOpt.isSome()) { strOpt.getOrThrow() } else { "10" }
                            } else { "10" }
                        } else { "10" }

                        let pageOpt = parameters.get("page")
                        let page = if (pageOpt.isSome()) {
                            let pageValue = pageOpt.getOrThrow()
                            if (pageValue is String) {
                                let strOpt = pageValue as String
                                if (strOpt.isSome()) { strOpt.getOrThrow() } else { "0" }
                            } else { "0" }
                        } else { "0" }

                        // Only include skip parameter if it's explicitly provided
                        let skipOpt = parameters.get("skip")
                        if (skipOpt.isSome()) {
                            let skipValue = skipOpt.getOrThrow()
                            let skipStr = if (skipValue is String) {
                                let strOpt = skipValue as String
                                if (strOpt.isSome()) { strOpt.getOrThrow() } else { "0" }
                            } else { "0" }
                            return "/api/uctoo/entity/" + limit + "/" + page + "/" + skipStr
                        } else {
                            // Use the simpler format without skip parameter
                            return "/api/uctoo/entity/" + limit + "/" + page
                        }
                    }
                } else if (lowerQuery.contains("hello") || lowerQuery.contains("问候")) {
                    // Handle the hello endpoint specifically
                    return "/hello"
                } else {
                    // Default to a general endpoint
                    return "/api/uctoo/entity/10/0"
                }
        } else if (intent == "CREATE_RESOURCE") {
                // For CREATE operations, determine resource type from query
                let lowerQuery = queryText.toAsciiLower()

                if (lowerQuery.contains("entity") || lowerQuery.contains("实体")) {
                    return "/api/uctoo/entity/add"
                } else if (lowerQuery.contains("hello") || lowerQuery.contains("问候")) {
                    // Handle hello endpoint creation if needed
                    return "/hello"
                } else {
                    // Default to a general endpoint
                    return "/api/uctoo/entity/add"
                }
        } else if (intent == "UPDATE_RESOURCE") {
                // For UPDATE operations, determine resource type from query
                let lowerQuery = queryText.toAsciiLower()

                if (lowerQuery.contains("entity") || lowerQuery.contains("实体")) {
                    return "/api/uctoo/entity/edit"
                } else {
                    // Default to a general endpoint
                    return "/api/uctoo/entity/edit"
                }
        } else if (intent == "DELETE_RESOURCE") {
                // For DELETE operations, determine resource type from query
                let lowerQuery = queryText.toAsciiLower()

                if (lowerQuery.contains("entity") || lowerQuery.contains("实体")) {
                    return "/api/uctoo/entity/del"
                } else {
                    // Default to a general endpoint
                    return "/api/uctoo/entity/del"
                }
        } else {
                // Default to a general endpoint
                let lowerQuery = queryText.toAsciiLower()

                if (lowerQuery.contains("login") || lowerQuery.contains("登录") || lowerQuery.contains("auth")) {
                    // Handle the login endpoint specifically
                    return "/api/uctoo/auth/login"
                } else if (lowerQuery.contains("hello") || lowerQuery.contains("问候")) {
                    // Handle the hello endpoint specifically
                    return "/hello"
                } else if (lowerQuery.contains("entity") || lowerQuery.contains("实体")) {
                    if (parameters.get("id").isSome()) {
                        let idOpt = parameters.get("id")
                        if (idOpt.isSome()) {
                            let idValue = idOpt.getOrThrow()
                            let idStr = if (idValue is String) {
                                let strOpt = idValue as String
                                if (strOpt.isSome()) { strOpt.getOrThrow() } else { "unknown" }
                            } else {
                                "non_string_id"
                            }
                            return "/api/uctoo/entity/" + idStr
                        } else {
                            return "/api/uctoo/entity/unknown"
                        }
                    } else {
                        // Use proper pagination parameters for getting multiple entities
                        let limitOpt = parameters.get("limit")
                        let limit = if (limitOpt.isSome()) {
                            let limitValue = limitOpt.getOrThrow()
                            if (limitValue is String) {
                                let strOpt = limitValue as String
                                if (strOpt.isSome()) { strOpt.getOrThrow() } else { "10" }
                            } else { "10" }
                        } else { "10" }

                        let pageOpt = parameters.get("page")
                        let page = if (pageOpt.isSome()) {
                            let pageValue = pageOpt.getOrThrow()
                            if (pageValue is String) {
                                let strOpt = pageValue as String
                                if (strOpt.isSome()) { strOpt.getOrThrow() } else { "0" }
                            } else { "0" }
                        } else { "0" }

                        // Only include skip parameter if it's explicitly provided
                        let skipOpt = parameters.get("skip")
                        if (skipOpt.isSome()) {
                            let skipValue = skipOpt.getOrThrow()
                            let skipStr = if (skipValue is String) {
                                let strOpt = skipValue as String
                                if (strOpt.isSome()) { strOpt.getOrThrow() } else { "0" }
                            } else { "0" }
                            return "/api/uctoo/entity/" + limit + "/" + page + "/" + skipStr
                        } else {
                            // Use the simpler format without skip parameter
                            return "/api/uctoo/entity/" + limit + "/" + page
                        }
                    }
                } else {
                    return "/api/uctoo/entity/10/0"
                }
        }
    }

    // Determine the HTTP method based on the intent
    private func determineMethodFromIntent(intent: String): String {
        if (intent == "GET_RESOURCE") {
            return "GET"
        } else if (intent == "CREATE_RESOURCE") {
            return "POST"
        } else if (intent == "UPDATE_RESOURCE") {
            return "POST"  // According to API spec, edit uses POST method
        } else if (intent == "DELETE_RESOURCE") {
            return "POST"  // According to API spec, del uses POST method
        } else {
            return "GET"  // Default to GET
        }
    }

    // Helper function to convert Any type to String
    private func convertToString(value: Any): String {
        if (value is String) {
            let castResult = value as String
            return match (castResult) {
                case Some(str) => str
                case _ => "converted_value"
            }
        } else if (value is Int32) {
            let castResult = value as Int32
            return match (castResult) {
                case Some(num) => num.toString()
                case _ => "0"
            }
        } else if (value is Int64) {
            let castResult = value as Int64
            return match (castResult) {
                case Some(num) => num.toString()
                case _ => "0"
            }
        } else if (value is Float32) {
            let castResult = value as Float32
            return match (castResult) {
                case Some(num) => num.toString()
                case _ => "0.0"
            }
        } else if (value is Float64) {
            let castResult = value as Float64
            return match (castResult) {
                case Some(num) => num.toString()
                case _ => "0.0"
            }
        } else if (value is Bool) {
            let castResult = value as Bool
            return match (castResult) {
                case Some(boolVal) => boolVal.toString()
                case _ => "false"
            }
        } else {
            // For other types, return a default string representation
            return "converted_value"
        }
    }

    // Helper function to build query string from parameters
    private func buildQueryString(params: HashMap<String, Any>): String {
        let pairs = ArrayList<String>()
        let keys = params.keys()
        for (key in keys) {
            let value = match (params.get(key)) {
                case Some(v) => convertToString(v)
                case _ => ""
            }
            pairs.add(key + "=" + encodeURIComponent(value))
        }
        return String.join(pairs.toArray(), delimiter: "&")
    }

    // Helper function to encode URI component
    private func encodeURIComponent(str: String): String {
        // Simplified implementation - in real code, this would properly encode URI components
        return str.replace(" ", "%20").replace("#", "%23").replace("&", "%26").replace("+", "%2B")
    }

    // Helper function to build JSON body from parameters
    private func buildJsonBody(params: HashMap<String, Any>): String {
        var json = "{"
        var first = true
        let keys = params.keys()
        for (key in keys) {
            if (!first) {
                json = json + ","
            }
            json = json + "\"" + key + "\":"

            let valueOpt = params.get(key)
            if (valueOpt.isSome()) {
                let value = valueOpt.getOrThrow()
                if (value is String) {
                    let strValue = value as String
                    if (strValue.isSome()) {
                        json = json + "\"" + escapeJsonString(strValue.getOrThrow()) + "\""
                    } else {
                        json = json + "\"\""
                    }
                } else if (value is Int32 || value is Int64) {
                    json = json + convertToString(value)
                } else if (value is Float32 || value is Float64) {
                    json = json + convertToString(value)
                } else if (value is Bool) {
                    let boolValue = value as Bool
                    if (boolValue.isSome()) {
                        json = json + if (boolValue.getOrThrow()) { "true" } else { "false" }
                    } else {
                        json = json + "false"
                    }
                } else {
                    // For other types, convert to string and wrap in quotes as fallback
                    json = json + "\"" + escapeJsonString(convertToString(value)) + "\""
                }
            } else {
                json = json + "null"
            }

            first = false
        }
        json = json + "}"
        return json
    }

    // Helper function to escape special characters in JSON strings
    private func escapeJsonString(str: String): String {
        var result = str
        result = result.replace("\\", "\\\\")
        result = result.replace("\"", "\\\"")
        result = result.replace("\n", "\\n")
        result = result.replace("\r", "\\r")
        result = result.replace("\t", "\\t")
        return result
    }

    // Helper function to build JSON string from HashMap
    private func buildJsonString(map: HashMap<String, String>): String {
        var json = "{"
        var first = true
        let keys = map.keys()
        for (key in keys) {
            if (!first) {
                json = json + ","
            }
            json = json + "\"" + key + "\":\"" + escapeJsonString(map[key]) + "\""
            first = false
        }
        json = json + "}"
        return json
    }

    // Helper function to make HTTP requests to the backend
    private func makeHttpRequest(url: String, options: HashMap<String, Any>): HttpResponse {
        try {
            Utils.logMessage("DEBUG", "=== makeHttpRequest START ===")
            Utils.logMessage("DEBUG", "URL: " + url)
            
            // Build the client with proper TLS configuration for HTTPS URLs
            Utils.logMessage("DEBUG", "Building HTTP client...")
            let client = buildHttpClient(url)
            Utils.logMessage("DEBUG", "HTTP client built successfully")

            let method = match (options.get("method")) {
                case Some(m) => convertToString(m)
                case _ => "GET"
            }
            Utils.logMessage("DEBUG", "HTTP method: " + method)

            let body = match (options.get("body")) {
                case Some(b) => convertToString(b)
                case _ => ""
            }
            if (!body.isEmpty()) {
                Utils.logMessage("DEBUG", "Request body: " + body)
            }

            // Add headers to the request
            Utils.logMessage("DEBUG", "Building HTTP request...")
            let requestBuilder = HttpRequestBuilder()
                .url(url)

            // Add the headers from the options map to the request
            let headersOpt = options.get("headers")
            if (headersOpt.isSome()) {
                let headers = headersOpt.getOrThrow() as HashMap<String, String>
                if (headers.isSome()) {
                    let headerMap = headers.getOrThrow()
                    for ((key, value) in headerMap) {
                        requestBuilder.header(key, value)
                        Utils.logMessage("DEBUG", "Adding header to request: " + key + " = " + value)
                    }
                }
            }

            // Handle different HTTP methods with appropriate body
            let request = if (method == "GET") {
                requestBuilder.get().build()
            } else if (method == "POST") {
                // For POST, include body if available
                if (!body.isEmpty()) {
                    requestBuilder.post().body(body).build()
                } else {
                    requestBuilder.post().build()
                }
            } else if (method == "PUT") {
                // For PUT, include body if available
                if (!body.isEmpty()) {
                    requestBuilder.put().body(body).build()
                } else {
                    requestBuilder.put().build()
                }
            } else if (method == "DELETE") {
                // For DELETE, include body if available (some APIs expect body for delete)
                if (!body.isEmpty()) {
                    requestBuilder.delete().body(body).build()
                } else {
                    requestBuilder.delete().build()
                }
            } else {
                // Default to GET
                requestBuilder.get().build()
            }

            // Send the request
            Utils.logMessage("DEBUG", "Sending HTTP request...")
            let httpResponse = client.send(request)
            Utils.logMessage("DEBUG", "HTTP request sent successfully, status: " + httpResponse.status.toString())

            // Read the response body from the actual HTTP response
            Utils.logMessage("DEBUG", "Reading response body...")
            let responseBody = try {
                let reader = StringReader(httpResponse.body)
                reader.readToEnd()
            } catch (readEx: Exception) {
                Utils.logMessage("WARN", "Could not read response body: " + readEx.message)
                ""
            }
            Utils.logMessage("DEBUG", "Response body read successfully, length: " + responseBody.size.toString())
            Utils.logMessage("DEBUG", "Response body: " + responseBody)

            // Create our custom response object
            let customHttpResponse = HttpResponse()
            customHttpResponse.status = Int32(httpResponse.status)  // Convert UInt16 to Int32
            customHttpResponse.data = HashMap<String, Any>()
            customHttpResponse.data["message"] = "Successfully called backend API: " + url
            customHttpResponse.data["method"] = method
            customHttpResponse.data["receivedAt"] = DateTime.now().toString()
            customHttpResponse.data["backendResponse"] = responseBody
            customHttpResponse.data["url"] = url
            customHttpResponse.data["status_code"] = customHttpResponse.status
            Utils.logMessage("DEBUG", "=== makeHttpRequest END ===")

            // Extract headers from the actual HTTP response
            let responseHeaders = HashMap<String, String>()

            // Try to get common headers individually since HttpHeaders doesn't support iteration
            let contentTypeList = httpResponse.headers.get("Content-Type")
            if (!contentTypeList.isEmpty()) {
                // Access the first element of the collection
                var i = 0
                for (value in contentTypeList) {
                    if (i == 0) {
                        responseHeaders["Content-Type"] = value
                        break
                    }
                    i = i + 1
                }
            }
            let contentLengthList = httpResponse.headers.get("Content-Length")
            if (!contentLengthList.isEmpty()) {
                // Access the first element of the collection
                var i = 0
                for (value in contentLengthList) {
                    if (i == 0) {
                        responseHeaders["Content-Length"] = value
                        break
                    }
                    i = i + 1
                }
            }
            let authorizationList = httpResponse.headers.get("Authorization")
            if (!authorizationList.isEmpty()) {
                // Access the first element of the collection
                var i = 0
                for (value in authorizationList) {
                    if (i == 0) {
                        responseHeaders["Authorization"] = value
                        break
                    }
                    i = i + 1
                }
            }
            let locationList = httpResponse.headers.get("Location")
            if (!locationList.isEmpty()) {
                // Access the first element of the collection
                var i = 0
                for (value in locationList) {
                    if (i == 0) {
                        responseHeaders["Location"] = value
                        break
                    }
                    i = i + 1
                }
            }
            customHttpResponse.headers = responseHeaders

            // Close the client
            Utils.logMessage("DEBUG", "Closing HTTP client...")
            client.close()
            Utils.logMessage("DEBUG", "HTTP client closed successfully")

            return customHttpResponse
        } catch (ex: Exception) {
            // On error, return an error response
            Utils.logMessage("ERROR", "=== makeHttpRequest ERROR ===")
            Utils.logMessage("ERROR", "HTTP request failed with exception: " + ex.message)
            let httpResponse = HttpResponse()
            httpResponse.status = 500
            httpResponse.data = HashMap<String, Any>()
            httpResponse.data["error"] = "HTTP request failed: " + ex.message
            httpResponse.data["url"] = url
            httpResponse.data["receivedAt"] = DateTime.now().toString()
            httpResponse.data["status_code"] = 500

            return httpResponse
        }
    }

    // Helper function to build HTTP client with proper TLS configuration for HTTPS
    private func buildHttpClient(url: String): Client {
        let cb = ClientBuilder()
        cb.readTimeout(Duration.minute * 10)  // 10 minutes read timeout
        if (url.startsWith("https://")) {
            var config = TlsClientConfig()
            // For production environments, we might need to handle custom certificates
            config.verifyMode = TrustAll  // Temporarily set to TrustAll to bypass certificate issues in test environment
            // Extract domain from URL
            let parsedUrl = URL.parse(url)
            config.domain = parsedUrl.hostName
            cb.tlsConfig(config)
        }
        // Add connector configuration
        let TcpSocketConnector = { sa: SocketAddress =>
            let socket = TcpSocket(sa)
            socket.readTimeout = Duration.millisecond * 5000  // 5 seconds read timeout
            socket.writeTimeout = Duration.millisecond * 5000 // 5 seconds write timeout
            socket.connect(timeout: Duration.millisecond * 5000) // 5 seconds connection timeout
            return socket
        }
        cb.connector(TcpSocketConnector)
        return cb.build()
    }


    // Helper function to add headers to request builder
    private func addHeadersToRequest(requestBuilder: HttpRequestBuilder, headers: HashMap<String, String>): Unit {
        for ((key, value) in headers) {
            requestBuilder.header(key, value)
        }
    }

    // Create error response
    private func createErrorResponse(requestId: String, errorMessage: String): APIResponse {
        let errorResponse = APIResponse()
        errorResponse.id = Utils.generateId()
        errorResponse.status = 500
        errorResponse.error = errorMessage
        errorResponse.timestamp = (DateTime.now() - DateTime.UnixEpoch).toMilliseconds()
        errorResponse.requestId = requestId

        return errorResponse
    }

    // Method to test connection to backend
    func testConnection(): Bool {
        try {
            Utils.logMessage("DEBUG", "Testing connection to backend at: " + adapterConfig.backendUrl)
            // Simulate connection test
            return true  // Always return true for simulation
        } catch (ex: Exception) {
            Utils.logMessage("ERROR", "Connection test failed: " + ex.message)
            return false
        }
    }
}

// Helper class for HTTP responses
class HttpResponse {
    var status: Int32 = 200
    var data: HashMap<String, Any> = HashMap<String, Any>()
    var headers: HashMap<String, String> = HashMap<String, String>()
}

// Helper class to hold API call information
class ApiCallInfo {
    var endpoint: String = ""
    var method: String = "GET"
    var parameters: HashMap<String, Any> = HashMap<String, Any>()
    var headers: HashMap<String, String> = HashMap<String, String>()
    var requestId: String = ""
}