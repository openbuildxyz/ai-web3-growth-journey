/*
 * Copyright (c) 2025. All rights reserved.
 */
package magic.examples.uctoo_api_skill.src.models

import std.collection.HashMap

/**
 * Model representing an API request
 */
public class ApiRequest {
    public var method: String;
    public var url: String;
    public var headers: HashMap<String, String>;
    public var queryParams: HashMap<String, String>;
    public var body: Option<String>;
    public var timeout: Int32;
    
    public init(method: String, url: String) {
        this.method = method
        this.url = url
        this.headers = HashMap<String, String>()
        this.queryParams = HashMap<String, String>()
        this.body = None
        this.timeout = 10000  // Default 10 second timeout
    }
    
    /**
     * Add a header to the request
     */
    public func addHeader(key: String, value: String): ApiRequest {
        this.headers.add(key, value)
        return this
    }

    /**
     * Add a query parameter to the request
     */
    public func addQueryParam(key: String, value: String): ApiRequest {
        this.queryParams.add(key, value)
        return this
    }
    
    /**
     * Set the request body
     */
    public func setBody(body: String): ApiRequest {
        this.body = Some(body)
        return this
    }
    
    /**
     * Set the timeout for the request
     */
    public func setTimeout(timeout: Int32): ApiRequest {
        this.timeout = timeout
        return this
    }
    
    /**
     * Build the final URL with query parameters
     */
    public func buildUrl(): String {
        if (queryParams.isEmpty()) {
            return url
        }
        
        var result = url
        if (!url.contains("?")) {
            result += "?"
        } else if (!url.endsWith("&")) {
            result += "&"
        }
        
        var first = true
        for ((key, value) in queryParams) {
            if (!first) {
                result = result + "&"
            }
            result = result + "${key}=${value}"
            first = false
        }
        
        return result
    }
}