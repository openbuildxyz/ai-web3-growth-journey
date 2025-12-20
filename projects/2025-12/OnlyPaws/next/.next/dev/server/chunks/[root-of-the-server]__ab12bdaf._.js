module.exports = [
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/lib/incremental-cache/tags-manifest.external.js [external] (next/dist/server/lib/incremental-cache/tags-manifest.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/lib/incremental-cache/tags-manifest.external.js", () => require("next/dist/server/lib/incremental-cache/tags-manifest.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/examples/typescript/fullstack/next/proxy.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
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
(()=>{
    const e = new Error("Cannot find module '@x402/next'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@x402/core/server'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@x402/evm/exact/server'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@x402/svm/exact/server'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@x402/paywall'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@x402/paywall/evm'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@x402/paywall/svm'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@x402/extensions/bazaar'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
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
const facilitatorClient = new HTTPFacilitatorClient({
    url: facilitatorUrl
});
const server = new x402ResourceServer(facilitatorClient);
// Register schemes
registerExactEvmScheme(server);
registerExactSvmScheme(server);
const paywall = createPaywall().withNetwork(evmPaywall).withNetwork(svmPaywall).withConfig({
    appName: process.env.APP_NAME || "Next x402 Demo",
    appLogo: process.env.APP_LOGO || "/x402-icon-blue.png",
    testnet: true
}).build();
const proxy = paymentProxy({
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
            ...declareDiscoveryExtension({})
        }
    }
}, server, undefined, paywall);
const config = {
    matcher: [
        "/protected/:path*"
    ]
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ab12bdaf._.js.map