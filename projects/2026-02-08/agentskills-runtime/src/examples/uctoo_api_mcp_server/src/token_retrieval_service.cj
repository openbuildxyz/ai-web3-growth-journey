/*
 * Copyright (c) 2024-2025. UCToo Team. All rights reserved.
 *
 * Service for retrieving access tokens using http_client when direct login fails
 */

package magic.examples.uctoo_api_mcp_server.src

import stdx.net.http.*
import stdx.net.tls.*
import stdx.encoding.json.*
import stdx.encoding.url.URL
import std.time.*
import std.net.{SocketAddress, TcpSocket}
import magic.core.*
import std.io.*
import std.io.StringReader
import std.process.*

// Service for retrieving access tokens using http_client when direct login fails
class TokenRetrievalService {
    
    // Retrieve access token using the http_client approach as fallback
    func retrieveTokenViaHttp(username: String, password: String): String {
        try {
            // Use the same approach as http_client to ensure compatibility
            let config = UctooConfig()
            let baseUrl = config.backendUrl
            let loginUrl = baseUrl + "/api/uctoo/auth/login"

            Utils.logMessage("DEBUG", "Attempting to retrieve token via direct HTTP call to: " + loginUrl)

            // Create HTTP client with proper TLS configuration for HTTPS
            let client = buildHttpClient(loginUrl)

            // Prepare login payload
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

            // Close the client
            client.close()

            // Log the response for debugging
            Utils.logMessage("DEBUG", "HTTP client login response: " + result)
            
            // Check if the response contains an access token
            if (!result.isEmpty() && result.startsWith("{") && 
                (result.contains("access_token") || result.contains("refresh_token") || result.contains("user"))) {
                Utils.logMessage("DEBUG", "Successfully retrieved token via HTTP client approach")
                return result
            } else {
                Utils.logMessage("ERROR", "Failed to retrieve token via HTTP client approach, response: " + result)
                return ""
            }
        } catch (ex: Exception) {
            Utils.logMessage("ERROR", "Exception in HTTP client token retrieval: " + ex.message)
            return ""
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
    
    // Alternative method: Execute http_client as a subprocess to get the token
    func retrieveTokenViaHttpclientSubprocess(username: String, password: String): String {
        try {
            Utils.logMessage("DEBUG", "Attempting to retrieve token via http_client subprocess")
            
            // This would execute the http_client as a subprocess and parse its output
            // For now, we'll implement the direct HTTP approach which should be equivalent
            return retrieveTokenViaHttp(username, password)
        } catch (ex: Exception) {
            Utils.logMessage("ERROR", "Exception in subprocess token retrieval: " + ex.message)
            return ""
        }
    }
}