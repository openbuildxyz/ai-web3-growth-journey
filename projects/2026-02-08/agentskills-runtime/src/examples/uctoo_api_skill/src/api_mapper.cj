/*
 * Copyright (c) 2025. All rights reserved.
 */
package magic.examples.uctoo_api_skill.src

import std.collection.HashMap


/**
 * API Mapper for UCToo API Skills
 * Handles mapping of natural language intents to specific API endpoints
 * and manages parameter transformations between natural language and API formats
 */
public class ApiMapper {
    private var endpointMap: HashMap<String, String>;
    private var parameterMap: HashMap<String, String>;
    private var intentPatternMap: HashMap<String, Array<String>>;
    
    public init() {
        // Initialize all maps first
        endpointMap = HashMap<String, String>()
        parameterMap = HashMap<String, String>()
        intentPatternMap = HashMap<String, Array<String>>()

        // Then initialize the mappings
        initializeEndpointMappings()
        initializeParameterMappings()
        initializeIntentPatternMappings()
    }
    
    /**
     * Initialize the default endpoint mappings
     */
    private func initializeEndpointMappings(): Unit {
        // Standard CRUD operations (compliant with uctooAPI design specification)
        // According to spec: multi-item queries use /api/uctoo/user/:limit/:page (GET)
        endpointMap.add("GET_ALL_USERS", "/api/uctoo/user/10/0")
        // According to spec: single item query uses /api/uctoo/user/{id} (GET)
        endpointMap.add("GET_USER_BY_ID", "/api/uctoo/user/{id}")
        // According to spec: create uses /api/uctoo/user/add (POST)
        endpointMap.add("CREATE_USER", "/api/uctoo/user/add")
        // According to spec: update uses /api/uctoo/user/edit (POST)
        endpointMap.add("UPDATE_USER", "/api/uctoo/user/edit")
        // According to spec: delete uses /api/uctoo/user/del (POST)
        endpointMap.add("DELETE_USER", "/api/uctoo/user/del")

        // According to spec: multi-item queries use /api/uctoo/product/:limit/:page (GET)
        endpointMap.add("GET_ALL_PRODUCTS", "/api/uctoo/product/10/0")
        // According to spec: single item query uses /api/uctoo/product/{id} (GET)
        endpointMap.add("GET_PRODUCT_BY_ID", "/api/uctoo/product/{id}")
        // According to spec: create uses /api/uctoo/product/add (POST)
        endpointMap.add("CREATE_PRODUCT", "/api/uctoo/product/add")
        // According to spec: update uses /api/uctoo/product/edit (POST)
        endpointMap.add("UPDATE_PRODUCT", "/api/uctoo/product/edit")
        // According to spec: delete uses /api/uctoo/product/del (POST)
        endpointMap.add("DELETE_PRODUCT", "/api/uctoo/product/del")

        // According to spec: multi-item queries use /api/uctoo/order/:limit/:page (GET)
        endpointMap.add("GET_ALL_ORDERS", "/api/uctoo/order/10/0")
        // According to spec: single item query uses /api/uctoo/order/{id} (GET)
        endpointMap.add("GET_ORDER_BY_ID", "/api/uctoo/order/{id}")
        // According to spec: create uses /api/uctoo/order/add (POST)
        endpointMap.add("CREATE_ORDER", "/api/uctoo/order/add")
        // According to spec: update uses /api/uctoo/order/edit (POST)
        endpointMap.add("UPDATE_ORDER", "/api/uctoo/order/edit")
        // According to spec: delete uses /api/uctoo/order/del (POST)
        endpointMap.add("DELETE_ORDER", "/api/uctoo/order/del")

        // Entity CRUD operations (compliant with uctooAPI design specification)
        // According to spec: multi-item queries use /api/uctoo/entity/:limit/:page (GET)
        endpointMap.add("GET_ALL_ENTITIES", "/api/uctoo/entity/{limit}/{page}")
        // According to spec: single item query uses /api/uctoo/entity/{id} (GET)
        endpointMap.add("GET_ENTITY_BY_ID", "/api/uctoo/entity/{id}")
        // According to spec: create uses /api/uctoo/entity/add (POST)
        endpointMap.add("CREATE_ENTITY", "/api/uctoo/entity/add")
        // According to spec: update uses /api/uctoo/entity/edit (POST)
        endpointMap.add("UPDATE_ENTITY", "/api/uctoo/entity/edit")
        // According to spec: delete uses /api/uctoo/entity/del (POST)
        endpointMap.add("DELETE_ENTITY", "/api/uctoo/entity/del")

        // Generic mappings (compliant with uctooAPI design specification)
        // According to spec: multi-item queries use /api/uctoo/generic/:limit/:page (GET)
        endpointMap.add("GET_ALL", "/api/uctoo/generic/10/0")
        // According to spec: single item query uses /api/uctoo/generic/{id} (GET)
        endpointMap.add("GET_BY_ID", "/api/uctoo/generic/{id}")
        // According to spec: create uses /api/uctoo/generic/add (POST)
        endpointMap.add("CREATE", "/api/uctoo/generic/add")
        // According to spec: update uses /api/uctoo/generic/edit (POST)
        endpointMap.add("UPDATE", "/api/uctoo/generic/edit")
        // According to spec: delete uses /api/uctoo/generic/del (POST)
        endpointMap.add("DELETE", "/api/uctoo/generic/del")

        // Authentication endpoints (compliant with uctooAPI design specification)
        endpointMap.add("LOGIN", "/api/uctoo/auth/login")
        endpointMap.add("REGISTER", "/api/uctoo/auth/register")
        endpointMap.add("LOGOUT", "/api/uctoo/auth/logout")

        // Non-standard endpoints (compliant with uctooAPI design specification)
        endpointMap.add("HELLO", "/hello")
        endpointMap.add("TEST_CONNECTION", "/hello")
        endpointMap.add("GET_HELLO", "/hello")
        endpointMap.add("CALL_HELLO", "/hello")

        // Additional uctoo backend endpoints (compliant with uctooAPI design specification)
        // According to spec: multi-item queries use /api/uctoo/attachments/:limit/:page (GET)
        endpointMap.add("GET_ALL_ATTACHMENTS", "/api/uctoo/attachments/10/0")
        // According to spec: single item query uses /api/uctoo/attachments/{id} (GET)
        endpointMap.add("GET_ATTACHMENT_BY_ID", "/api/uctoo/attachments/{id}")
        // According to spec: create uses /api/uctoo/attachments/add (POST)
        endpointMap.add("CREATE_ATTACHMENT", "/api/uctoo/attachments/add")
        // According to spec: update uses /api/uctoo/attachments/edit (POST)
        endpointMap.add("UPDATE_ATTACHMENT", "/api/uctoo/attachments/edit")
        // According to spec: delete uses /api/uctoo/attachments/del (POST)
        endpointMap.add("DELETE_ATTACHMENT", "/api/uctoo/attachments/del")

        // According to spec: multi-item queries use /api/uctoo/cms_articles/:limit/:page (GET)
        endpointMap.add("GET_ALL_CMS_ARTICLES", "/api/uctoo/cms_articles/10/0")
        // According to spec: single item query uses /api/uctoo/cms_articles/{id} (GET)
        endpointMap.add("GET_CMS_ARTICLE_BY_ID", "/api/uctoo/cms_articles/{id}")
        // According to spec: create uses /api/uctoo/cms_articles/add (POST)
        endpointMap.add("CREATE_CMS_ARTICLE", "/api/uctoo/cms_articles/add")
        // According to spec: update uses /api/uctoo/cms_articles/edit (POST)
        endpointMap.add("UPDATE_CMS_ARTICLE", "/api/uctoo/cms_articles/edit")
        // According to spec: delete uses /api/uctoo/cms_articles/del (POST)
        endpointMap.add("DELETE_CMS_ARTICLE", "/api/uctoo/cms_articles/del")

        // According to spec: multi-item queries use /api/uctoo/uctoo_user/:limit/:page (GET)
        endpointMap.add("GET_ALL_UCTOO_USERS", "/api/uctoo/uctoo_user/10/0")
        // According to spec: single item query uses /api/uctoo/uctoo_user/{id} (GET)
        endpointMap.add("GET_UCTOO_USER_BY_ID", "/api/uctoo/uctoo_user/{id}")
        // According to spec: create uses /api/uctoo/uctoo_user/add (POST)
        endpointMap.add("CREATE_UCTOO_USER", "/api/uctoo/uctoo_user/add")
        // According to spec: update uses /api/uctoo/uctoo_user/edit (POST)
        endpointMap.add("UPDATE_UCTOO_USER", "/api/uctoo/uctoo_user/edit")
        // According to spec: delete uses /api/uctoo/uctoo_user/del (POST)
        endpointMap.add("DELETE_UCTOO_USER", "/api/uctoo/uctoo_user/del")
    }
    
    /**
     * Initialize the default parameter mappings
     */
    private func initializeParameterMappings(): Unit {
        parameterMap.add("name", "name")
        parameterMap.add("email", "email")
        parameterMap.add("phone", "phone_number")
        parameterMap.add("title", "title")
        parameterMap.add("description", "description")
        parameterMap.add("status", "status")
        parameterMap.add("id", "id")
        parameterMap.add("user_id", "user_id")
        parameterMap.add("product_id", "product_id")
        parameterMap.add("order_id", "order_id")
        parameterMap.add("username", "username")
        parameterMap.add("password", "password")
        parameterMap.add("account", "username")
        parameterMap.add("phone_number", "phone")
    }
    
    /**
     * Initialize intent pattern mappings to help identify entity types
     */
    private func initializeIntentPatternMappings(): Unit {
        // Patterns that suggest a USER entity
        intentPatternMap.add("USER", ["user", "person", "member", "profile", "account", "customer"])

        // Patterns that suggest a PRODUCT entity
        intentPatternMap.add("PRODUCT", ["product", "item", "goods", "merchandise", "catalog", "inventory"])

        // Patterns that suggest an ORDER entity
        intentPatternMap.add("ORDER", ["order", "purchase", "transaction", "sale", "buy", "cart"])

        // General patterns
        intentPatternMap.add("ENTITY", ["entity", "record", "entry", "data", "information"])
    }
    
    /**
     * Map a natural language request to an API endpoint
     */
    public func mapNaturalLanguageToEndpoint(nlpProcessor: NaturalLanguageProcessor, request: String): (String, String, HashMap<String, String>) {
        Utils.logMessage("DEBUG", "Mapping natural language request to API endpoint: " + request);
        
        // Process the request to extract intent and parameters
        let nlpResult = nlpProcessor.processRequest(request)
        
        // Extract intent from the NLP result
        let intent = if (let Some(intentValue) <- nlpResult.get("intent")) {
            intentValue
        } else {
            "UNKNOWN"
        }
        
        Utils.logMessage("DEBUG", "Extracted intent: " + intent);
        
        // Identify the entity type based on patterns in the request
        let entityType = identifyEntityType(request)
        Utils.logMessage("DEBUG", "Identified entity type: " + entityType);
        
        // Get the base endpoint for this intent and entity type
        let baseEndpoint = mapIntentToEndpoint(intent, entityType: entityType)
        Utils.logMessage("DEBUG", "Mapped to base endpoint: " + baseEndpoint);
        
        // Transform the parameters from NLP format to API format
        let apiParams = transformParameters(nlpResult)
        let sizeVal = apiParams.size;
let countStr = sizeVal.toString();
Utils.logMessage("DEBUG", "Transformed parameters. Count: " + countStr);
        
        // Resolve any placeholders in the endpoint with actual parameter values
        let finalEndpoint = resolveEndpointPlaceholders(baseEndpoint, apiParams)
        Utils.logMessage("DEBUG", "Resolved final endpoint: " + finalEndpoint);
        
        // Determine the appropriate HTTP method for this intent
        let httpMethod = getHttpMethodForIntent(intent)
        Utils.logMessage("DEBUG", "Determined HTTP method: " + httpMethod);
        
        return (finalEndpoint, httpMethod, apiParams)
    }
    
    /**
     * Map a natural language intent to an API endpoint
     */
    public func mapIntentToEndpoint(intent: String, entityType!: String = "entity"): String {
        // First, check for special non-standard endpoints like hello
        let lowerIntent = intent.toAsciiLower()
        if (lowerIntent.contains("hello") || lowerIntent.contains("问候") || lowerIntent.contains("测试") ||
            lowerIntent.contains("连接") || lowerIntent.contains("test")) {
            if (let Some(endpoint) <- endpointMap.get("HELLO")) {
                return endpoint
            } else if (let Some(endpoint) <- endpointMap.get("TEST_CONNECTION")) {
                return endpoint
            } else if (let Some(endpoint) <- endpointMap.get("GET_HELLO")) {
                return endpoint
            } else if (let Some(endpoint) <- endpointMap.get("CALL_HELLO")) {
                return endpoint
            }
        }

        // Create a specific intent key based on entity type
        let specificIntent = "${intent}_${entityType.toAsciiUpper()}"

        // Try to find a specific mapping first
        if (let Some(endpoint) <- endpointMap.get(specificIntent)) {
            return endpoint
        }

        // Also try with common variations
        if (let Some(endpoint) <- endpointMap.get("${intent}_${entityType.toAsciiUpper()}S")) {
            return endpoint  // Handle plural form
        }

        // Special handling for standard CRUD operations - map generic intent names to specific ones
        // For example: map "CREATE_RESOURCE" to "CREATE_ENTITY" when entityType is "entity"
        let normalizedIntent = normalizeIntentForEntity(intent, entityType)
        let normalizedSpecificIntent = "${normalizedIntent}_${entityType.toAsciiUpper()}"

        if (let Some(endpoint) <- endpointMap.get(normalizedSpecificIntent)) {
            return endpoint
        }

        // Handle special non-standard endpoint intents like HELLO_ENDPOINT
        if (intent == "HELLO_ENDPOINT") {
            if (let Some(endpoint) <- endpointMap.get("HELLO")) {
                return endpoint
            } else if (let Some(endpoint) <- endpointMap.get("TEST_CONNECTION")) {
                return endpoint
            } else if (let Some(endpoint) <- endpointMap.get("GET_HELLO")) {
                return endpoint
            } else if (let Some(endpoint) <- endpointMap.get("CALL_HELLO")) {
                return endpoint
            }
        }

        // Fall back to generic mapping
        let genericIntent = intent
        if (let Some(endpoint) <- endpointMap.get(genericIntent)) {
            return endpoint
        }

        // Default fallback
        return "/api/${entityType}"
    }

    /**
     * Normalize generic intent names to specific ones for entity operations
     */
    private func normalizeIntentForEntity(intent: String, entityType: String): String {
        let entityTypeUpper = entityType.toAsciiUpper()
        let intentUpper = intent.toAsciiUpper()

        // Map generic intent names to specific ones
        if (intentUpper == "CREATE_RESOURCE") {
            return "CREATE_" + entityTypeUpper
        } else if (intentUpper == "GET_RESOURCE") {
            // Check if we're looking for a specific entity by ID
            // This would be determined by whether there are ID parameters in the context
            // For now, we'll use a simple heuristic based on common patterns in the intent
            // But in a more sophisticated implementation, we'd check the actual parameters
            return "GET_" + entityTypeUpper + "_BY_ID"  // Default to by ID for single resource
        } else if (intentUpper == "GET_ALL_RESOURCES") {
            if (entityTypeUpper == "ENTITY") {
                return "GET_ALL_" + entityTypeUpper + "S"  // Plural form for getting all
            } else {
                return "GET_ALL_" + entityTypeUpper + "S"  // Plural form for getting all
            }
        } else if (intentUpper == "UPDATE_RESOURCE") {
            return "UPDATE_" + entityTypeUpper
        } else if (intentUpper == "DELETE_RESOURCE") {
            return "DELETE_" + entityTypeUpper
        }

        // Return the original intent if no normalization is needed
        return intent
    }
    
    /**
     * Identify the entity type from a natural language request
     */
    public func identifyEntityType(request: String): String {
        Utils.logMessage("DEBUG", "Identifying entity type for request: " + request);
        
        let lowerRequest = request.toAsciiLower()
        
        // Check each entity type's patterns
        for ((entityType, patterns) in intentPatternMap.iterator()) {
            for (pattern in patterns) {
                if (lowerRequest.contains(pattern)) {
                    let result = entityType.toAsciiLower()
                    Utils.logMessage("DEBUG", "Identified entity type: " + result + " based on pattern: " + pattern);
                    return result
                }
            }
        }
        
        // Default to 'entity' if no specific type is identified
        Utils.logMessage("DEBUG", "No specific entity type identified, defaulting to 'entity'");
        return "entity"
    }
    
    /**
     * Transform parameters from natural language format to API format
     */
    public func transformParameters(nlpParams: HashMap<String, String>): HashMap<String, String> {
        let inputSizeVal = nlpParams.size;
let inputCountStr = inputSizeVal.toString();
Utils.logMessage("DEBUG", "Transforming parameters from NLP format to API format. Input parameters count: " + inputCountStr);
        
        let apiParams = HashMap<String, String>()
        
        for ((nlpKey, value) in nlpParams.iterator()) {
            // Skip the 'intent' key as it's not a parameter
            if (nlpKey == "intent") {
                Utils.logMessage("DEBUG", "Skipping 'intent' key: " + value);
                continue
            }
            
            // Look up the API parameter name for this NLP parameter
            let apiKeyOpt = parameterMap.get(nlpKey)
            match (apiKeyOpt) {
                case Some(apiKey) => apiParams.add(apiKey, value)
                case None => apiParams.add(nlpKey, value)
            }
        }
        
        let outputSizeVal = apiParams.size;
let outputCountStr = outputSizeVal.toString();
Utils.logMessage("DEBUG", "Parameter transformation completed. Output parameters count: " + outputCountStr);
        
        return apiParams
    }
    
    /**
     * Get HTTP method for a given intent
     * According to uctooAPI design specification, only GET and POST methods are used
     */
    public func getHttpMethodForIntent(intent: String): String {
        match (intent.toAsciiUpper()) {
            case "GET" | "GET_ALL" | "GET_BY_ID" | "FIND" | "RETRIEVE" | "SHOW" | "LIST" | "FETCH" | "OBTAIN" | "ACQUIRE" => "GET"
            case "CREATE" | "ADD" | "NEW" | "MAKE" | "GENERATE" | "BUILD" | "ESTABLISH" | "FORM" | "REGISTER" => "POST"
            // According to uctooAPI design specification, UPDATE/EDIT operations use POST method
            case "UPDATE" | "MODIFY" | "CHANGE" | "EDIT" | "ALTER" | "ADJUST" | "REVISE" | "UPGRADE" => "POST"
            // According to uctooAPI design specification, DELETE operations use POST method
            case "DELETE" | "REMOVE" | "DESTROY" | "ELIMINATE" | "ERASE" | "CANCEL" | "DROP" | "CLEAR" => "POST"
            case "LOGIN" | "AUTHENTICATE" | "SIGN_IN" => "POST"
            case "LOGOUT" | "SIGN_OUT" => "POST"
            case _ => "GET"  // Default method
        }
    }
    
    /**
     * Resolve endpoint placeholders with actual values
     */
    public func resolveEndpointPlaceholders(endpoint: String, params: HashMap<String, String>): String {
        Utils.logMessage("DEBUG", "Resolving endpoint placeholders for: " + endpoint);
        
        var resolvedEndpoint = endpoint
        
        // Replace {id} placeholder with actual ID if available
        if (let Some(id) <- params.get("id")) {
            resolvedEndpoint = resolvedEndpoint.replace("{id}", id)
            Utils.logMessage("DEBUG", "Replaced {id} placeholder with: " + id);
        }
        
        // Replace other common placeholders
        if (let Some(userId) <- params.get("user_id")) {
            resolvedEndpoint = resolvedEndpoint.replace("{user_id}", userId)
            Utils.logMessage("DEBUG", "Replaced {user_id} placeholder with: " + userId);
        }
        
        if (let Some(productId) <- params.get("product_id")) {
            resolvedEndpoint = resolvedEndpoint.replace("{product_id}", productId)
            Utils.logMessage("DEBUG", "Replaced {product_id} placeholder with: " + productId);
        }
        
        if (let Some(orderId) <- params.get("order_id")) {
            resolvedEndpoint = resolvedEndpoint.replace("{order_id}", orderId)
            Utils.logMessage("DEBUG", "Replaced {order_id} placeholder with: " + orderId);
        }
        
        if (let Some(username) <- params.get("username")) {
            resolvedEndpoint = resolvedEndpoint.replace("{username}", username)
            Utils.logMessage("DEBUG", "Replaced {username} placeholder with: " + username);
        }

        // Replace pagination placeholders
        if (let Some(limit) <- params.get("limit")) {
            resolvedEndpoint = resolvedEndpoint.replace("{limit}", limit)
            Utils.logMessage("DEBUG", "Replaced {limit} placeholder with: " + limit);
        }

        if (let Some(page) <- params.get("page")) {
            resolvedEndpoint = resolvedEndpoint.replace("{page}", page)
            Utils.logMessage("DEBUG", "Replaced {page} placeholder with: " + page);
        }

        if (let Some(skip) <- params.get("skip")) {
            resolvedEndpoint = resolvedEndpoint.replace("{skip}", skip)
            Utils.logMessage("DEBUG", "Replaced {skip} placeholder with: " + skip);
        }

        Utils.logMessage("DEBUG", "Final resolved endpoint: " + resolvedEndpoint);

        return resolvedEndpoint
    }
    
    /**
     * Add a custom endpoint mapping
     */
    public func addEndpointMapping(intent: String, endpoint: String): Unit {
        endpointMap.add(intent, endpoint)
    }

    /**
     * Add a custom parameter mapping
     */
    public func addParameterMapping(nlpParam: String, apiParam: String): Unit {
        parameterMap.add(nlpParam, apiParam)
    }

    /**
     * Add a custom intent pattern for entity identification
     */
    public func addIntentPattern(entityType: String, patterns: Array<String>): Unit {
        intentPatternMap.add(entityType, patterns)
    }
}