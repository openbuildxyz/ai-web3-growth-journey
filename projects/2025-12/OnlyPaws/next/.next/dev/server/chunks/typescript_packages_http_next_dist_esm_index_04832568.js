module.exports = [
"[project]/typescript/packages/http/next/dist/esm/index.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

// src/index.ts
__turbopack_context__.s([
    "NextAdapter",
    ()=>NextAdapter,
    "paymentProxy",
    ()=>paymentProxy,
    "paymentProxyFromConfig",
    ()=>paymentProxyFromConfig,
    "withX402",
    ()=>withX402
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$server$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/typescript/packages/core/dist/esm/server/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_$40$babel$2b$core$40$7$2e$28$2e$3_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/next@16.0.10_@babel+core@7.28.3_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$RCHDDVGC$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/typescript/packages/core/dist/esm/chunk-RCHDDVGC.mjs [app-route] (ecmascript)");
;
;
;
;
// src/adapter.ts
var NextAdapter = class {
    /**
   * Creates a new NextAdapter instance.
   *
   * @param req - The Next.js request object
   */ constructor(req){
        this.req = req;
    }
    /**
   * Gets a header value from the request.
   *
   * @param name - The header name
   * @returns The header value or undefined
   */ getHeader(name) {
        return this.req.headers.get(name) || void 0;
    }
    /**
   * Gets the HTTP method of the request.
   *
   * @returns The HTTP method
   */ getMethod() {
        return this.req.method;
    }
    /**
   * Gets the path of the request.
   *
   * @returns The request path
   */ getPath() {
        return this.req.nextUrl.pathname;
    }
    /**
   * Gets the full URL of the request.
   *
   * @returns The full request URL
   */ getUrl() {
        return this.req.url;
    }
    /**
   * Gets the Accept header from the request.
   *
   * @returns The Accept header value or empty string
   */ getAcceptHeader() {
        return this.req.headers.get("Accept") || "";
    }
    /**
   * Gets the User-Agent header from the request.
   *
   * @returns The User-Agent header value or empty string
   */ getUserAgent() {
        return this.req.headers.get("User-Agent") || "";
    }
    /**
   * Gets all query parameters from the request URL.
   *
   * @returns Record of query parameter key-value pairs
   */ getQueryParams() {
        const params = {};
        this.req.nextUrl.searchParams.forEach((value, key)=>{
            const existing = params[key];
            if (existing) {
                if (Array.isArray(existing)) {
                    existing.push(value);
                } else {
                    params[key] = [
                        existing,
                        value
                    ];
                }
            } else {
                params[key] = value;
            }
        });
        return params;
    }
    /**
   * Gets a specific query parameter by name.
   *
   * @param name - The query parameter name
   * @returns The query parameter value(s) or undefined
   */ getQueryParam(name) {
        const all = this.req.nextUrl.searchParams.getAll(name);
        if (all.length === 0) return void 0;
        if (all.length === 1) return all[0];
        return all;
    }
    /**
   * Gets the parsed request body.
   *
   * @returns Promise resolving to the parsed request body
   */ async getBody() {
        try {
            return await this.req.json();
        } catch  {
            return void 0;
        }
    }
};
// src/utils.ts
function createHttpServer(routes, server, paywall, syncFacilitatorOnStart = true) {
    const httpServer = new __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$RCHDDVGC$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["x402HTTPResourceServer"](server, routes);
    if (paywall) {
        httpServer.registerPaywallProvider(paywall);
    }
    let initPromise = syncFacilitatorOnStart ? httpServer.initialize() : null;
    return {
        httpServer,
        async init () {
            if (initPromise) {
                await initPromise;
                initPromise = null;
            }
        }
    };
}
function createRequestContext(request) {
    const adapter = new NextAdapter(request);
    return {
        adapter,
        path: request.nextUrl.pathname,
        method: request.method,
        paymentHeader: adapter.getHeader("payment-signature") || adapter.getHeader("x-payment")
    };
}
function handlePaymentError(response) {
    const headers = new Headers(response.headers);
    if (response.isHtml) {
        headers.set("Content-Type", "text/html");
        return new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_$40$babel$2b$core$40$7$2e$28$2e$3_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](response.body, {
            status: response.status,
            headers
        });
    }
    headers.set("Content-Type", "application/json");
    return new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_$40$babel$2b$core$40$7$2e$28$2e$3_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](JSON.stringify(response.body || {}), {
        status: response.status,
        headers
    });
}
async function handleSettlement(httpServer, response, paymentPayload, paymentRequirements) {
    if (response.status >= 400) {
        return response;
    }
    try {
        const result = await httpServer.processSettlement(paymentPayload, paymentRequirements);
        if (!result.success) {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_$40$babel$2b$core$40$7$2e$28$2e$3_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](JSON.stringify({
                error: "Settlement failed",
                details: result.errorReason
            }), {
                status: 402,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }
        Object.entries(result.headers).forEach(([key, value])=>{
            response.headers.set(key, value);
        });
        return response;
    } catch (error) {
        console.error("Settlement failed:", error);
        return new __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_$40$babel$2b$core$40$7$2e$28$2e$3_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](JSON.stringify({
            error: "Settlement failed",
            details: error instanceof Error ? error.message : "Unknown error"
        }), {
            status: 402,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}
;
function paymentProxy(routes, server, paywallConfig, paywall, syncFacilitatorOnStart = true) {
    const { httpServer, init } = createHttpServer(routes, server, paywall, syncFacilitatorOnStart);
    let bazaarPromise = null;
    if (checkIfBazaarNeeded(routes)) {
        bazaarPromise = import(/* webpackIgnore: true */ "@x402/extensions/bazaar").then(({ bazaarResourceServerExtension })=>{
            server.registerExtension(bazaarResourceServerExtension);
        }).catch((err)=>{
            console.error("Failed to load bazaar extension:", err);
        });
    }
    return async (req)=>{
        const context = createRequestContext(req);
        if (!httpServer.requiresPayment(context)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_$40$babel$2b$core$40$7$2e$28$2e$3_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].next();
        }
        await init();
        if (bazaarPromise) {
            await bazaarPromise;
            bazaarPromise = null;
        }
        const result = await httpServer.processHTTPRequest(context, paywallConfig);
        switch(result.type){
            case "no-payment-required":
                return __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_$40$babel$2b$core$40$7$2e$28$2e$3_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].next();
            case "payment-error":
                return handlePaymentError(result.response);
            case "payment-verified":
                {
                    const { paymentPayload, paymentRequirements } = result;
                    const nextResponse = __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_$40$babel$2b$core$40$7$2e$28$2e$3_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].next();
                    return handleSettlement(httpServer, nextResponse, paymentPayload, paymentRequirements);
                }
        }
    };
}
function paymentProxyFromConfig(routes, facilitatorClients, schemes, paywallConfig, paywall, syncFacilitatorOnStart = true) {
    const ResourceServer = new __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$server$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["x402ResourceServer"](facilitatorClients);
    if (schemes) {
        schemes.forEach(({ network, server: schemeServer })=>{
            ResourceServer.register(network, schemeServer);
        });
    }
    return paymentProxy(routes, ResourceServer, paywallConfig, paywall, syncFacilitatorOnStart);
}
function withX402(routeHandler, routeConfig, server, paywallConfig, paywall, syncFacilitatorOnStart = true) {
    const routes = {
        "*": routeConfig
    };
    const { httpServer, init } = createHttpServer(routes, server, paywall, syncFacilitatorOnStart);
    let bazaarPromise = null;
    if (checkIfBazaarNeeded(routes)) {
        bazaarPromise = import(/* webpackIgnore: true */ "@x402/extensions/bazaar").then(({ bazaarResourceServerExtension })=>{
            server.registerExtension(bazaarResourceServerExtension);
        }).catch((err)=>{
            console.error("Failed to load bazaar extension:", err);
        });
    }
    return async (request)=>{
        await init();
        if (bazaarPromise) {
            await bazaarPromise;
            bazaarPromise = null;
        }
        const context = createRequestContext(request);
        const result = await httpServer.processHTTPRequest(context, paywallConfig);
        switch(result.type){
            case "no-payment-required":
                return routeHandler(request);
            case "payment-error":
                return handlePaymentError(result.response);
            case "payment-verified":
                {
                    const { paymentPayload, paymentRequirements } = result;
                    const handlerResponse = await routeHandler(request);
                    return handleSettlement(httpServer, handlerResponse, paymentPayload, paymentRequirements);
                }
        }
    };
}
function checkIfBazaarNeeded(routes) {
    if ("accepts" in routes) {
        return !!(routes.extensions && "bazaar" in routes.extensions);
    }
    return Object.values(routes).some((routeConfig)=>{
        return !!(routeConfig.extensions && "bazaar" in routeConfig.extensions);
    });
}
;
 //# sourceMappingURL=index.js.map
}),
];

//# sourceMappingURL=typescript_packages_http_next_dist_esm_index_04832568.js.map