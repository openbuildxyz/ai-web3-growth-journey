module.exports = [
"[project]/typescript/packages/core/dist/esm/chunk-VE37GDG2.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/index.ts
__turbopack_context__.s([
    "x402Version",
    ()=>x402Version
]);
var x402Version = 2;
;
 //# sourceMappingURL=chunk-VE37GDG2.mjs.map
}),
"[project]/typescript/packages/core/dist/esm/chunk-3IUBYRYG.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/utils/index.ts
__turbopack_context__.s([
    "Base64EncodedRegex",
    ()=>Base64EncodedRegex,
    "deepEqual",
    ()=>deepEqual,
    "findByNetworkAndScheme",
    ()=>findByNetworkAndScheme,
    "findFacilitatorBySchemeAndNetwork",
    ()=>findFacilitatorBySchemeAndNetwork,
    "findSchemesByNetwork",
    ()=>findSchemesByNetwork,
    "safeBase64Decode",
    ()=>safeBase64Decode,
    "safeBase64Encode",
    ()=>safeBase64Encode
]);
var findSchemesByNetwork = (map, network)=>{
    let implementationsByScheme = map.get(network);
    if (!implementationsByScheme) {
        for (const [registeredNetworkPattern, implementations] of map.entries()){
            const pattern = registeredNetworkPattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\*/g, ".*");
            const regex = new RegExp(`^${pattern}$`);
            if (regex.test(network)) {
                implementationsByScheme = implementations;
                break;
            }
        }
    }
    return implementationsByScheme;
};
var findByNetworkAndScheme = (map, scheme, network)=>{
    return findSchemesByNetwork(map, network)?.get(scheme);
};
var findFacilitatorBySchemeAndNetwork = (schemeMap, scheme, network)=>{
    const schemeData = schemeMap.get(scheme);
    if (!schemeData) return void 0;
    if (schemeData.networks.has(network)) {
        return schemeData.facilitator;
    }
    const patternRegex = new RegExp("^" + schemeData.pattern.replace("*", ".*") + "$");
    if (patternRegex.test(network)) {
        return schemeData.facilitator;
    }
    return void 0;
};
var Base64EncodedRegex = /^[A-Za-z0-9+/]*={0,2}$/;
function safeBase64Encode(data) {
    if (typeof globalThis !== "undefined" && typeof globalThis.btoa === "function") {
        return globalThis.btoa(data);
    }
    return Buffer.from(data).toString("base64");
}
function safeBase64Decode(data) {
    if (typeof globalThis !== "undefined" && typeof globalThis.atob === "function") {
        return globalThis.atob(data);
    }
    return Buffer.from(data, "base64").toString("utf-8");
}
function deepEqual(obj1, obj2) {
    const normalize = (obj)=>{
        if (obj === null || obj === void 0) return JSON.stringify(obj);
        if (typeof obj !== "object") return JSON.stringify(obj);
        if (Array.isArray(obj)) {
            return JSON.stringify(obj.map((item)=>typeof item === "object" && item !== null ? JSON.parse(normalize(item)) : item));
        }
        const sorted = {};
        Object.keys(obj).sort().forEach((key)=>{
            const value = obj[key];
            sorted[key] = typeof value === "object" && value !== null ? JSON.parse(normalize(value)) : value;
        });
        return JSON.stringify(sorted);
    };
    try {
        return normalize(obj1) === normalize(obj2);
    } catch  {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    }
}
;
 //# sourceMappingURL=chunk-3IUBYRYG.mjs.map
}),
"[project]/typescript/packages/core/dist/esm/chunk-BJTO5JO5.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__require",
    ()=>__require
]);
var __require = /* @__PURE__ */ ((x)=>("TURBOPACK compile-time truthy", 1) ? /*TURBOPACK member replacement*/ __turbopack_context__.z : "TURBOPACK unreachable")(function(x) {
    if ("TURBOPACK compile-time truthy", 1) return /*TURBOPACK member replacement*/ __turbopack_context__.z.apply(this, arguments);
    //TURBOPACK unreachable
    ;
});
;
 //# sourceMappingURL=chunk-BJTO5JO5.mjs.map
}),
"[project]/typescript/packages/core/dist/esm/chunk-RCHDDVGC.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HTTPFacilitatorClient",
    ()=>HTTPFacilitatorClient,
    "RouteConfigurationError",
    ()=>RouteConfigurationError,
    "decodePaymentRequiredHeader",
    ()=>decodePaymentRequiredHeader,
    "decodePaymentResponseHeader",
    ()=>decodePaymentResponseHeader,
    "decodePaymentSignatureHeader",
    ()=>decodePaymentSignatureHeader,
    "encodePaymentRequiredHeader",
    ()=>encodePaymentRequiredHeader,
    "encodePaymentResponseHeader",
    ()=>encodePaymentResponseHeader,
    "encodePaymentSignatureHeader",
    ()=>encodePaymentSignatureHeader,
    "x402HTTPClient",
    ()=>x402HTTPClient,
    "x402HTTPResourceServer",
    ()=>x402HTTPResourceServer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$VE37GDG2$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/typescript/packages/core/dist/esm/chunk-VE37GDG2.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$3IUBYRYG$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/typescript/packages/core/dist/esm/chunk-3IUBYRYG.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$BJTO5JO5$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/typescript/packages/core/dist/esm/chunk-BJTO5JO5.mjs [app-route] (ecmascript)");
;
;
;
// src/http/x402HTTPResourceServer.ts
var RouteConfigurationError = class extends Error {
    /**
   * Creates a new RouteConfigurationError with the given validation errors.
   *
   * @param errors - The validation errors that caused this exception.
   */ constructor(errors){
        const message = `x402 Route Configuration Errors:
${errors.map((e)=>`  - ${e.message}`).join("\n")}`;
        super(message);
        this.name = "RouteConfigurationError";
        this.errors = errors;
    }
};
var x402HTTPResourceServer = class {
    /**
   * Creates a new x402HTTPResourceServer instance.
   *
   * @param ResourceServer - The core x402ResourceServer instance to use
   * @param routes - Route configuration for payment-protected endpoints
   */ constructor(ResourceServer, routes){
        this.compiledRoutes = [];
        this.ResourceServer = ResourceServer;
        this.routesConfig = routes;
        const normalizedRoutes = typeof routes === "object" && !("accepts" in routes) ? routes : {
            "*": routes
        };
        for (const [pattern, config] of Object.entries(normalizedRoutes)){
            const parsed = this.parseRoutePattern(pattern);
            this.compiledRoutes.push({
                verb: parsed.verb,
                regex: parsed.regex,
                config
            });
        }
    }
    /**
   * Initialize the HTTP resource server.
   *
   * This method initializes the underlying resource server (fetching facilitator support)
   * and then validates that all route payment configurations have corresponding
   * registered schemes and facilitator support.
   *
   * @throws RouteConfigurationError if any route's payment options don't have
   *         corresponding registered schemes or facilitator support
   *
   * @example
   * ```typescript
   * const httpServer = new x402HTTPResourceServer(server, routes);
   * await httpServer.initialize();
   * ```
   */ async initialize() {
        await this.ResourceServer.initialize();
        const errors = this.validateRouteConfiguration();
        if (errors.length > 0) {
            throw new RouteConfigurationError(errors);
        }
    }
    /**
   * Register a custom paywall provider for generating HTML
   *
   * @param provider - PaywallProvider instance
   * @returns This service instance for chaining
   */ registerPaywallProvider(provider) {
        this.paywallProvider = provider;
        return this;
    }
    /**
   * Process HTTP request and return response instructions
   * This is the main entry point for framework middleware
   *
   * @param context - HTTP request context
   * @param paywallConfig - Optional paywall configuration
   * @returns Process result indicating next action for middleware
   */ async processHTTPRequest(context, paywallConfig) {
        const { adapter, path, method } = context;
        const routeConfig = this.getRouteConfig(path, method);
        if (!routeConfig) {
            return {
                type: "no-payment-required"
            };
        }
        const paymentOptions = this.normalizePaymentOptions(routeConfig);
        const paymentPayload = this.extractPayment(adapter);
        const resourceInfo = {
            url: routeConfig.resource || context.adapter.getUrl(),
            description: routeConfig.description || "",
            mimeType: routeConfig.mimeType || ""
        };
        const requirements = await this.ResourceServer.buildPaymentRequirementsFromOptions(paymentOptions, context);
        let extensions = routeConfig.extensions;
        if (extensions) {
            extensions = this.ResourceServer.enrichExtensions(extensions, context);
        }
        const paymentRequired = this.ResourceServer.createPaymentRequiredResponse(requirements, resourceInfo, !paymentPayload ? "Payment required" : void 0, extensions);
        if (!paymentPayload) {
            const unpaidBody = routeConfig.unpaidResponseBody ? await routeConfig.unpaidResponseBody(context) : void 0;
            return {
                type: "payment-error",
                response: this.createHTTPResponse(paymentRequired, this.isWebBrowser(adapter), paywallConfig, routeConfig.customPaywallHtml, unpaidBody)
            };
        }
        try {
            const matchingRequirements = this.ResourceServer.findMatchingRequirements(paymentRequired.accepts, paymentPayload);
            if (!matchingRequirements) {
                const errorResponse = this.ResourceServer.createPaymentRequiredResponse(requirements, resourceInfo, "No matching payment requirements", routeConfig.extensions);
                return {
                    type: "payment-error",
                    response: this.createHTTPResponse(errorResponse, false, paywallConfig)
                };
            }
            const verifyResult = await this.ResourceServer.verifyPayment(paymentPayload, matchingRequirements);
            if (!verifyResult.isValid) {
                const errorResponse = this.ResourceServer.createPaymentRequiredResponse(requirements, resourceInfo, verifyResult.invalidReason, routeConfig.extensions);
                return {
                    type: "payment-error",
                    response: this.createHTTPResponse(errorResponse, false, paywallConfig)
                };
            }
            return {
                type: "payment-verified",
                paymentPayload,
                paymentRequirements: matchingRequirements
            };
        } catch (error) {
            const errorResponse = this.ResourceServer.createPaymentRequiredResponse(requirements, resourceInfo, error instanceof Error ? error.message : "Payment verification failed", routeConfig.extensions);
            return {
                type: "payment-error",
                response: this.createHTTPResponse(errorResponse, false, paywallConfig)
            };
        }
    }
    /**
   * Process settlement after successful response
   *
   * @param paymentPayload - The verified payment payload
   * @param requirements - The matching payment requirements
   * @returns ProcessSettleResultResponse - SettleResponse with headers if success or errorReason if failure
   */ async processSettlement(paymentPayload, requirements) {
        try {
            const settleResponse = await this.ResourceServer.settlePayment(paymentPayload, requirements);
            if (!settleResponse.success) {
                return {
                    ...settleResponse,
                    success: false,
                    errorReason: settleResponse.errorReason || "Settlement failed"
                };
            }
            return {
                ...settleResponse,
                success: true,
                headers: this.createSettlementHeaders(settleResponse, requirements),
                requirements
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : "Settlement failed");
        }
    }
    /**
   * Check if a request requires payment based on route configuration
   *
   * @param context - HTTP request context
   * @returns True if the route requires payment, false otherwise
   */ requiresPayment(context) {
        const routeConfig = this.getRouteConfig(context.path, context.method);
        return routeConfig !== void 0;
    }
    /**
   * Normalizes a RouteConfig's accepts field into an array of PaymentOptions
   * Handles both single PaymentOption and array formats
   *
   * @param routeConfig - Route configuration
   * @returns Array of payment options
   */ normalizePaymentOptions(routeConfig) {
        return Array.isArray(routeConfig.accepts) ? routeConfig.accepts : [
            routeConfig.accepts
        ];
    }
    /**
   * Validates that all payment options in routes have corresponding registered schemes
   * and facilitator support.
   *
   * @returns Array of validation errors (empty if all routes are valid)
   */ validateRouteConfiguration() {
        const errors = [];
        const normalizedRoutes = typeof this.routesConfig === "object" && !("accepts" in this.routesConfig) ? Object.entries(this.routesConfig) : [
            [
                "*",
                this.routesConfig
            ]
        ];
        for (const [pattern, config] of normalizedRoutes){
            const paymentOptions = this.normalizePaymentOptions(config);
            for (const option of paymentOptions){
                if (!this.ResourceServer.hasRegisteredScheme(option.network, option.scheme)) {
                    errors.push({
                        routePattern: pattern,
                        scheme: option.scheme,
                        network: option.network,
                        reason: "missing_scheme",
                        message: `Route "${pattern}": No scheme implementation registered for "${option.scheme}" on network "${option.network}"`
                    });
                    continue;
                }
                const supportedKind = this.ResourceServer.getSupportedKind(__TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$VE37GDG2$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["x402Version"], option.network, option.scheme);
                if (!supportedKind) {
                    errors.push({
                        routePattern: pattern,
                        scheme: option.scheme,
                        network: option.network,
                        reason: "missing_facilitator",
                        message: `Route "${pattern}": Facilitator does not support scheme "${option.scheme}" on network "${option.network}"`
                    });
                }
            }
        }
        return errors;
    }
    /**
   * Get route configuration for a request
   *
   * @param path - Request path
   * @param method - HTTP method
   * @returns Route configuration or undefined if no match
   */ getRouteConfig(path, method) {
        const normalizedPath = this.normalizePath(path);
        const upperMethod = method.toUpperCase();
        const matchingRoute = this.compiledRoutes.find((route)=>route.regex.test(normalizedPath) && (route.verb === "*" || route.verb === upperMethod));
        return matchingRoute?.config;
    }
    /**
   * Extract payment from HTTP headers (handles v1 and v2)
   *
   * @param adapter - HTTP adapter
   * @returns Decoded payment payload or null
   */ extractPayment(adapter) {
        const header = adapter.getHeader("payment-signature") || adapter.getHeader("PAYMENT-SIGNATURE");
        if (header) {
            try {
                return decodePaymentSignatureHeader(header);
            } catch (error) {
                console.warn("Failed to decode PAYMENT-SIGNATURE header:", error);
            }
        }
        return null;
    }
    /**
   * Check if request is from a web browser
   *
   * @param adapter - HTTP adapter
   * @returns True if request appears to be from a browser
   */ isWebBrowser(adapter) {
        const accept = adapter.getAcceptHeader();
        const userAgent = adapter.getUserAgent();
        return accept.includes("text/html") && userAgent.includes("Mozilla");
    }
    /**
   * Create HTTP response instructions from payment required
   *
   * @param paymentRequired - Payment requirements
   * @param isWebBrowser - Whether request is from browser
   * @param paywallConfig - Paywall configuration
   * @param customHtml - Custom HTML template
   * @param unpaidResponse - Optional custom response (content type and body) for unpaid API requests
   * @returns Response instructions
   */ createHTTPResponse(paymentRequired, isWebBrowser, paywallConfig, customHtml, unpaidResponse) {
        if (isWebBrowser) {
            const html = this.generatePaywallHTML(paymentRequired, paywallConfig, customHtml);
            return {
                status: 402,
                headers: {
                    "Content-Type": "text/html"
                },
                body: html,
                isHtml: true
            };
        }
        const response = this.createHTTPPaymentRequiredResponse(paymentRequired);
        const contentType = unpaidResponse ? unpaidResponse.contentType : "application/json";
        const body = unpaidResponse ? unpaidResponse.body : {};
        return {
            status: 402,
            headers: {
                "Content-Type": contentType,
                ...response.headers
            },
            body
        };
    }
    /**
   * Create HTTP payment required response (v1 puts in body, v2 puts in header)
   *
   * @param paymentRequired - Payment required object
   * @returns Headers and body for the HTTP response
   */ createHTTPPaymentRequiredResponse(paymentRequired) {
        return {
            headers: {
                "PAYMENT-REQUIRED": encodePaymentRequiredHeader(paymentRequired)
            }
        };
    }
    /**
   * Create settlement response headers
   *
   * @param settleResponse - Settlement response
   * @param requirements - Payment requirements that were settled
   * @returns Headers to add to response
   */ createSettlementHeaders(settleResponse, requirements) {
        const encoded = encodePaymentResponseHeader({
            ...settleResponse,
            requirements
        });
        return {
            "PAYMENT-RESPONSE": encoded
        };
    }
    /**
   * Parse route pattern into verb and regex
   *
   * @param pattern - Route pattern like "GET /api/*" or "/api/[id]"
   * @returns Parsed pattern with verb and regex
   */ parseRoutePattern(pattern) {
        const [verb, path] = pattern.includes(" ") ? pattern.split(/\s+/) : [
            "*",
            pattern
        ];
        const regex = new RegExp(`^${path.replace(/[$()+.?^{|}]/g, "\\$&").replace(/\*/g, ".*?").replace(/\[([^\]]+)\]/g, "[^/]+").replace(/\//g, "\\/")}$`, "i");
        return {
            verb: verb.toUpperCase(),
            regex
        };
    }
    /**
   * Normalize path for matching
   *
   * @param path - Raw path from request
   * @returns Normalized path
   */ normalizePath(path) {
        try {
            const pathWithoutQuery = path.split(/[?#]/)[0];
            const decodedPath = decodeURIComponent(pathWithoutQuery);
            return decodedPath.replace(/\\/g, "/").replace(/\/+/g, "/").replace(/(.+?)\/+$/, "$1");
        } catch  {
            return path;
        }
    }
    /**
   * Generate paywall HTML for browser requests
   *
   * @param paymentRequired - Payment required response
   * @param paywallConfig - Optional paywall configuration
   * @param customHtml - Optional custom HTML template
   * @returns HTML string
   */ generatePaywallHTML(paymentRequired, paywallConfig, customHtml) {
        if (customHtml) {
            return customHtml;
        }
        if (this.paywallProvider) {
            return this.paywallProvider.generateHtml(paymentRequired, paywallConfig);
        }
        try {
            const paywall = (0, __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$BJTO5JO5$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["__require"])("@x402/paywall");
            const displayAmount2 = this.getDisplayAmount(paymentRequired);
            const resource2 = paymentRequired.resource;
            return paywall.getPaywallHtml({
                amount: displayAmount2,
                paymentRequired,
                currentUrl: resource2?.url || paywallConfig?.currentUrl || "",
                testnet: paywallConfig?.testnet ?? true,
                appName: paywallConfig?.appName,
                appLogo: paywallConfig?.appLogo,
                sessionTokenEndpoint: paywallConfig?.sessionTokenEndpoint
            });
        } catch  {}
        const resource = paymentRequired.resource;
        const displayAmount = this.getDisplayAmount(paymentRequired);
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Required</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <div style="max-width: 600px; margin: 50px auto; padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
            ${paywallConfig?.appLogo ? `<img src="${paywallConfig.appLogo}" alt="${paywallConfig.appName || "App"}" style="max-width: 200px; margin-bottom: 20px;">` : ""}
            <h1>Payment Required</h1>
            ${resource ? `<p><strong>Resource:</strong> ${resource.description || resource.url}</p>` : ""}
            <p><strong>Amount:</strong> $${displayAmount.toFixed(2)} USDC</p>
            <div id="payment-widget" 
                 data-requirements='${JSON.stringify(paymentRequired)}'
                 data-app-name="${paywallConfig?.appName || ""}"
                 data-testnet="${paywallConfig?.testnet || false}">
              <!-- Install @x402/paywall for full wallet integration -->
              <p style="margin-top: 2rem; padding: 1rem; background: #fef3c7; border-radius: 0.5rem;">
                <strong>Note:</strong> Install <code>@x402/paywall</code> for full wallet connection and payment UI.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
    }
    /**
   * Extract display amount from payment requirements.
   *
   * @param paymentRequired - The payment required object
   * @returns The display amount in decimal format
   */ getDisplayAmount(paymentRequired) {
        const accepts = paymentRequired.accepts;
        if (accepts && accepts.length > 0) {
            const firstReq = accepts[0];
            if ("amount" in firstReq) {
                return parseFloat(firstReq.amount) / 1e6;
            }
        }
        return 0;
    }
};
// src/http/httpFacilitatorClient.ts
var DEFAULT_FACILITATOR_URL = "https://x402.org/facilitator";
var HTTPFacilitatorClient = class {
    /**
   * Creates a new HTTPFacilitatorClient instance.
   *
   * @param config - Configuration options for the facilitator client
   */ constructor(config){
        this.url = config?.url || DEFAULT_FACILITATOR_URL;
        this._createAuthHeaders = config?.createAuthHeaders;
    }
    /**
   * Verify a payment with the facilitator
   *
   * @param paymentPayload - The payment to verify
   * @param paymentRequirements - The requirements to verify against
   * @returns Verification response
   */ async verify(paymentPayload, paymentRequirements) {
        let headers = {
            "Content-Type": "application/json"
        };
        if (this._createAuthHeaders) {
            const authHeaders = await this.createAuthHeaders("verify");
            headers = {
                ...headers,
                ...authHeaders.headers
            };
        }
        const response = await fetch(`${this.url}/verify`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                x402Version: paymentPayload.x402Version,
                paymentPayload: this.toJsonSafe(paymentPayload),
                paymentRequirements: this.toJsonSafe(paymentRequirements)
            })
        });
        if (!response.ok) {
            const errorText = await response.text().catch(()=>response.statusText);
            throw new Error(`Facilitator verify failed (${response.status}): ${errorText}`);
        }
        return await response.json();
    }
    /**
   * Settle a payment with the facilitator
   *
   * @param paymentPayload - The payment to settle
   * @param paymentRequirements - The requirements for settlement
   * @returns Settlement response
   */ async settle(paymentPayload, paymentRequirements) {
        let headers = {
            "Content-Type": "application/json"
        };
        if (this._createAuthHeaders) {
            const authHeaders = await this.createAuthHeaders("settle");
            headers = {
                ...headers,
                ...authHeaders.headers
            };
        }
        const response = await fetch(`${this.url}/settle`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                x402Version: paymentPayload.x402Version,
                paymentPayload: this.toJsonSafe(paymentPayload),
                paymentRequirements: this.toJsonSafe(paymentRequirements)
            })
        });
        if (!response.ok) {
            const errorText = await response.text().catch(()=>response.statusText);
            throw new Error(`Facilitator settle failed (${response.status}): ${errorText}`);
        }
        return await response.json();
    }
    /**
   * Get supported payment kinds and extensions from the facilitator
   *
   * @returns Supported payment kinds and extensions
   */ async getSupported() {
        let headers = {
            "Content-Type": "application/json"
        };
        if (this._createAuthHeaders) {
            const authHeaders = await this.createAuthHeaders("supported");
            headers = {
                ...headers,
                ...authHeaders.headers
            };
        }
        const response = await fetch(`${this.url}/supported`, {
            method: "GET",
            headers
        });
        if (!response.ok) {
            const errorText = await response.text().catch(()=>response.statusText);
            throw new Error(`Facilitator getSupported failed (${response.status}): ${errorText}`);
        }
        return await response.json();
    }
    /**
   * Creates authentication headers for a specific path.
   *
   * @param path - The path to create authentication headers for (e.g., "verify", "settle", "supported")
   * @returns An object containing the authentication headers for the specified path
   */ async createAuthHeaders(path) {
        if (this._createAuthHeaders) {
            const authHeaders = await this._createAuthHeaders();
            return {
                headers: authHeaders[path] ?? {}
            };
        }
        return {
            headers: {}
        };
    }
    /**
   * Helper to convert objects to JSON-safe format.
   * Handles BigInt and other non-JSON types.
   *
   * @param obj - The object to convert
   * @returns The JSON-safe representation of the object
   */ toJsonSafe(obj) {
        return JSON.parse(JSON.stringify(obj, (_, value)=>typeof value === "bigint" ? value.toString() : value));
    }
};
// src/http/x402HTTPClient.ts
var x402HTTPClient = class {
    /**
   * Creates a new x402HTTPClient instance.
   *
   * @param client - The underlying x402Client for payment logic
   */ constructor(client){
        this.client = client;
    }
    /**
   * Encodes a payment payload into appropriate HTTP headers based on version.
   *
   * @param paymentPayload - The payment payload to encode
   * @returns HTTP headers containing the encoded payment signature
   */ encodePaymentSignatureHeader(paymentPayload) {
        switch(paymentPayload.x402Version){
            case 2:
                return {
                    "PAYMENT-SIGNATURE": encodePaymentSignatureHeader(paymentPayload)
                };
            case 1:
                return {
                    "X-PAYMENT": encodePaymentSignatureHeader(paymentPayload)
                };
            default:
                throw new Error(`Unsupported x402 version: ${paymentPayload.x402Version}`);
        }
    }
    /**
   * Extracts payment required information from HTTP response.
   *
   * @param getHeader - Function to retrieve header value by name (case-insensitive)
   * @param body - Optional response body for v1 compatibility
   * @returns The payment required object
   */ getPaymentRequiredResponse(getHeader, body) {
        const paymentRequired = getHeader("PAYMENT-REQUIRED");
        if (paymentRequired) {
            return decodePaymentRequiredHeader(paymentRequired);
        }
        if (body && body instanceof Object && "x402Version" in body && body.x402Version === 1) {
            return body;
        }
        throw new Error("Invalid payment required response");
    }
    /**
   * Extracts payment settlement response from HTTP headers.
   *
   * @param getHeader - Function to retrieve header value by name (case-insensitive)
   * @returns The settlement response object
   */ getPaymentSettleResponse(getHeader) {
        const paymentResponse = getHeader("PAYMENT-RESPONSE");
        if (paymentResponse) {
            return decodePaymentResponseHeader(paymentResponse);
        }
        const xPaymentResponse = getHeader("X-PAYMENT-RESPONSE");
        if (xPaymentResponse) {
            return decodePaymentResponseHeader(xPaymentResponse);
        }
        throw new Error("Payment response header not found");
    }
    /**
   * Creates a payment payload for the given payment requirements.
   * Delegates to the underlying x402Client.
   *
   * @param paymentRequired - The payment required response from the server
   * @returns Promise resolving to the payment payload
   */ async createPaymentPayload(paymentRequired) {
        return this.client.createPaymentPayload(paymentRequired);
    }
};
// src/http/index.ts
function encodePaymentSignatureHeader(paymentPayload) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$3IUBYRYG$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeBase64Encode"])(JSON.stringify(paymentPayload));
}
function decodePaymentSignatureHeader(paymentSignatureHeader) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$3IUBYRYG$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Base64EncodedRegex"].test(paymentSignatureHeader)) {
        throw new Error("Invalid payment signature header");
    }
    return JSON.parse((0, __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$3IUBYRYG$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeBase64Decode"])(paymentSignatureHeader));
}
function encodePaymentRequiredHeader(paymentRequired) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$3IUBYRYG$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeBase64Encode"])(JSON.stringify(paymentRequired));
}
function decodePaymentRequiredHeader(paymentRequiredHeader) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$3IUBYRYG$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Base64EncodedRegex"].test(paymentRequiredHeader)) {
        throw new Error("Invalid payment required header");
    }
    return JSON.parse((0, __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$3IUBYRYG$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeBase64Decode"])(paymentRequiredHeader));
}
function encodePaymentResponseHeader(paymentResponse) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$3IUBYRYG$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeBase64Encode"])(JSON.stringify(paymentResponse));
}
function decodePaymentResponseHeader(paymentResponseHeader) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$3IUBYRYG$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Base64EncodedRegex"].test(paymentResponseHeader)) {
        throw new Error("Invalid payment response header");
    }
    return JSON.parse((0, __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$3IUBYRYG$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeBase64Decode"])(paymentResponseHeader));
}
;
 //# sourceMappingURL=chunk-RCHDDVGC.mjs.map
}),
"[project]/typescript/packages/core/dist/esm/server/index.mjs [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "x402ResourceServer",
    ()=>x402ResourceServer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$RCHDDVGC$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/typescript/packages/core/dist/esm/chunk-RCHDDVGC.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$VE37GDG2$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/typescript/packages/core/dist/esm/chunk-VE37GDG2.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$3IUBYRYG$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/typescript/packages/core/dist/esm/chunk-3IUBYRYG.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$BJTO5JO5$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/typescript/packages/core/dist/esm/chunk-BJTO5JO5.mjs [app-route] (ecmascript)");
;
;
;
;
// src/server/x402ResourceServer.ts
var x402ResourceServer = class {
    /**
   * Creates a new x402ResourceServer instance.
   *
   * @param facilitatorClients - Optional facilitator client(s) for payment processing
   */ constructor(facilitatorClients){
        this.registeredServerSchemes = /* @__PURE__ */ new Map();
        this.supportedResponsesMap = /* @__PURE__ */ new Map();
        this.facilitatorClientsMap = /* @__PURE__ */ new Map();
        this.registeredExtensions = /* @__PURE__ */ new Map();
        this.beforeVerifyHooks = [];
        this.afterVerifyHooks = [];
        this.onVerifyFailureHooks = [];
        this.beforeSettleHooks = [];
        this.afterSettleHooks = [];
        this.onSettleFailureHooks = [];
        if (!facilitatorClients) {
            this.facilitatorClients = [
                new __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$RCHDDVGC$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HTTPFacilitatorClient"]()
            ];
        } else if (Array.isArray(facilitatorClients)) {
            this.facilitatorClients = facilitatorClients.length > 0 ? facilitatorClients : [
                new __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$RCHDDVGC$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HTTPFacilitatorClient"]()
            ];
        } else {
            this.facilitatorClients = [
                facilitatorClients
            ];
        }
    }
    /**
   * Register a scheme/network server implementation.
   *
   * @param network - The network identifier
   * @param server - The scheme/network server implementation
   * @returns The x402ResourceServer instance for chaining
   */ register(network, server) {
        if (!this.registeredServerSchemes.has(network)) {
            this.registeredServerSchemes.set(network, /* @__PURE__ */ new Map());
        }
        const serverByScheme = this.registeredServerSchemes.get(network);
        if (!serverByScheme.has(server.scheme)) {
            serverByScheme.set(server.scheme, server);
        }
        return this;
    }
    /**
   * Check if a scheme is registered for a given network.
   *
   * @param network - The network identifier
   * @param scheme - The payment scheme name
   * @returns True if the scheme is registered for the network, false otherwise
   */ hasRegisteredScheme(network, scheme) {
        return !!(0, __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$3IUBYRYG$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findByNetworkAndScheme"])(this.registeredServerSchemes, scheme, network);
    }
    /**
   * Registers a resource service extension that can enrich extension declarations.
   *
   * @param extension - The extension to register
   * @returns The x402ResourceServer instance for chaining
   */ registerExtension(extension) {
        this.registeredExtensions.set(extension.key, extension);
        return this;
    }
    /**
   * Enriches declared extensions using registered extension hooks.
   *
   * @param declaredExtensions - Extensions declared on the route
   * @param transportContext - Transport-specific context (HTTP, A2A, MCP, etc.)
   * @returns Enriched extensions map
   */ enrichExtensions(declaredExtensions, transportContext) {
        const enriched = {};
        for (const [key, declaration] of Object.entries(declaredExtensions)){
            const extension = this.registeredExtensions.get(key);
            if (extension?.enrichDeclaration) {
                enriched[key] = extension.enrichDeclaration(declaration, transportContext);
            } else {
                enriched[key] = declaration;
            }
        }
        return enriched;
    }
    /**
   * Register a hook to execute before payment verification.
   * Can abort verification by returning { abort: true, reason: string }
   *
   * @param hook - The hook function to register
   * @returns The x402ResourceServer instance for chaining
   */ onBeforeVerify(hook) {
        this.beforeVerifyHooks.push(hook);
        return this;
    }
    /**
   * Register a hook to execute after successful payment verification.
   *
   * @param hook - The hook function to register
   * @returns The x402ResourceServer instance for chaining
   */ onAfterVerify(hook) {
        this.afterVerifyHooks.push(hook);
        return this;
    }
    /**
   * Register a hook to execute when payment verification fails.
   * Can recover from failure by returning { recovered: true, result: VerifyResponse }
   *
   * @param hook - The hook function to register
   * @returns The x402ResourceServer instance for chaining
   */ onVerifyFailure(hook) {
        this.onVerifyFailureHooks.push(hook);
        return this;
    }
    /**
   * Register a hook to execute before payment settlement.
   * Can abort settlement by returning { abort: true, reason: string }
   *
   * @param hook - The hook function to register
   * @returns The x402ResourceServer instance for chaining
   */ onBeforeSettle(hook) {
        this.beforeSettleHooks.push(hook);
        return this;
    }
    /**
   * Register a hook to execute after successful payment settlement.
   *
   * @param hook - The hook function to register
   * @returns The x402ResourceServer instance for chaining
   */ onAfterSettle(hook) {
        this.afterSettleHooks.push(hook);
        return this;
    }
    /**
   * Register a hook to execute when payment settlement fails.
   * Can recover from failure by returning { recovered: true, result: SettleResponse }
   *
   * @param hook - The hook function to register
   * @returns The x402ResourceServer instance for chaining
   */ onSettleFailure(hook) {
        this.onSettleFailureHooks.push(hook);
        return this;
    }
    /**
   * Initialize by fetching supported kinds from all facilitators
   * Creates mappings for supported responses and facilitator clients
   * Earlier facilitators in the array get precedence
   */ async initialize() {
        this.supportedResponsesMap.clear();
        this.facilitatorClientsMap.clear();
        for (const facilitatorClient of this.facilitatorClients){
            try {
                const supported = await facilitatorClient.getSupported();
                for (const kind of supported.kinds){
                    const x402Version2 = kind.x402Version;
                    if (!this.supportedResponsesMap.has(x402Version2)) {
                        this.supportedResponsesMap.set(x402Version2, /* @__PURE__ */ new Map());
                    }
                    const responseVersionMap = this.supportedResponsesMap.get(x402Version2);
                    if (!this.facilitatorClientsMap.has(x402Version2)) {
                        this.facilitatorClientsMap.set(x402Version2, /* @__PURE__ */ new Map());
                    }
                    const clientVersionMap = this.facilitatorClientsMap.get(x402Version2);
                    if (!responseVersionMap.has(kind.network)) {
                        responseVersionMap.set(kind.network, /* @__PURE__ */ new Map());
                    }
                    const responseNetworkMap = responseVersionMap.get(kind.network);
                    if (!clientVersionMap.has(kind.network)) {
                        clientVersionMap.set(kind.network, /* @__PURE__ */ new Map());
                    }
                    const clientNetworkMap = clientVersionMap.get(kind.network);
                    if (!responseNetworkMap.has(kind.scheme)) {
                        responseNetworkMap.set(kind.scheme, supported);
                        clientNetworkMap.set(kind.scheme, facilitatorClient);
                    }
                }
            } catch (error) {
                console.warn(`Failed to fetch supported kinds from facilitator: ${error}`);
            }
        }
    }
    /**
   * Get supported kind for a specific version, network, and scheme
   *
   * @param x402Version - The x402 version
   * @param network - The network identifier
   * @param scheme - The payment scheme
   * @returns The supported kind or undefined if not found
   */ getSupportedKind(x402Version2, network, scheme) {
        const versionMap = this.supportedResponsesMap.get(x402Version2);
        if (!versionMap) return void 0;
        const supportedResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$3IUBYRYG$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findByNetworkAndScheme"])(versionMap, scheme, network);
        if (!supportedResponse) return void 0;
        return supportedResponse.kinds.find((kind)=>kind.x402Version === x402Version2 && kind.network === network && kind.scheme === scheme);
    }
    /**
   * Get facilitator extensions for a specific version, network, and scheme
   *
   * @param x402Version - The x402 version
   * @param network - The network identifier
   * @param scheme - The payment scheme
   * @returns The facilitator extensions or empty array if not found
   */ getFacilitatorExtensions(x402Version2, network, scheme) {
        const versionMap = this.supportedResponsesMap.get(x402Version2);
        if (!versionMap) return [];
        const supportedResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$3IUBYRYG$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findByNetworkAndScheme"])(versionMap, scheme, network);
        return supportedResponse?.extensions || [];
    }
    /**
   * Build payment requirements for a protected resource
   *
   * @param resourceConfig - Configuration for the protected resource
   * @returns Array of payment requirements
   */ async buildPaymentRequirements(resourceConfig) {
        const requirements = [];
        const scheme = resourceConfig.scheme;
        const SchemeNetworkServer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$3IUBYRYG$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findByNetworkAndScheme"])(this.registeredServerSchemes, scheme, resourceConfig.network);
        if (!SchemeNetworkServer) {
            console.warn(`No server implementation registered for scheme: ${scheme}, network: ${resourceConfig.network}`);
            return requirements;
        }
        const supportedKind = this.getSupportedKind(__TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$VE37GDG2$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["x402Version"], resourceConfig.network, SchemeNetworkServer.scheme);
        if (!supportedKind) {
            throw new Error(`Facilitator does not support ${SchemeNetworkServer.scheme} on ${resourceConfig.network}. Make sure to call initialize() to fetch supported kinds from facilitators.`);
        }
        const facilitatorExtensions = this.getFacilitatorExtensions(__TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$VE37GDG2$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["x402Version"], resourceConfig.network, SchemeNetworkServer.scheme);
        const parsedPrice = await SchemeNetworkServer.parsePrice(resourceConfig.price, resourceConfig.network);
        const baseRequirements = {
            scheme: SchemeNetworkServer.scheme,
            network: resourceConfig.network,
            amount: parsedPrice.amount,
            asset: parsedPrice.asset,
            payTo: resourceConfig.payTo,
            maxTimeoutSeconds: resourceConfig.maxTimeoutSeconds || 300,
            // Default 5 minutes
            extra: {
                ...parsedPrice.extra
            }
        };
        const requirement = await SchemeNetworkServer.enhancePaymentRequirements(baseRequirements, {
            ...supportedKind,
            x402Version: __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$VE37GDG2$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["x402Version"]
        }, facilitatorExtensions);
        requirements.push(requirement);
        return requirements;
    }
    /**
   * Build payment requirements from multiple payment options
   * This method handles resolving dynamic payTo/price functions and builds requirements for each option
   *
   * @param paymentOptions - Array of payment options to convert
   * @param context - HTTP request context for resolving dynamic functions
   * @returns Array of payment requirements (one per option)
   */ async buildPaymentRequirementsFromOptions(paymentOptions, context) {
        const allRequirements = [];
        for (const option of paymentOptions){
            const resolvedPayTo = typeof option.payTo === "function" ? await option.payTo(context) : option.payTo;
            const resolvedPrice = typeof option.price === "function" ? await option.price(context) : option.price;
            const resourceConfig = {
                scheme: option.scheme,
                payTo: resolvedPayTo,
                price: resolvedPrice,
                network: option.network,
                maxTimeoutSeconds: option.maxTimeoutSeconds
            };
            const requirements = await this.buildPaymentRequirements(resourceConfig);
            allRequirements.push(...requirements);
        }
        return allRequirements;
    }
    /**
   * Create a payment required response
   *
   * @param requirements - Payment requirements
   * @param resourceInfo - Resource information
   * @param error - Error message
   * @param extensions - Optional extensions
   * @returns Payment required response object
   */ createPaymentRequiredResponse(requirements, resourceInfo, error, extensions) {
        const response = {
            x402Version: 2,
            error,
            resource: resourceInfo,
            accepts: requirements
        };
        if (extensions && Object.keys(extensions).length > 0) {
            response.extensions = extensions;
        }
        return response;
    }
    /**
   * Verify a payment against requirements
   *
   * @param paymentPayload - The payment payload to verify
   * @param requirements - The payment requirements
   * @returns Verification response
   */ async verifyPayment(paymentPayload, requirements) {
        const context = {
            paymentPayload,
            requirements
        };
        for (const hook of this.beforeVerifyHooks){
            const result = await hook(context);
            if (result && "abort" in result && result.abort) {
                return {
                    isValid: false,
                    invalidReason: result.reason
                };
            }
        }
        try {
            const facilitatorClient = this.getFacilitatorClient(paymentPayload.x402Version, requirements.network, requirements.scheme);
            let verifyResult;
            if (!facilitatorClient) {
                let lastError;
                for (const client of this.facilitatorClients){
                    try {
                        verifyResult = await client.verify(paymentPayload, requirements);
                        break;
                    } catch (error) {
                        lastError = error;
                    }
                }
                if (!verifyResult) {
                    throw lastError || new Error(`No facilitator supports ${requirements.scheme} on ${requirements.network} for v${paymentPayload.x402Version}`);
                }
            } else {
                verifyResult = await facilitatorClient.verify(paymentPayload, requirements);
            }
            const resultContext = {
                ...context,
                result: verifyResult
            };
            for (const hook of this.afterVerifyHooks){
                await hook(resultContext);
            }
            return verifyResult;
        } catch (error) {
            const failureContext = {
                ...context,
                error
            };
            for (const hook of this.onVerifyFailureHooks){
                const result = await hook(failureContext);
                if (result && "recovered" in result && result.recovered) {
                    return result.result;
                }
            }
            throw error;
        }
    }
    /**
   * Settle a verified payment
   *
   * @param paymentPayload - The payment payload to settle
   * @param requirements - The payment requirements
   * @returns Settlement response
   */ async settlePayment(paymentPayload, requirements) {
        const context = {
            paymentPayload,
            requirements
        };
        for (const hook of this.beforeSettleHooks){
            const result = await hook(context);
            if (result && "abort" in result && result.abort) {
                throw new Error(`Settlement aborted: ${result.reason}`);
            }
        }
        try {
            const facilitatorClient = this.getFacilitatorClient(paymentPayload.x402Version, requirements.network, requirements.scheme);
            let settleResult;
            if (!facilitatorClient) {
                let lastError;
                for (const client of this.facilitatorClients){
                    try {
                        settleResult = await client.settle(paymentPayload, requirements);
                        break;
                    } catch (error) {
                        lastError = error;
                    }
                }
                if (!settleResult) {
                    throw lastError || new Error(`No facilitator supports ${requirements.scheme} on ${requirements.network} for v${paymentPayload.x402Version}`);
                }
            } else {
                settleResult = await facilitatorClient.settle(paymentPayload, requirements);
            }
            const resultContext = {
                ...context,
                result: settleResult
            };
            for (const hook of this.afterSettleHooks){
                await hook(resultContext);
            }
            return settleResult;
        } catch (error) {
            const failureContext = {
                ...context,
                error
            };
            for (const hook of this.onSettleFailureHooks){
                const result = await hook(failureContext);
                if (result && "recovered" in result && result.recovered) {
                    return result.result;
                }
            }
            throw error;
        }
    }
    /**
   * Find matching payment requirements for a payment
   *
   * @param availableRequirements - Array of available payment requirements
   * @param paymentPayload - The payment payload
   * @returns Matching payment requirements or undefined
   */ findMatchingRequirements(availableRequirements, paymentPayload) {
        switch(paymentPayload.x402Version){
            case 2:
                return availableRequirements.find((paymentRequirements)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$3IUBYRYG$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deepEqual"])(paymentRequirements, paymentPayload.accepted));
            case 1:
                return availableRequirements.find((req)=>req.scheme === paymentPayload.accepted.scheme && req.network === paymentPayload.accepted.network);
            default:
                throw new Error(`Unsupported x402 version: ${paymentPayload.x402Version}`);
        }
    }
    /**
   * Process a payment request
   *
   * @param paymentPayload - Optional payment payload if provided
   * @param resourceConfig - Configuration for the protected resource
   * @param resourceInfo - Information about the resource being accessed
   * @param extensions - Optional extensions to include in the response
   * @returns Processing result
   */ async processPaymentRequest(paymentPayload, resourceConfig, resourceInfo, extensions) {
        const requirements = await this.buildPaymentRequirements(resourceConfig);
        if (!paymentPayload) {
            return {
                success: false,
                requiresPayment: this.createPaymentRequiredResponse(requirements, resourceInfo, "Payment required", extensions)
            };
        }
        const matchingRequirements = this.findMatchingRequirements(requirements, paymentPayload);
        if (!matchingRequirements) {
            return {
                success: false,
                requiresPayment: this.createPaymentRequiredResponse(requirements, resourceInfo, "No matching payment requirements found", extensions)
            };
        }
        const verificationResult = await this.verifyPayment(paymentPayload, matchingRequirements);
        if (!verificationResult.isValid) {
            return {
                success: false,
                error: verificationResult.invalidReason,
                verificationResult
            };
        }
        return {
            success: true,
            verificationResult
        };
    }
    /**
   * Get facilitator client for a specific version, network, and scheme
   *
   * @param x402Version - The x402 version
   * @param network - The network identifier
   * @param scheme - The payment scheme
   * @returns The facilitator client or undefined if not found
   */ getFacilitatorClient(x402Version2, network, scheme) {
        const versionMap = this.facilitatorClientsMap.get(x402Version2);
        if (!versionMap) return void 0;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$3IUBYRYG$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["findByNetworkAndScheme"])(versionMap, scheme, network);
    }
};
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/typescript/packages/extensions/dist/esm/chunk-STXY3Q5R.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/bazaar/types.ts
__turbopack_context__.s([
    "BAZAAR",
    ()=>BAZAAR,
    "bazaarResourceServerExtension",
    ()=>bazaarResourceServerExtension,
    "declareDiscoveryExtension",
    ()=>declareDiscoveryExtension,
    "extractDiscoveryInfo",
    ()=>extractDiscoveryInfo,
    "extractDiscoveryInfoFromExtension",
    ()=>extractDiscoveryInfoFromExtension,
    "extractDiscoveryInfoV1",
    ()=>extractDiscoveryInfoV1,
    "extractResourceMetadataV1",
    ()=>extractResourceMetadataV1,
    "isDiscoverableV1",
    ()=>isDiscoverableV1,
    "validateAndExtract",
    ()=>validateAndExtract,
    "validateDiscoveryExtension",
    ()=>validateDiscoveryExtension,
    "withBazaar",
    ()=>withBazaar
]);
// src/bazaar/facilitator.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f$ajv$40$8$2e$17$2e$1$2f$node_modules$2f$ajv$2f$dist$2f$2020$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/ajv@8.17.1/node_modules/ajv/dist/2020.js [app-route] (ecmascript)");
var BAZAAR = "bazaar";
// src/bazaar/resourceService.ts
function createQueryDiscoveryExtension({ method, input = {}, inputSchema = {
    properties: {}
}, output }) {
    return {
        info: {
            input: {
                type: "http",
                ...method ? {
                    method
                } : {},
                ...input ? {
                    queryParams: input
                } : {}
            },
            ...output?.example ? {
                output: {
                    type: "json",
                    example: output.example
                }
            } : {}
        },
        schema: {
            $schema: "https://json-schema.org/draft/2020-12/schema",
            type: "object",
            properties: {
                input: {
                    type: "object",
                    properties: {
                        type: {
                            type: "string",
                            const: "http"
                        },
                        method: {
                            type: "string",
                            enum: [
                                "GET",
                                "HEAD",
                                "DELETE"
                            ]
                        },
                        ...inputSchema ? {
                            queryParams: {
                                type: "object",
                                ...typeof inputSchema === "object" ? inputSchema : {}
                            }
                        } : {}
                    },
                    required: [
                        "type"
                    ],
                    additionalProperties: false
                },
                ...output?.example ? {
                    output: {
                        type: "object",
                        properties: {
                            type: {
                                type: "string"
                            },
                            example: {
                                type: "object",
                                ...output.schema && typeof output.schema === "object" ? output.schema : {}
                            }
                        },
                        required: [
                            "type"
                        ]
                    }
                } : {}
            },
            required: [
                "input"
            ]
        }
    };
}
function createBodyDiscoveryExtension({ method, input = {}, inputSchema = {
    properties: {}
}, bodyType = "json", output }) {
    return {
        info: {
            input: {
                type: "http",
                ...method ? {
                    method
                } : {},
                bodyType,
                body: input
            },
            ...output?.example ? {
                output: {
                    type: "json",
                    example: output.example
                }
            } : {}
        },
        schema: {
            $schema: "https://json-schema.org/draft/2020-12/schema",
            type: "object",
            properties: {
                input: {
                    type: "object",
                    properties: {
                        type: {
                            type: "string",
                            const: "http"
                        },
                        method: {
                            type: "string",
                            enum: [
                                "POST",
                                "PUT",
                                "PATCH"
                            ]
                        },
                        bodyType: {
                            type: "string",
                            enum: [
                                "json",
                                "form-data",
                                "text"
                            ]
                        },
                        body: inputSchema
                    },
                    required: [
                        "type",
                        "bodyType",
                        "body"
                    ],
                    additionalProperties: false
                },
                ...output?.example ? {
                    output: {
                        type: "object",
                        properties: {
                            type: {
                                type: "string"
                            },
                            example: {
                                type: "object",
                                ...output.schema && typeof output.schema === "object" ? output.schema : {}
                            }
                        },
                        required: [
                            "type"
                        ]
                    }
                } : {}
            },
            required: [
                "input"
            ]
        }
    };
}
function declareDiscoveryExtension(config) {
    const bodyType = config.bodyType;
    const isBodyMethod2 = bodyType !== void 0;
    const extension = isBodyMethod2 ? createBodyDiscoveryExtension(config) : createQueryDiscoveryExtension(config);
    return {
        bazaar: extension
    };
}
// src/bazaar/server.ts
function isHTTPRequestContext(ctx) {
    return ctx !== null && typeof ctx === "object" && "method" in ctx && "adapter" in ctx;
}
var bazaarResourceServerExtension = {
    key: BAZAAR,
    enrichDeclaration: (declaration, transportContext)=>{
        if (!isHTTPRequestContext(transportContext)) {
            return declaration;
        }
        const extension = declaration;
        const method = transportContext.method;
        return {
            ...extension,
            info: {
                ...extension.info || {},
                input: {
                    ...extension.info?.input || {},
                    method
                }
            },
            schema: {
                ...extension.schema || {},
                properties: {
                    ...extension.schema?.properties || {},
                    input: {
                        ...extension.schema?.properties?.input || {},
                        required: [
                            ...extension.schema?.properties?.input?.required || [],
                            ...!(extension.schema?.properties?.input?.required || []).includes("method") ? [
                                "method"
                            ] : []
                        ]
                    }
                }
            }
        };
    }
};
;
// src/bazaar/v1/facilitator.ts
function hasV1OutputSchema(obj) {
    return obj !== null && typeof obj === "object" && "input" in obj && obj.input !== null && typeof obj.input === "object" && "type" in obj.input && obj.input.type === "http" && "method" in obj.input;
}
function isQueryMethod(method) {
    const upperMethod = method.toUpperCase();
    return upperMethod === "GET" || upperMethod === "HEAD" || upperMethod === "DELETE";
}
function isBodyMethod(method) {
    const upperMethod = method.toUpperCase();
    return upperMethod === "POST" || upperMethod === "PUT" || upperMethod === "PATCH";
}
function extractQueryParams(v1Input) {
    if (v1Input.queryParams && typeof v1Input.queryParams === "object") {
        return v1Input.queryParams;
    }
    if (v1Input.query_params && typeof v1Input.query_params === "object") {
        return v1Input.query_params;
    }
    if (v1Input.query && typeof v1Input.query === "object") {
        return v1Input.query;
    }
    if (v1Input.params && typeof v1Input.params === "object") {
        return v1Input.params;
    }
    return void 0;
}
function extractBodyInfo(v1Input) {
    let bodyType = "json";
    const bodyTypeField = v1Input.bodyType || v1Input.body_type;
    if (bodyTypeField && typeof bodyTypeField === "string") {
        const type = bodyTypeField.toLowerCase();
        if (type.includes("form") || type.includes("multipart")) {
            bodyType = "form-data";
        } else if (type.includes("text") || type.includes("plain")) {
            bodyType = "text";
        } else {
            bodyType = "json";
        }
    }
    let body = {};
    if (v1Input.bodyFields && typeof v1Input.bodyFields === "object") {
        body = v1Input.bodyFields;
    } else if (v1Input.body_fields && v1Input.body_fields !== null && typeof v1Input.body_fields === "object") {
        body = v1Input.body_fields;
    } else if (v1Input.bodyParams && typeof v1Input.bodyParams === "object") {
        body = v1Input.bodyParams;
    } else if (v1Input.body && typeof v1Input.body === "object") {
        body = v1Input.body;
    } else if (v1Input.data && typeof v1Input.data === "object") {
        body = v1Input.data;
    } else if (v1Input.properties && typeof v1Input.properties === "object") {
        body = v1Input.properties;
    }
    return {
        body,
        bodyType
    };
}
function extractDiscoveryInfoV1(paymentRequirements) {
    const { outputSchema } = paymentRequirements;
    if (!outputSchema || !hasV1OutputSchema(outputSchema)) {
        return null;
    }
    const v1Input = outputSchema.input;
    const isDiscoverable = v1Input.discoverable ?? true;
    if (!isDiscoverable) {
        return null;
    }
    const method = typeof v1Input.method === "string" ? v1Input.method.toUpperCase() : "";
    const headersRaw = v1Input.headerFields || v1Input.header_fields || v1Input.headers;
    const headers = headersRaw && typeof headersRaw === "object" ? headersRaw : void 0;
    const output = outputSchema.output ? {
        type: "json",
        example: outputSchema.output
    } : void 0;
    if (isQueryMethod(method)) {
        const queryParams = extractQueryParams(v1Input);
        const discoveryInfo = {
            input: {
                type: "http",
                method,
                ...queryParams ? {
                    queryParams
                } : {},
                ...headers ? {
                    headers
                } : {}
            },
            ...output ? {
                output
            } : {}
        };
        return discoveryInfo;
    } else if (isBodyMethod(method)) {
        const { body, bodyType } = extractBodyInfo(v1Input);
        const queryParams = extractQueryParams(v1Input);
        const discoveryInfo = {
            input: {
                type: "http",
                method,
                bodyType,
                body,
                ...queryParams ? {
                    queryParams
                } : {},
                ...headers ? {
                    headers
                } : {}
            },
            ...output ? {
                output
            } : {}
        };
        return discoveryInfo;
    }
    return null;
}
function isDiscoverableV1(paymentRequirements) {
    return extractDiscoveryInfoV1(paymentRequirements) !== null;
}
function extractResourceMetadataV1(paymentRequirements) {
    return {
        url: paymentRequirements.resource,
        description: paymentRequirements.description,
        mimeType: paymentRequirements.mimeType
    };
}
// src/bazaar/facilitator.ts
function validateDiscoveryExtension(extension) {
    try {
        const ajv = new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f$ajv$40$8$2e$17$2e$1$2f$node_modules$2f$ajv$2f$dist$2f$2020$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]({
            strict: false,
            allErrors: true
        });
        const validate = ajv.compile(extension.schema);
        const valid = validate(extension.info);
        if (valid) {
            return {
                valid: true
            };
        }
        const errors = validate.errors?.map((err)=>{
            const path = err.instancePath || "(root)";
            return `${path}: ${err.message}`;
        }) || [
            "Unknown validation error"
        ];
        return {
            valid: false,
            errors
        };
    } catch (error) {
        return {
            valid: false,
            errors: [
                `Schema validation failed: ${error instanceof Error ? error.message : String(error)}`
            ]
        };
    }
}
function extractDiscoveryInfo(paymentPayload, paymentRequirements, validate = true) {
    let discoveryInfo = null;
    let resourceUrl;
    if (paymentPayload.x402Version === 2) {
        resourceUrl = paymentPayload.resource?.url ?? "";
        if (paymentPayload.extensions) {
            const bazaarExtension = paymentPayload.extensions[BAZAAR];
            if (bazaarExtension && typeof bazaarExtension === "object") {
                try {
                    const extension = bazaarExtension;
                    if (validate) {
                        const result = validateDiscoveryExtension(extension);
                        if (!result.valid) {
                            console.warn(`V2 discovery extension validation failed: ${result.errors?.join(", ")}`);
                        } else {
                            discoveryInfo = extension.info;
                        }
                    } else {
                        discoveryInfo = extension.info;
                    }
                } catch (error) {
                    console.warn(`V2 discovery extension extraction failed: ${error}`);
                }
            }
        }
    } else if (paymentPayload.x402Version === 1) {
        const requirementsV1 = paymentRequirements;
        resourceUrl = requirementsV1.resource;
        discoveryInfo = extractDiscoveryInfoV1(requirementsV1);
    } else {
        return null;
    }
    if (!discoveryInfo) {
        return null;
    }
    return {
        resourceUrl,
        method: discoveryInfo.input.method,
        x402Version: paymentPayload.x402Version,
        discoveryInfo
    };
}
function extractDiscoveryInfoFromExtension(extension, validate = true) {
    if (validate) {
        const result = validateDiscoveryExtension(extension);
        if (!result.valid) {
            throw new Error(`Invalid discovery extension: ${result.errors?.join(", ") || "Unknown error"}`);
        }
    }
    return extension.info;
}
function validateAndExtract(extension) {
    const result = validateDiscoveryExtension(extension);
    if (result.valid) {
        return {
            valid: true,
            info: extension.info
        };
    }
    return {
        valid: false,
        errors: result.errors
    };
}
// src/bazaar/facilitatorClient.ts
function withBazaar(client) {
    const existingExtensions = client.extensions ?? {};
    const extended = client;
    extended.extensions = {
        ...existingExtensions,
        discovery: {
            async listResources (params) {
                let headers = {
                    "Content-Type": "application/json"
                };
                const authHeaders = await client.createAuthHeaders("discovery");
                headers = {
                    ...headers,
                    ...authHeaders.headers
                };
                const queryParams = new URLSearchParams();
                if (params?.type !== void 0) {
                    queryParams.set("type", params.type);
                }
                if (params?.limit !== void 0) {
                    queryParams.set("limit", params.limit.toString());
                }
                if (params?.offset !== void 0) {
                    queryParams.set("offset", params.offset.toString());
                }
                const queryString = queryParams.toString();
                const endpoint = `${client.url}/discovery/resources${queryString ? `?${queryString}` : ""}`;
                const response = await fetch(endpoint, {
                    method: "GET",
                    headers
                });
                if (!response.ok) {
                    const errorText = await response.text().catch(()=>response.statusText);
                    throw new Error(`Facilitator listDiscoveryResources failed (${response.status}): ${errorText}`);
                }
                return await response.json();
            }
        }
    };
    return extended;
}
;
 //# sourceMappingURL=chunk-STXY3Q5R.mjs.map
}),
"[project]/typescript/packages/extensions/dist/esm/bazaar/index.mjs [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$extensions$2f$dist$2f$esm$2f$chunk$2d$STXY3Q5R$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/typescript/packages/extensions/dist/esm/chunk-STXY3Q5R.mjs [app-route] (ecmascript)");
;
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/typescript/packages/mechanisms/evm/dist/esm/exact/server/index.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/exact/server/scheme.ts
__turbopack_context__.s([
    "ExactEvmScheme",
    ()=>ExactEvmScheme,
    "registerExactEvmScheme",
    ()=>registerExactEvmScheme
]);
var ExactEvmScheme = class {
    constructor(){
        this.scheme = "exact";
        this.moneyParsers = [];
    }
    /**
   * Register a custom money parser in the parser chain.
   * Multiple parsers can be registered - they will be tried in registration order.
   * Each parser receives a decimal amount (e.g., 1.50 for $1.50).
   * If a parser returns null, the next parser in the chain will be tried.
   * The default parser is always the final fallback.
   *
   * @param parser - Custom function to convert amount to AssetAmount (or null to skip)
   * @returns The server instance for chaining
   *
   * @example
   * evmServer.registerMoneyParser(async (amount, network) => {
   *   // Custom conversion logic
   *   if (amount > 100) {
   *     // Use different token for large amounts
   *     return { amount: (amount * 1e18).toString(), asset: "0xCustomToken" };
   *   }
   *   return null; // Use next parser
   * });
   */ registerMoneyParser(parser) {
        this.moneyParsers.push(parser);
        return this;
    }
    /**
   * Parses a price into an asset amount.
   * If price is already an AssetAmount, returns it directly.
   * If price is Money (string | number), parses to decimal and tries custom parsers.
   * Falls back to default conversion if all custom parsers return null.
   *
   * @param price - The price to parse
   * @param network - The network to use
   * @returns Promise that resolves to the parsed asset amount
   */ async parsePrice(price, network) {
        if (typeof price === "object" && price !== null && "amount" in price) {
            if (!price.asset) {
                throw new Error(`Asset address must be specified for AssetAmount on network ${network}`);
            }
            return {
                amount: price.amount,
                asset: price.asset,
                extra: price.extra || {}
            };
        }
        const amount = this.parseMoneyToDecimal(price);
        for (const parser of this.moneyParsers){
            const result = await parser(amount, network);
            if (result !== null) {
                return result;
            }
        }
        return this.defaultMoneyConversion(amount, network);
    }
    /**
   * Build payment requirements for this scheme/network combination
   *
   * @param paymentRequirements - The base payment requirements
   * @param supportedKind - The supported kind from facilitator (unused)
   * @param supportedKind.x402Version - The x402 version
   * @param supportedKind.scheme - The logical payment scheme
   * @param supportedKind.network - The network identifier in CAIP-2 format
   * @param supportedKind.extra - Optional extra metadata regarding scheme/network implementation details
   * @param extensionKeys - Extension keys supported by the facilitator (unused)
   * @returns Payment requirements ready to be sent to clients
   */ enhancePaymentRequirements(paymentRequirements, supportedKind, extensionKeys) {
        void supportedKind;
        void extensionKeys;
        return Promise.resolve(paymentRequirements);
    }
    /**
   * Parse Money (string | number) to a decimal number.
   * Handles formats like "$1.50", "1.50", 1.50, etc.
   *
   * @param money - The money value to parse
   * @returns Decimal number
   */ parseMoneyToDecimal(money) {
        if (typeof money === "number") {
            return money;
        }
        const cleanMoney = money.replace(/^\$/, "").trim();
        const amount = parseFloat(cleanMoney);
        if (isNaN(amount)) {
            throw new Error(`Invalid money format: ${money}`);
        }
        return amount;
    }
    /**
   * Default money conversion implementation.
   * Converts decimal amount to USDC on the specified network.
   *
   * @param amount - The decimal amount (e.g., 1.50)
   * @param network - The network to use
   * @returns The parsed asset amount in USDC
   */ defaultMoneyConversion(amount, network) {
        const tokenAmount = this.convertToTokenAmount(amount.toString(), network);
        const assetInfo = this.getDefaultAsset(network);
        return {
            amount: tokenAmount,
            asset: assetInfo.address,
            extra: {
                name: assetInfo.name,
                version: assetInfo.version
            }
        };
    }
    /**
   * Convert decimal amount to token units (e.g., 0.10 -> 100000 for 6-decimal USDC)
   *
   * @param decimalAmount - The decimal amount to convert
   * @param network - The network to use
   * @returns The token amount as a string
   */ convertToTokenAmount(decimalAmount, network) {
        const decimals = this.getAssetDecimals(network);
        const amount = parseFloat(decimalAmount);
        if (isNaN(amount)) {
            throw new Error(`Invalid amount: ${decimalAmount}`);
        }
        const [intPart, decPart = ""] = String(amount).split(".");
        const paddedDec = decPart.padEnd(decimals, "0").slice(0, decimals);
        const tokenAmount = (intPart + paddedDec).replace(/^0+/, "") || "0";
        return tokenAmount;
    }
    /**
   * Get the default asset info for a network (typically USDC)
   *
   * @param network - The network to get asset info for
   * @returns The asset information including address, name, and version
   */ getDefaultAsset(network) {
        const usdcInfo = {
            "eip155:8453": {
                address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
                name: "USD Coin",
                version: "2"
            },
            // Base mainnet USDC
            "eip155:84532": {
                address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
                name: "USDC",
                version: "2"
            },
            // Base Sepolia USDC
            "eip155:1": {
                address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                name: "USD Coin",
                version: "2"
            },
            // Ethereum mainnet USDC
            "eip155:11155111": {
                address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
                name: "USDC",
                version: "2"
            }
        };
        const assetInfo = usdcInfo[network];
        if (!assetInfo) {
            throw new Error(`No default asset configured for network ${network}`);
        }
        return assetInfo;
    }
    /**
   * Get asset info for a given symbol on a network
   *
   * @param symbol - The asset symbol
   * @param network - The network to use
   * @returns The asset information including address, name, and version
   */ getAssetInfo(symbol, network) {
        const upperSymbol = symbol.toUpperCase();
        if (upperSymbol === "USDC" || upperSymbol === "USD") {
            return this.getDefaultAsset(network);
        }
        throw new Error(`Unsupported asset: ${symbol} on network ${network}`);
    }
    /**
   * Get the number of decimals for the asset
   *
   * @param _ - The network to use (unused)
   * @returns The number of decimals for the asset
   */ getAssetDecimals(_) {
        return 6;
    }
};
// src/exact/server/register.ts
function registerExactEvmScheme(server, config = {}) {
    if (config.networks && config.networks.length > 0) {
        config.networks.forEach((network)=>{
            server.register(network, new ExactEvmScheme());
        });
    } else {
        server.register("eip155:*", new ExactEvmScheme());
    }
    return server;
}
;
 //# sourceMappingURL=index.mjs.map
}),
"[project]/typescript/packages/mechanisms/svm/dist/esm/chunk-ZAD54HVP.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/constants.ts
__turbopack_context__.s([
    "COMPUTE_BUDGET_PROGRAM_ADDRESS",
    ()=>COMPUTE_BUDGET_PROGRAM_ADDRESS,
    "DEFAULT_COMPUTE_UNIT_LIMIT",
    ()=>DEFAULT_COMPUTE_UNIT_LIMIT,
    "DEFAULT_COMPUTE_UNIT_PRICE_MICROLAMPORTS",
    ()=>DEFAULT_COMPUTE_UNIT_PRICE_MICROLAMPORTS,
    "DEVNET_RPC_URL",
    ()=>DEVNET_RPC_URL,
    "DEVNET_WS_URL",
    ()=>DEVNET_WS_URL,
    "MAINNET_RPC_URL",
    ()=>MAINNET_RPC_URL,
    "MAINNET_WS_URL",
    ()=>MAINNET_WS_URL,
    "MAX_COMPUTE_UNIT_PRICE_MICROLAMPORTS",
    ()=>MAX_COMPUTE_UNIT_PRICE_MICROLAMPORTS,
    "SOLANA_DEVNET_CAIP2",
    ()=>SOLANA_DEVNET_CAIP2,
    "SOLANA_MAINNET_CAIP2",
    ()=>SOLANA_MAINNET_CAIP2,
    "SOLANA_TESTNET_CAIP2",
    ()=>SOLANA_TESTNET_CAIP2,
    "SVM_ADDRESS_REGEX",
    ()=>SVM_ADDRESS_REGEX,
    "TESTNET_RPC_URL",
    ()=>TESTNET_RPC_URL,
    "TESTNET_WS_URL",
    ()=>TESTNET_WS_URL,
    "TOKEN_2022_PROGRAM_ADDRESS",
    ()=>TOKEN_2022_PROGRAM_ADDRESS,
    "TOKEN_PROGRAM_ADDRESS",
    ()=>TOKEN_PROGRAM_ADDRESS,
    "USDC_DEVNET_ADDRESS",
    ()=>USDC_DEVNET_ADDRESS,
    "USDC_MAINNET_ADDRESS",
    ()=>USDC_MAINNET_ADDRESS,
    "USDC_TESTNET_ADDRESS",
    ()=>USDC_TESTNET_ADDRESS,
    "V1_TO_V2_NETWORK_MAP",
    ()=>V1_TO_V2_NETWORK_MAP,
    "convertToTokenAmount",
    ()=>convertToTokenAmount,
    "createRpcClient",
    ()=>createRpcClient,
    "decodeTransactionFromPayload",
    ()=>decodeTransactionFromPayload,
    "getTokenPayerFromTransaction",
    ()=>getTokenPayerFromTransaction,
    "getUsdcAddress",
    ()=>getUsdcAddress,
    "normalizeNetwork",
    ()=>normalizeNetwork,
    "validateSvmAddress",
    ()=>validateSvmAddress
]);
// src/utils.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$strings$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+codecs-strings@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/codecs-strings/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$transactions$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$transactions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+transactions@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/transactions/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$transaction$2d$messages$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$transaction$2d$messages$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+transaction-messages@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/transaction-messages/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+rpc@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/rpc/dist/index.node.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana+rpc-types@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.9.2/node_modules/@solana/rpc-types/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2d$program$2b$token$40$0$2e$5$2e$1_$40$solana$2b$kit$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typesc_s3d7rnkvifsncz35usf6rbf3ty$2f$node_modules$2f40$solana$2d$program$2f$token$2f$dist$2f$src$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana-program+token@0.5.1_@solana+kit@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_typesc_s3d7rnkvifsncz35usf6rbf3ty/node_modules/@solana-program/token/dist/src/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2d$program$2b$token$2d$2022$40$0$2e$4$2e$2_$40$solana$2b$kit$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_t_oye4wn76jrmnwnoog7kxk5qdyq$2f$node_modules$2f40$solana$2d$program$2f$token$2d$2022$2f$dist$2f$src$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/@solana-program+token-2022@0.4.2_@solana+kit@2.3.0_fastestsmallesttextencoderdecoder@1.0.22_t_oye4wn76jrmnwnoog7kxk5qdyq/node_modules/@solana-program/token-2022/dist/src/index.mjs [app-route] (ecmascript)");
var TOKEN_PROGRAM_ADDRESS = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
var TOKEN_2022_PROGRAM_ADDRESS = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
var COMPUTE_BUDGET_PROGRAM_ADDRESS = "ComputeBudget111111111111111111111111111111";
var DEVNET_RPC_URL = "https://api.devnet.solana.com";
var TESTNET_RPC_URL = "https://api.testnet.solana.com";
var MAINNET_RPC_URL = "https://api.mainnet-beta.solana.com";
var DEVNET_WS_URL = "wss://api.devnet.solana.com";
var TESTNET_WS_URL = "wss://api.testnet.solana.com";
var MAINNET_WS_URL = "wss://api.mainnet-beta.solana.com";
var USDC_MAINNET_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
var USDC_DEVNET_ADDRESS = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
var USDC_TESTNET_ADDRESS = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
var DEFAULT_COMPUTE_UNIT_PRICE_MICROLAMPORTS = 1;
var MAX_COMPUTE_UNIT_PRICE_MICROLAMPORTS = 5e6;
var DEFAULT_COMPUTE_UNIT_LIMIT = 6500;
var SVM_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
var SOLANA_MAINNET_CAIP2 = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp";
var SOLANA_DEVNET_CAIP2 = "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1";
var SOLANA_TESTNET_CAIP2 = "solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z";
var V1_TO_V2_NETWORK_MAP = {
    solana: SOLANA_MAINNET_CAIP2,
    "solana-devnet": SOLANA_DEVNET_CAIP2,
    "solana-testnet": SOLANA_TESTNET_CAIP2
};
;
;
;
function normalizeNetwork(network) {
    if (network.includes(":")) {
        const supported = [
            SOLANA_MAINNET_CAIP2,
            SOLANA_DEVNET_CAIP2,
            SOLANA_TESTNET_CAIP2
        ];
        if (!supported.includes(network)) {
            throw new Error(`Unsupported SVM network: ${network}`);
        }
        return network;
    }
    const caip2Network = V1_TO_V2_NETWORK_MAP[network];
    if (!caip2Network) {
        throw new Error(`Unsupported SVM network: ${network}`);
    }
    return caip2Network;
}
function validateSvmAddress(address) {
    return SVM_ADDRESS_REGEX.test(address);
}
function decodeTransactionFromPayload(svmPayload) {
    try {
        const base64Encoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$codecs$2d$strings$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$codecs$2d$strings$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBase64Encoder"])();
        const transactionBytes = base64Encoder.encode(svmPayload.transaction);
        const transactionDecoder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$transactions$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$transactions$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTransactionDecoder"])();
        return transactionDecoder.decode(transactionBytes);
    } catch (error) {
        console.error("Error decoding transaction:", error);
        throw new Error("invalid_exact_svm_payload_transaction");
    }
}
function getTokenPayerFromTransaction(transaction) {
    const compiled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$transaction$2d$messages$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$transaction$2d$messages$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCompiledTransactionMessageDecoder"])().decode(transaction.messageBytes);
    const staticAccounts = compiled.staticAccounts ?? [];
    const instructions = compiled.instructions ?? [];
    for (const ix of instructions){
        const programIndex = ix.programAddressIndex;
        const programAddress = staticAccounts[programIndex].toString();
        if (programAddress === __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2d$program$2b$token$40$0$2e$5$2e$1_$40$solana$2b$kit$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typesc_s3d7rnkvifsncz35usf6rbf3ty$2f$node_modules$2f40$solana$2d$program$2f$token$2f$dist$2f$src$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TOKEN_PROGRAM_ADDRESS"].toString() || programAddress === __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2d$program$2b$token$2d$2022$40$0$2e$4$2e$2_$40$solana$2b$kit$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_t_oye4wn76jrmnwnoog7kxk5qdyq$2f$node_modules$2f40$solana$2d$program$2f$token$2d$2022$2f$dist$2f$src$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TOKEN_2022_PROGRAM_ADDRESS"].toString()) {
            const accountIndices = ix.accountIndices ?? [];
            if (accountIndices.length >= 4) {
                const ownerIndex = accountIndices[3];
                const ownerAddress = staticAccounts[ownerIndex].toString();
                if (ownerAddress) return ownerAddress;
            }
        }
    }
    return "";
}
function createRpcClient(network, customRpcUrl) {
    const caip2Network = normalizeNetwork(network);
    switch(caip2Network){
        case SOLANA_DEVNET_CAIP2:
            {
                const url = customRpcUrl || DEVNET_RPC_URL;
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSolanaRpc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["devnet"])(url));
            }
        case SOLANA_TESTNET_CAIP2:
            {
                const url = customRpcUrl || TESTNET_RPC_URL;
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSolanaRpc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["testnet"])(url));
            }
        case SOLANA_MAINNET_CAIP2:
            {
                const url = customRpcUrl || MAINNET_RPC_URL;
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSolanaRpc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f40$solana$2b$rpc$2d$types$40$2$2e$3$2e$0_fastestsmallesttextencoderdecoder$40$1$2e$0$2e$22_typescript$40$5$2e$9$2e$2$2f$node_modules$2f40$solana$2f$rpc$2d$types$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mainnet"])(url));
            }
        default:
            throw new Error(`Unsupported network: ${network}`);
    }
}
function getUsdcAddress(network) {
    const caip2Network = normalizeNetwork(network);
    switch(caip2Network){
        case SOLANA_MAINNET_CAIP2:
            return USDC_MAINNET_ADDRESS;
        case SOLANA_DEVNET_CAIP2:
            return USDC_DEVNET_ADDRESS;
        case SOLANA_TESTNET_CAIP2:
            return USDC_TESTNET_ADDRESS;
        default:
            throw new Error(`No USDC address configured for network: ${network}`);
    }
}
function convertToTokenAmount(decimalAmount, decimals) {
    const amount = parseFloat(decimalAmount);
    if (isNaN(amount)) {
        throw new Error(`Invalid amount: ${decimalAmount}`);
    }
    const [intPart, decPart = ""] = String(amount).split(".");
    const paddedDec = decPart.padEnd(decimals, "0").slice(0, decimals);
    const tokenAmount = (intPart + paddedDec).replace(/^0+/, "") || "0";
    return tokenAmount;
}
;
 //# sourceMappingURL=chunk-ZAD54HVP.mjs.map
}),
"[project]/typescript/packages/mechanisms/svm/dist/esm/exact/server/index.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ExactSvmScheme",
    ()=>ExactSvmScheme,
    "registerExactSvmScheme",
    ()=>registerExactSvmScheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$mechanisms$2f$svm$2f$dist$2f$esm$2f$chunk$2d$ZAD54HVP$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/typescript/packages/mechanisms/svm/dist/esm/chunk-ZAD54HVP.mjs [app-route] (ecmascript)");
;
// src/exact/server/scheme.ts
var ExactSvmScheme = class {
    constructor(){
        this.scheme = "exact";
        this.moneyParsers = [];
    }
    /**
   * Register a custom money parser in the parser chain.
   * Multiple parsers can be registered - they will be tried in registration order.
   * Each parser receives a decimal amount (e.g., 1.50 for $1.50).
   * If a parser returns null, the next parser in the chain will be tried.
   * The default parser is always the final fallback.
   *
   * @param parser - Custom function to convert amount to AssetAmount (or null to skip)
   * @returns The service instance for chaining
   */ registerMoneyParser(parser) {
        this.moneyParsers.push(parser);
        return this;
    }
    /**
   * Parses a price into an asset amount.
   * If price is already an AssetAmount, returns it directly.
   * If price is Money (string | number), parses to decimal and tries custom parsers.
   * Falls back to default conversion if all custom parsers return null.
   *
   * @param price - The price to parse
   * @param network - The network to use
   * @returns Promise that resolves to the parsed asset amount
   */ async parsePrice(price, network) {
        if (typeof price === "object" && price !== null && "amount" in price) {
            if (!price.asset) {
                throw new Error(`Asset address must be specified for AssetAmount on network ${network}`);
            }
            return {
                amount: price.amount,
                asset: price.asset,
                extra: price.extra || {}
            };
        }
        const amount = this.parseMoneyToDecimal(price);
        for (const parser of this.moneyParsers){
            const result = await parser(amount, network);
            if (result !== null) {
                return result;
            }
        }
        return this.defaultMoneyConversion(amount, network);
    }
    /**
   * Build payment requirements for this scheme/network combination
   *
   * @param paymentRequirements - The base payment requirements
   * @param supportedKind - The supported kind configuration
   * @param supportedKind.x402Version - The x402 protocol version
   * @param supportedKind.scheme - The payment scheme
   * @param supportedKind.network - The network identifier
   * @param supportedKind.extra - Extra metadata including feePayer address
   * @param extensionKeys - Extension keys supported by the facilitator
   * @returns Enhanced payment requirements with feePayer in extra
   */ enhancePaymentRequirements(paymentRequirements, supportedKind, extensionKeys) {
        void extensionKeys;
        return Promise.resolve({
            ...paymentRequirements,
            extra: {
                ...paymentRequirements.extra,
                feePayer: supportedKind.extra?.feePayer
            }
        });
    }
    /**
   * Parse Money (string | number) to a decimal number.
   * Handles formats like "$1.50", "1.50", 1.50, etc.
   *
   * @param money - The money value to parse
   * @returns Decimal number
   */ parseMoneyToDecimal(money) {
        if (typeof money === "number") {
            return money;
        }
        const cleanMoney = money.replace(/^\$/, "").trim();
        const amount = parseFloat(cleanMoney);
        if (isNaN(amount)) {
            throw new Error(`Invalid money format: ${money}`);
        }
        return amount;
    }
    /**
   * Default money conversion implementation.
   * Converts decimal amount to USDC on the specified network.
   *
   * @param amount - The decimal amount (e.g., 1.50)
   * @param network - The network to use
   * @returns The parsed asset amount in USDC
   */ defaultMoneyConversion(amount, network) {
        const tokenAmount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$mechanisms$2f$svm$2f$dist$2f$esm$2f$chunk$2d$ZAD54HVP$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["convertToTokenAmount"])(amount.toString(), 6);
        return {
            amount: tokenAmount,
            asset: (0, __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$mechanisms$2f$svm$2f$dist$2f$esm$2f$chunk$2d$ZAD54HVP$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUsdcAddress"])(network),
            extra: {}
        };
    }
};
// src/exact/server/register.ts
function registerExactSvmScheme(server, config = {}) {
    if (config.networks && config.networks.length > 0) {
        config.networks.forEach((network)=>{
            server.register(network, new ExactSvmScheme());
        });
    } else {
        server.register("solana:*", new ExactSvmScheme());
    }
    return server;
}
;
 //# sourceMappingURL=index.mjs.map
}),
];

//# sourceMappingURL=typescript_packages_fb196925._.js.map