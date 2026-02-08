/*
 * Hardcoded login test for UCToo API MCP Server
 * This file implements a direct login call with hardcoded credentials for testing
 */

package magic.examples.uctoo_api_mcp_server

import std.collection.HashMap
import std.time.DateTime
import stdx.net.http.*
import stdx.net.tls.*
import stdx.encoding.url.URL
import std.time.*
import std.net.{SocketAddress, TcpSocket}
import std.io.*
import magic.examples.uctoo_api_mcp_server.src.Utils

// Simple function to test hardcoded login
func testHardcodedLogin(): String {
    let username = "demo"
    let password = "123456"
    
    Utils.logMessage("DEBUG", "Testing hardcoded login with username: " + username + " and password: " + password)
    
    // Use the same backend URL as configured in http_client - from UctooConfig
    let config = UctooConfig()
    let baseUrl = config.backendUrl  // Use the configured backend URL
    let loginUrl = baseUrl + "/api/uctoo/auth/login"

    Utils.logMessage("DEBUG", "Making direct login call to: " + loginUrl + " with username: " + username)

    // Create HTTP client with proper TLS configuration for HTTPS
    let client = buildHttpClient(loginUrl, true)

    // Prepare login payload - same format as http_client
    let payload = "{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}"

    // Create POST request with proper headers as used in http_client
    let request = HttpRequestBuilder()
        .url(loginUrl)
        .post()
        .body(payload)
        .header("Content-Type", "application/json")
        .header("User-Agent", "UCToo-MCP-Client/1.0")
        .header("Accept", "application/json")
        .build()

    let response = client.send(request)
    Utils.logMessage("DEBUG", "Received response from login API with status: " + response.status.toString())
    
    // Read the response body
    let buffer = Array<Byte>(4096, { _ => 0 })
    var result = ""
    var length: Int64 = 0
    try {
        // Read the response body in chunks
        while (true) {
            length = response.body.read(buffer)
            if (length <= 0) {
                break
            }
            result = result + String.fromUtf8(buffer[..length])
        }
    } catch (ex: Exception) {
        // If there's an error reading the body, return an empty string
        Utils.logMessage("ERROR", "Error reading response body: " + ex.message)
        result = ""
    }

    // Log the exact response received from the backend for debugging
    Utils.logMessage("DEBUG", "Exact login API response body: " + result)
    Utils.logMessage("DEBUG", "Response body starts with '{': " + result.startsWith("{").toString())
    Utils.logMessage("DEBUG", "Response body contains 'access_token': " + result.contains("access_token").toString())
    Utils.logMessage("DEBUG", "Response body contains 'refresh_token': " + result.contains("refresh_token").toString())

    // Extract and log the access_token separately for verification using the common utility method
    let extractedToken2 = Utils.extractTokenFromResponse(result)
    if (!extractedToken2.isEmpty()) {
        Utils.logMessage("DEBUG", "ACCESS_TOKEN_EXTRACTED_DIRECTLY: " + extractedToken2)
    } else {
        Utils.logMessage("ERROR", "Failed to extract access token using common utility method")
    }

    // Close the client
    client.close()

    // Return just the raw JSON response body as received from the backend
    return result
}

// Helper function to build HTTP client with proper TLS configuration for HTTPS
private func buildHttpClient(url: String, verify: Bool): Client {
    let cb = ClientBuilder()
    cb.readTimeout(Duration.minute * 10)
    if (url.startsWith("https://")) {
        var config = TlsClientConfig()
        if (!verify) {
            config.verifyMode = TrustAll
        } else {
            // For production environments, we might need to handle custom certificates
            config.verifyMode = TrustAll  // Temporarily set to TrustAll to bypass certificate issues in test environment
        }
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

// Main function to run the test
main() {
    let result = testHardcodedLogin()
    println("Hardcoded login test result: " + result)
}