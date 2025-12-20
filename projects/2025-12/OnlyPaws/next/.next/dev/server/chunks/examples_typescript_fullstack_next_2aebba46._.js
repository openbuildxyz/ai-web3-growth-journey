module.exports = [
"[project]/examples/typescript/fullstack/next/proxy.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "evmAddress",
    ()=>evmAddress,
    "paywall",
    ()=>paywall,
    "proxy",
    ()=>proxy,
    "server",
    ()=>server,
    "svmAddress",
    ()=>svmAddress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$http$2f$next$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/typescript/packages/http/next/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$server$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/typescript/packages/core/dist/esm/server/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$RCHDDVGC$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/typescript/packages/core/dist/esm/chunk-RCHDDVGC.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$mechanisms$2f$evm$2f$dist$2f$esm$2f$exact$2f$server$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/typescript/packages/mechanisms/evm/dist/esm/exact/server/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$mechanisms$2f$svm$2f$dist$2f$esm$2f$exact$2f$server$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/typescript/packages/mechanisms/svm/dist/esm/exact/server/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$http$2f$paywall$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/typescript/packages/http/paywall/dist/esm/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$http$2f$paywall$2f$dist$2f$esm$2f$evm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/typescript/packages/http/paywall/dist/esm/evm/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$http$2f$paywall$2f$dist$2f$esm$2f$svm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/typescript/packages/http/paywall/dist/esm/svm/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$extensions$2f$dist$2f$esm$2f$bazaar$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/typescript/packages/extensions/dist/esm/bazaar/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$extensions$2f$dist$2f$esm$2f$chunk$2d$STXY3Q5R$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/typescript/packages/extensions/dist/esm/chunk-STXY3Q5R.mjs [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
const facilitatorUrl = process.env.FACILITATOR_URL;
const evmAddress = process.env.EVM_ADDRESS;
const svmAddress = process.env.SVM_ADDRESS;
if (!facilitatorUrl) {
    console.error("❌ FACILITATOR_URL environment variable is required");
    process.exit(1);
}
if (!evmAddress || !svmAddress) {
    console.error("❌ EVM_ADDRESS and SVM_ADDRESS environment variables are required");
    process.exit(1);
}
// Create HTTP facilitator client
const facilitatorClient = new __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$chunk$2d$RCHDDVGC$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HTTPFacilitatorClient"]({
    url: facilitatorUrl
});
const server = new __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$core$2f$dist$2f$esm$2f$server$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["x402ResourceServer"](facilitatorClient);
// Register schemes
(0, __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$mechanisms$2f$evm$2f$dist$2f$esm$2f$exact$2f$server$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerExactEvmScheme"])(server);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$mechanisms$2f$svm$2f$dist$2f$esm$2f$exact$2f$server$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerExactSvmScheme"])(server);
const paywall = (0, __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$http$2f$paywall$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createPaywall"])().withNetwork(__TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$http$2f$paywall$2f$dist$2f$esm$2f$evm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["evmPaywall"]).withNetwork(__TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$http$2f$paywall$2f$dist$2f$esm$2f$svm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["svmPaywall"]).withConfig({
    appName: process.env.APP_NAME || "Next x402 Demo",
    appLogo: process.env.APP_LOGO || "/x402-icon-blue.png",
    testnet: true
}).build();
const proxy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$http$2f$next$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["paymentProxy"])({
    "/protected": {
        accepts: [
            {
                scheme: "exact",
                price: "$0.001",
                network: "eip155:84532",
                payTo: evmAddress
            },
            {
                scheme: "exact",
                price: "$0.001",
                network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
                payTo: svmAddress
            }
        ],
        description: "Premium music: x402 Remix",
        mimeType: "text/html",
        extensions: {
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$extensions$2f$dist$2f$esm$2f$chunk$2d$STXY3Q5R$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["declareDiscoveryExtension"])({})
        }
    }
}, server, undefined, paywall);
const config = {
    matcher: [
        "/protected/:path*"
    ]
};
}),
"[project]/examples/typescript/fullstack/next/app/api/weather/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_$40$babel$2b$core$40$7$2e$28$2e$3_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/node_modules/.pnpm/next@16.0.10_@babel+core@7.28.3_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$http$2f$next$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/typescript/packages/http/next/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$extensions$2f$dist$2f$esm$2f$bazaar$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/typescript/packages/extensions/dist/esm/bazaar/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$extensions$2f$dist$2f$esm$2f$chunk$2d$STXY3Q5R$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/typescript/packages/extensions/dist/esm/chunk-STXY3Q5R.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$fullstack$2f$next$2f$proxy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/examples/typescript/fullstack/next/proxy.ts [app-route] (ecmascript)");
;
;
;
;
/**
 * Weather API endpoint handler
 *
 * This handler returns weather data after payment verification.
 * Payment is only settled after a successful response (status < 400).
 *
 * @param _ - Incoming Next.js request
 * @returns JSON response with weather data
 */ const handler = async (_)=>{
    return __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_$40$babel$2b$core$40$7$2e$28$2e$3_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        report: {
            weather: "sunny",
            temperature: 72
        }
    }, {
        status: 200
    });
};
const GET = (0, __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$http$2f$next$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["withX402"])(handler, {
    accepts: [
        {
            scheme: "exact",
            price: "$0.001",
            network: "eip155:84532",
            payTo: __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$fullstack$2f$next$2f$proxy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["evmAddress"]
        },
        {
            scheme: "exact",
            price: "$0.001",
            network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
            payTo: __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$fullstack$2f$next$2f$proxy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["svmAddress"]
        }
    ],
    description: "Access to weather API",
    mimeType: "application/json",
    extensions: {
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$typescript$2f$packages$2f$extensions$2f$dist$2f$esm$2f$chunk$2d$STXY3Q5R$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["declareDiscoveryExtension"])({
            output: {
                example: {
                    report: {
                        weather: "sunny",
                        temperature: 72
                    }
                }
            }
        })
    }
}, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$fullstack$2f$next$2f$proxy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["server"], undefined, __TURBOPACK__imported__module__$5b$project$5d2f$examples$2f$typescript$2f$fullstack$2f$next$2f$proxy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["paywall"]);
}),
];

//# sourceMappingURL=examples_typescript_fullstack_next_2aebba46._.js.map