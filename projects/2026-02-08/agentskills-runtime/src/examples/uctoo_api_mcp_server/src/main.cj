/*
 * Copyright (c) 2024-2025. UCToo Team. All rights reserved.
 *
 * MCP Server adapter for uctoo-backend APIs
 * Allows AI assistant clients to call uctoo-backend server APIs using natural language
 */

package magic.examples.uctoo_api_mcp_server.src

import magic.dsl.*
import magic.prelude.*
import magic.mcp.StdioMCPServer
import std.collection.HashMap
import std.time.DateTime
import magic.log.LogUtils
import std.regex.Regex

// Helper function to log messages using the standard logging system
func logToFile(filename: String, message: String): Unit {
    // Use the standard logging system to log the message
    LogUtils.info("MCP_SERVER_" + filename.replace(".log", "") + ": " + message)
}

// MCP Server adapter implementation using tools approach
@tool[description: "Process natural language requests and convert to backend API calls"]
func processNaturalLanguageRequest(query: String): String {
    // Log the incoming request to file for debugging
    let requestLog = "=== processNaturalLanguageRequest START ==="
    Utils.logMessage("DEBUG", requestLog)
    logToFile("uctoo-mcp-server.log", requestLog)
    
    Utils.logMessage("DEBUG", "Query: " + query)
    logToFile("uctoo-mcp-server.log", "Query: " + query)

    // Create a simple processor instance and process the query
    Utils.logMessage("DEBUG", "Creating NaturalLanguageProcessor...")
    let processor = NaturalLanguageProcessor()
    let request = NaturalLanguageRequest()
    request.queryText = query
    Utils.logMessage("DEBUG", "Request created with queryText: " + request.queryText)

    Utils.logMessage("DEBUG", "Calling processor.process...")
    let result = processor.process(request)
    Utils.logMessage("DEBUG", "processor.process returned")

    // Log the result from processor for debugging
    let resultLog = "Result status: " + result.status.toString() + ", error.isSome(): " + result.error.isSome().toString()
    Utils.logMessage("DEBUG", resultLog)
    logToFile("uctoo-mcp-server.log", resultLog)
    
    if (result.error.isSome()) {
        Utils.logMessage("DEBUG", "Error: " + result.error.getOrThrow())
    }
    
    Utils.logMessage("DEBUG", "result.isError(): " + result.isError().toString())
    Utils.logMessage("DEBUG", "result.data.isSome(): " + result.data.isSome().toString())

    // Format the result appropriately to return actual backend data
    if (result.isError()) {
        Utils.logMessage("DEBUG", "result.isError() is true")
        if (result.error.isSome()) {
            let errorResult = result.error.getOrThrow()
            Utils.logMessage("DEBUG", "Returning error result: " + errorResult)
            // Wrap error in JSON format
            return "{\"error\":\"" + errorResult + "\",\"status\":\"error\",\"query\":\"" + query + "\"}"
        } else {
            let unknownError = "{\"error\":\"Unknown error occurred while processing request\",\"status\":\"error\",\"query\":\"" + query + "\"}"
            Utils.logMessage("DEBUG", "Returning unknown error: " + unknownError)
            return unknownError
        }
    } else {
        Utils.logMessage("DEBUG", "Processing successful result from NaturalLanguageProcessor")

        // Return the backend response directly
        let dataOpt = result.data
        if (dataOpt.isSome()) {
            let data = dataOpt.getOrThrow()
            Utils.logMessage("DEBUG", "Result data type: " + (if (data is String) { "String" } else { "Not String" }))

            // Check if the data is a direct string (like for some responses)
            if (data is String) {
                let strOpt = data as String
                if (strOpt.isSome()) {
                    let responseStr = strOpt.getOrThrow()
                    Utils.logMessage("DEBUG", "Response string length: " + responseStr.size.toString() + ", starts with: " +
                                    if (responseStr.size >= 50) { responseStr[0..50] } else { responseStr })

                    // Log login responses specifically to help with debugging
                    if (responseStr.contains("access_token") || responseStr.contains("refresh_token") || responseStr.contains("user")) {
                        Utils.logMessage("DEBUG", "LOGIN RESPONSE CAPTURED (direct string): " + responseStr)

                        // Extract and log the access_token separately for verification using the common utility method
                        let extractedToken = Utils.extractTokenFromResponse(responseStr)
                        if (!extractedToken.isEmpty()) {
                            Utils.logMessage("DEBUG", "ACCESS_TOKEN_EXTRACTED_FROM_AI_RESPONSE: " + extractedToken)

                            // Store the token for subsequent API calls
                            UctooMCPAdapter.storeAuthToken(extractedToken)
                            Utils.logMessage("DEBUG", "Stored access token from AI response for subsequent API calls")
                        } else {
                            Utils.logMessage("ERROR", "Failed to extract access token from AI response using common utility method")
                        }
                    } else {
                        Utils.logMessage("DEBUG", "Response does not contain access_token, refresh_token, or user")
                    }

                    // If it's already a JSON string, return as is
                    if (responseStr.startsWith("{") || responseStr.startsWith("[")) {
                        Utils.logMessage("DEBUG", "Returning JSON response: " + responseStr)
                        return responseStr
                    } else {
                        // It's a plain string, wrap it in JSON format
                        Utils.logMessage("DEBUG", "Wrapping plain string response in JSON: " + responseStr)
                        return "{\"message\":\"" + responseStr + "\",\"raw_response\":true}"
                    }
                } else {
                    Utils.logMessage("DEBUG", "String conversion failed")
                    let noValidResponse = "{\"error\":\"No valid response string\",\"status\":\"error\"}"
                    Utils.logMessage("DEBUG", "Returning: " + noValidResponse)
                    return noValidResponse
                }
            }
            // Otherwise, check if it's a HashMap (for other types of responses)
            else if (data is HashMap<String, Any>) {
                let hashMap = data as HashMap<String, Any>
                if (hashMap.isSome()) {
                    let map = hashMap.getOrThrow()
                    Utils.logMessage("DEBUG", "Processing HashMap response with " + map.size.toString() + " entries")
                    
                    // Log all keys in the map for debugging
                    let keys = map.keys()
                    for (key in keys) {
                        Utils.logMessage("DEBUG", "  Map key: " + key)
                    }

                    // First check for the loginData field which contains the raw backend response (especially for login)
                    let loginDataOpt = map.get("loginData")
                    if (loginDataOpt.isSome()) {
                        let loginData = loginDataOpt.getOrThrow()
                        Utils.logMessage("DEBUG", "Found loginData in response map")
                        if (loginData is String) {
                            let strOpt = loginData as String
                            if (strOpt.isSome()) {
                                let loginStr = strOpt.getOrThrow()
                                // This should be the raw JSON response from the backend login API, return it directly
                                Utils.logMessage("DEBUG", "Returning raw JSON from loginData: " + loginStr)

                                // Log login responses specifically to help with debugging
                                if (loginStr.contains("access_token") || loginStr.contains("refresh_token") || loginStr.contains("user")) {
                                    Utils.logMessage("DEBUG", "LOGIN RESPONSE CAPTURED from loginData: " + loginStr)

                                    // Extract and log the access_token separately for verification using the common utility method
                                    let extractedToken = Utils.extractTokenFromResponse(loginStr)
                                    if (!extractedToken.isEmpty()) {
                                        Utils.logMessage("DEBUG", "ACCESS_TOKEN_EXTRACTED_FROM_LOGIN_DATA: " + extractedToken)

                                        // Store the token for subsequent API calls
                                        UctooMCPAdapter.storeAuthToken(extractedToken)
                                        Utils.logMessage("DEBUG", "Stored access token from login data for subsequent API calls")
                                    } else {
                                        Utils.logMessage("ERROR", "Failed to extract access token from login data using common utility method")
                                    }
                                }
                                Utils.logMessage("DEBUG", "Returning loginData: " + loginStr)
                                return loginStr
                            }
                        }
                    }

                    // Then try to get the backend response specifically
                    let backendResponseOpt = map.get("backendResponse")
                    if (backendResponseOpt.isSome()) {
                        let backendResponse = backendResponseOpt.getOrThrow()
                        Utils.logMessage("DEBUG", "Found backendResponse in map")
                        if (backendResponse is String) {
                            let strOpt = backendResponse as String
                            if (strOpt.isSome()) {
                                let responseStr = strOpt.getOrThrow()
                                Utils.logMessage("DEBUG", "Backend response string: " + responseStr)

                                // Log login responses specifically to help with debugging
                                if (responseStr.contains("access_token") || responseStr.contains("refresh_token") || responseStr.contains("user")) {
                                    Utils.logMessage("DEBUG", "LOGIN RESPONSE CAPTURED from backendResponse: " + responseStr)
                                }

                                // Check if the response is already in JSON format
                                if (responseStr.startsWith("{") || responseStr.startsWith("[")) {
                                    // It's already a JSON object/array, return as is
                                    Utils.logMessage("DEBUG", "Returning JSON object/array from backendResponse: " + responseStr)
                                    return responseStr
                                } else {
                                    // It's a plain string, wrap it in JSON format
                                    Utils.logMessage("DEBUG", "Wrapping plain string from backendResponse in JSON: " + responseStr)
                                    return "{\"message\":\"" + responseStr + "\",\"raw_response\":true}"
                                }
                            } else {
                                // If direct string conversion fails, try to convert the original value to string representation
                                Utils.logMessage("ERROR", "Failed to convert backendResponse to String, attempting alternative conversion")
                                // Check if the original backendResponse might be a HashMap that needs to be converted to JSON string
                                if (backendResponse is HashMap<String, Any>) {
                                    let hashMap = backendResponse as HashMap<String, Any>
                                    if (hashMap.isSome()) {
                                        // For debugging, let's try to return a simple string representation
                                        let debugResponse = "{\"message\":\"Login response data received\",\"status\":\"success\"}"
                                        Utils.logMessage("DEBUG", "Returning debug response: " + debugResponse)
                                        return debugResponse
                                    }
                                }
                                let convertedResponse = convertToString(backendResponse)
                                let jsonResponse = "{\"message\":\"" + convertedResponse + "\",\"status\":\"success\"}"
                                Utils.logMessage("DEBUG", "Returning converted response: " + jsonResponse)
                                return jsonResponse
                            }
                        } else {
                            // If not a string, convert using our helper
                            Utils.logMessage("DEBUG", "Converting non-string backendResponse using helper")
                            let convertedResponse = convertToString(backendResponse)
                            let jsonResponse = "{\"message\":\"" + convertedResponse + "\",\"status\":\"success\"}"
                            Utils.logMessage("DEBUG", "Returning converted response: " + jsonResponse)
                            return jsonResponse
                        }
                    } else {
                        // Check for the data field which might contain the login response directly
                        let dataFieldOpt = map.get("data")
                        if (dataFieldOpt.isSome()) {
                            let dataField = dataFieldOpt.getOrThrow()
                            if (dataField is String) {
                                let strOpt = dataField as String
                                if (strOpt.isSome()) {
                                    let dataStr = strOpt.getOrThrow()
                                    // If this looks like a login response (contains tokens), return it directly
                                    if (dataStr.contains("access_token") || dataStr.contains("refresh_token") ||
                                        dataStr.contains("user") || dataStr.startsWith("{")) {
                                        Utils.logMessage("DEBUG", "Returning data field response: " + dataStr)
                                        return dataStr
                                    }
                                }
                            }
                        }

                        // If no backend response found, check for other fields or return the entire map as JSON
                        Utils.logMessage("DEBUG", "No backendResponse or data field found in map")
                        Utils.logMessage("DEBUG", "Converting entire map to JSON string for debugging")
                        
                        // Convert the entire map to a JSON string for debugging
                        var jsonBuilder = StringBuilder()
                        jsonBuilder.append("{")
                        var first = true
                        for ((key, value) in map) {
                            if (!first) {
                                jsonBuilder.append(", ")
                            }
                            first = false
                            jsonBuilder.append("\"" + key + "\": ")
                            if (value is String) {
                                let strOpt = value as String
                                if (strOpt.isSome()) {
                                    jsonBuilder.append("\"" + strOpt.getOrThrow() + "\"")
                                } else {
                                    jsonBuilder.append("\"unknown\"")
                                }
                            } else {
                                jsonBuilder.append("\"" + convertToString(value) + "\"")
                            }
                        }
                        jsonBuilder.append("}")
                        let mapAsJson = jsonBuilder.toString()
                        Utils.logMessage("DEBUG", "Returning entire map as JSON: " + mapAsJson)
                        return mapAsJson
                    }
                } else {
                    Utils.logMessage("ERROR", "Failed to convert data to HashMap")
                    let noValidStructure = "{\"error\":\"No valid response data structure\",\"status\":\"error\"}"
                    Utils.logMessage("DEBUG", "Returning: " + noValidStructure)
                    return noValidStructure
                }
            } else {
                Utils.logMessage("ERROR", "Data is neither String nor HashMap")
                let unexpectedType = "{\"error\":\"Unexpected data type returned from processor\",\"status\":\"error\"}"
                Utils.logMessage("DEBUG", "Returning: " + unexpectedType)
                return unexpectedType
            }
        } else {
            let noDataResponse = "{\"error\":\"No data returned from request\",\"status\":\"error\",\"query\":\"" + query + "\"}"
            Utils.logMessage("DEBUG", "Returning: " + noDataResponse)
            return noDataResponse
        }
    }
}

@tool[description: "Get entity by ID - retrieves a specific entity by its ID"]
func getMcpServiceById(serviceId: String): String {
    Utils.logMessage("DEBUG", "getMcpServiceById called with serviceId: " + serviceId)

    // This function should actually call the backend API to get an entity by ID
    // Use the same approach as in NaturalLanguageProcessor for consistency

    // Create a processor instance to handle the request
    let processor = NaturalLanguageProcessor()
    let request = NaturalLanguageRequest()
    // Construct a query to get the specific entity by ID
    request.queryText = "获取ID为" + serviceId + "的entity实体"
    request.intent = "GET_RESOURCE"

    // Add the ID as a parameter
    let params = HashMap<String, Any>()
    params["id"] = serviceId
    request.parameters = params

    let result = processor.process(request)

    // Format the result appropriately
    if (result.isError()) {
        if (result.error.isSome()) {
            let errorMsg = result.error.getOrThrow()
            Utils.logMessage("ERROR", "Error in getMcpServiceById: " + errorMsg)
            return "{\"error\":\"" + errorMsg + "\",\"status\":\"error\",\"serviceId\":\"" + serviceId + "\"}"
        } else {
            let errorMsg = "{\"error\":\"Unknown error occurred while getting entity\",\"status\":\"error\",\"serviceId\":\"" + serviceId + "\"}"
            Utils.logMessage("ERROR", errorMsg)
            return errorMsg
        }
    } else {
        // Return the backend response directly
        let dataOpt = result.data
        if (dataOpt.isSome()) {
            let data = dataOpt.getOrThrow()

            // Check if the data is a direct string (like for some responses)
            if (data is String) {
                let strOpt = data as String
                if (strOpt.isSome()) {
                    let responseStr = strOpt.getOrThrow()
                    Utils.logMessage("DEBUG", "getMcpServiceById - Response string length: " + responseStr.size.toString())

                    // If it's already a JSON string, return as is
                    if (responseStr.startsWith("{") || responseStr.startsWith("[")) {
                        return responseStr
                    } else {
                        // It's a plain string, wrap it in JSON format
                        return "{\"message\":\"" + responseStr + "\",\"raw_response\":true}"
                    }
                } else {
                    Utils.logMessage("DEBUG", "getMcpServiceById - String conversion failed")
                    return "{\"error\":\"No valid response string for entity ID\",\"status\":\"error\",\"serviceId\":\"" + serviceId + "\"}"
                }
            }

            // Otherwise, check if it's a HashMap (for other types of responses)
            else if (data is HashMap<String, Any>) {
                let hashMap = data as HashMap<String, Any>
                if (hashMap.isSome()) {
                    let map = hashMap.getOrThrow()

                    // Try to get the backend response specifically
                    let backendResponseOpt = map.get("backendResponse")
                    if (backendResponseOpt.isSome()) {
                        let backendResponse = backendResponseOpt.getOrThrow()
                        if (backendResponse is String) {
                            let strOpt = backendResponse as String
                            if (strOpt.isSome()) {
                                let responseStr = strOpt.getOrThrow()
                                // Check if the response is already in JSON format
                                if (responseStr.startsWith("{") || responseStr.startsWith("[")) {
                                    // It's already a JSON object/array, return as is
                                    return responseStr
                                } else {
                                    // It's a plain string, wrap it in JSON format
                                    return "{\"message\":\"" + responseStr + "\",\"raw_response\":true}"
                                }
                            } else {
                                // If direct string conversion fails, convert using helper
                                let convertedResponse = convertToString(backendResponse)
                                return "{\"message\":\"" + convertedResponse + "\",\"status\":\"success\"}"
                            }
                        } else {
                            // If not a string, convert using helper
                            let convertedResponse = convertToString(backendResponse)
                            return "{\"message\":\"" + convertedResponse + "\",\"status\":\"success\"}"
                        }
                    } else {
                        // If no backend response found, return a not found message in JSON format
                        Utils.logMessage("DEBUG", "Entity with ID " + serviceId + " not found")
                        return "{\"error\":\"Entity not found\",\"message\":\"未找到 ID 为 " + serviceId + " 的 entity 实体。\",\"status\":\"error\"}"
                    }
                }
            }
        }

        Utils.logMessage("DEBUG", "No data returned from entity query for ID: " + serviceId)
        return "{\"error\":\"No data returned\",\"message\":\"未找到 ID 为 " + serviceId + " 的 entity 实体。\",\"status\":\"error\"}"
    }
}

@tool[description: "List all API mappings"]
func listApiMappings(): String {
    let mapper = ApiMapper()
    let mappings = mapper.getAllMappings()

    var result = "{\"total\":" + mappings.size.toString() + ",\"mappings\":["
    var first = true
    for (mapping in mappings) {
        if (!first) {
            result += ","
        }
        result += "{\"id\":\"" + mapping.mappingId + "\",\"endpoint\":\"" + mapping.backendEndpoint + "\"}"
        first = false
    }
    result += "]}"

    return result
}

@agent[
    model: "dashscope:qwen3-max-preview",
    description: "Direct MCP adapter for UCToo backend APIs, processing natural language to API calls",
    tools: [processNaturalLanguageRequest, getMcpServiceById, listApiMappings]
]
public class UctooMCPAdapterAgent {
    @prompt("You are a direct MCP adapter that processes natural language requests by converting them to direct API calls to the uctoo-backend server. Return the raw API response directly to the client without modification.\n\n" +
            "Available tools:\n" +
            "- processNaturalLanguageRequest: Process natural language requests and convert to backend API calls\n" +
            "- getMcpServiceById: Get MCP service details by ID\n" +
            "- listApiMappings: List all API mappings\n\n" +
            "Special handling for login requests:\n" +
            "- When processing login requests, ensure to extract username and password accurately\n" +
            "- Common login formats include: '使用账号{username}和密码{password}登录', '请使用账号{username}和密码{password}登录', '登录，用户名为{username}，密码为{password}'\n" +
            "- Extract parameters carefully and call the appropriate authentication API\n" +
            "- After successful login, the access token will be stored for subsequent authenticated requests\n" +
            "- For all other requests, convert the natural language to the appropriate backend API call\n" +
            "- Always return the raw API response directly to the client")
}

// A more direct MCP function for processing natural language requests
@tool[description: "Process natural language request directly to backend API"]
func processNaturalLanguageRequestDirect(query: String): String {
    // Create processor and process the query
    let processor = NaturalLanguageProcessor()
    let request = NaturalLanguageRequest()
    request.queryText = query

    let result = processor.process(request)

    // Format the result appropriately
    if (result.isError()) {
        if (result.error.isSome()) {
            let errorMsg = result.error.getOrThrow()
            return "{\"error\":\"" + errorMsg + "\",\"status\":\"error\",\"query\":\"" + query + "\"}"
        } else {
            return "{\"error\":\"Unknown error occurred while processing request\",\"status\":\"error\",\"query\":\"" + query + "\"}"
        }
    } else {
        // Return the backend response directly
        let dataOpt = result.data
        if (dataOpt.isSome()) {
            let data = dataOpt.getOrThrow()

            // Check if the data is a direct string (like for some responses)
            if (data is String) {
                let strOpt = data as String
                if (strOpt.isSome()) {
                    let responseStr = strOpt.getOrThrow()
                    Utils.logMessage("DEBUG", "Direct function - Response string length: " + responseStr.size.toString() + ", starts with: " +
                                    if (responseStr.size >= 50) { responseStr[0..50] } else { responseStr })

                    // Log login responses specifically to help with debugging
                    if (responseStr.contains("access_token") || responseStr.contains("refresh_token") || responseStr.contains("user")) {
                        Utils.logMessage("DEBUG", "LOGIN RESPONSE CAPTURED (direct string): " + responseStr)

                        // Extract and log the access_token separately for verification using the common utility method
                        let extractedToken = Utils.extractTokenFromResponse(responseStr)
                        if (!extractedToken.isEmpty()) {
                            Utils.logMessage("DEBUG", "ACCESS_TOKEN_EXTRACTED_FROM_AI_RESPONSE_DIRECT: " + extractedToken)

                            // Store the token for subsequent API calls
                            UctooMCPAdapter.storeAuthToken(extractedToken)
                            Utils.logMessage("DEBUG", "Stored access token from AI response (direct) for subsequent API calls")
                        } else {
                            Utils.logMessage("ERROR", "Failed to extract access token from AI response using common utility method")
                        }
                    } else {
                        Utils.logMessage("DEBUG", "Direct function - Response does not contain access_token, refresh_token, or user")
                    }

                    // If it's already a JSON string, return as is
                    if (responseStr.startsWith("{") || responseStr.startsWith("[")) {
                        return responseStr
                    } else {
                        // It's a plain string, wrap it in JSON format
                        return "{\"message\":\"" + responseStr + "\",\"raw_response\":true}"
                    }
                } else {
                    Utils.logMessage("DEBUG", "Direct function - String conversion failed")
                    return "{\"error\":\"No valid response string\",\"status\":\"error\"}"
                }
            }
            // Otherwise, check if it's a HashMap (for other types of responses)
            else if (data is HashMap<String, Any>) {
                let hashMap = data as HashMap<String, Any>
                if (hashMap.isSome()) {
                    let map = hashMap.getOrThrow()
                    // Try to get the backend response specifically
                    let backendResponseOpt = map.get("backendResponse")
                    if (backendResponseOpt.isSome()) {
                        let backendResponse = backendResponseOpt.getOrThrow()
                        if (backendResponse is String) {
                            let strOpt = backendResponse as String
                            if (strOpt.isSome()) {
                                let responseStr = strOpt.getOrThrow()
                                // Check if the response is already in JSON format
                                if (responseStr.startsWith("{") || responseStr.startsWith("[")) {
                                    // It's already a JSON object/array, return as is
                                    return responseStr
                                } else {
                                    // It's a plain string, wrap it in JSON format
                                    return "{\"message\":\"" + responseStr + "\",\"raw_response\":true}"
                                }
                            } else {
                                // If direct string conversion fails, convert using our helper
                                let convertedResponse = convertToString(backendResponse)
                                return "{\"message\":\"" + convertedResponse + "\",\"status\":\"success\"}"
                            }
                        } else {
                            // If not a string, convert using our helper
                            let convertedResponse = convertToString(backendResponse)
                            return "{\"message\":\"" + convertedResponse + "\",\"status\":\"success\"}"
                        }
                    } else {
                        // First, check if the data field itself is a string (which would be the case for direct login responses),
                        // return it directly if it looks like a login response
                        if (data is String) {
                            let dataStrOpt = data as String
                            if (dataStrOpt.isSome()) {
                                let dataStr = dataStrOpt.getOrThrow()
                                // If this looks like a login response (valid JSON with authentication tokens), return it directly
                                if (dataStr.startsWith("{") && (dataStr.contains("access_token") || dataStr.contains("refresh_token") || dataStr.contains("user"))) {
                                    return dataStr
                                }
                            }
                        }
                        // If data is a HashMap, check for specific fields including loginData
                        else if (data is HashMap<String, Any>) {
                            let dataMap = data as HashMap<String, Any>
                            if (dataMap.isSome()) {
                                let hashMap = dataMap.getOrThrow()

                                // First check for the loginData field which contains the raw backend response
                                let loginDataOpt1 = hashMap.get("loginData")
                                if (loginDataOpt1.isSome()) {
                                    let loginData = loginDataOpt1.getOrThrow()
                                    if (loginData is String) {
                                        let strOpt = loginData as String
                                        if (strOpt.isSome()) {
                                            let loginStr = strOpt.getOrThrow()
                                            // This should be the raw JSON response from the backend login API, return it directly
                                            return loginStr
                                        }
                                    }
                                }

                                // Then check for the backendResponse field which might contain the login data
                                let backendResponseOpt = hashMap.get("backendResponse")
                                if (backendResponseOpt.isSome()) {
                                    let backendResponse = backendResponseOpt.getOrThrow()
                                    if (backendResponse is String) {
                                        let strOpt = backendResponse as String
                                        if (strOpt.isSome()) {
                                            let responseStr = strOpt.getOrThrow()
                                            // If this looks like a login response (contains tokens), return it directly
                                            if (responseStr.contains("access_token") || responseStr.contains("refresh_token") ||
                                                responseStr.contains("user") || responseStr.startsWith("{")) {
                                                Utils.logMessage("DEBUG", "Returning backendResponse as login response: " + responseStr)
                                                return responseStr
                                            }
                                        } else {
                                            // If string conversion fails, try alternative approach
                                            Utils.logMessage("ERROR", "Failed to convert backendResponse to String in direct function")
                                            // Check if it's a HashMap that might contain the login data
                                            if (backendResponse is HashMap<String, Any>) {
                                                let hashMap = backendResponse as HashMap<String, Any>
                                                if (hashMap.isSome()) {
                                                    // For debugging, let's try to return a simple JSON representation
                                                    return "{\"message\":\"Login response data received\",\"status\":\"success\"}"
                                                }
                                            }
                                            let convertedResponse = convertToString(backendResponse)
                                            return "{\"message\":\"" + convertedResponse + "\",\"status\":\"success\"}"
                                        }
                                    } else {
                                        // If not a string, try to convert
                                        Utils.logMessage("DEBUG", "Converting non-string backendResponse in direct function")
                                        let convertedResponse = convertToString(backendResponse)
                                        return "{\"message\":\"" + convertedResponse + "\",\"status\":\"success\"}"
                                    }
                                }

                                // Check for the data field which might contain the login response directly
                                let dataFieldOpt = hashMap.get("data")
                                if (dataFieldOpt.isSome()) {
                                    let dataField = dataFieldOpt.getOrThrow()
                                    if (dataField is String) {
                                        let strOpt = dataField as String
                                        if (strOpt.isSome()) {
                                            let dataStr = strOpt.getOrThrow()
                                            // If this looks like a login response (contains tokens), return it directly
                                            if (dataStr.contains("access_token") || dataStr.contains("refresh_token") ||
                                                dataStr.contains("user") || dataStr.startsWith("{")) {
                                                return dataStr
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // If loginResult is a valid JSON response from the backend (which should be the case now), return it directly
                        // The response.data should contain the raw JSON string for successful login responses
                        if (data is String) {
                            let strOpt = data as String
                            if (strOpt.isSome()) {
                                let responseStr = strOpt.getOrThrow()
                                // If this is a JSON response (should be for login), return it directly
                                if (responseStr.startsWith("{")) {
                                    Utils.logMessage("DEBUG", "Returning direct JSON response from data field: " + responseStr)
                                    return responseStr
                                }
                            }
                        }

                        // If no specific login data found, return a JSON message indicating the request was processed
                        return "{\"message\":\"Request processed\",\"query\":\"" + query + "\",\"status\":\"success\"}"
                    }
                } else {
                    return "{\"error\":\"No valid response data structure\",\"status\":\"error\"}"
                }
            } else {
                return "{\"message\":\"Request processed\",\"query\":\"" + query + "\",\"result\":\"" + convertToString(data) + "\",\"status\":\"success\"}"
            }
        } else {
            return "{\"error\":\"No data returned from request\",\"status\":\"error\",\"query\":\"" + query + "\"}"
        }
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

@agent[
    description: "Direct MCP adapter for UCToo backend APIs, processing natural language to API calls without AI interpretation",
    tools: [processNaturalLanguageRequestDirect, getMcpServiceById, listApiMappings]
]
public class DirectUctooMCPAdapterAgent {
    @prompt("You are a direct MCP adapter that processes natural language requests by converting them to direct API calls to the uctoo-backend server. Return the raw API response directly to the client without modification.\n\n" +
            "Available tools:\n" +
            "- processNaturalLanguageRequestDirect: Process natural language requests directly to backend API\n" +
            "- getMcpServiceById: Get MCP service details by ID\n" +
            "- listApiMappings: List all API mappings")
}

// Main entry point
main(): Unit {
    // Setup configuration
    // Create an instance of the MCP adapter agent
    let agent = UctooMCPAdapterAgent()

    // Start MCP server for direct MCP protocol access
    StdioMCPServer.startWith([agent])
}