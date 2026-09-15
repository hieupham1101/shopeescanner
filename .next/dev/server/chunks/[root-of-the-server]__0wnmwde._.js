module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[project]/src/app/api/pack-check/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic,
    "maxDuration",
    ()=>maxDuration,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$packRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/packRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$normalization$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/normalization.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$packRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$packRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const runtime = 'nodejs';
const dynamic = 'force-dynamic';
const maxDuration = 60;
const text = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(4000);
const order = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    orderId: text,
    trackingCode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(512).transform(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$normalization$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeTrackingCode"]).pipe(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)),
    orderStatus: text,
    cancellationReason: text.optional(),
    carrier: text.optional(),
    shippingMethod: text.optional(),
    shipDate: text.optional(),
    deliveryTime: text.optional(),
    returnRefundStatus: text.optional()
});
const dataset = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    orders: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(order).min(1).max(150000),
    metadata: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        filename: text,
        importedAt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().finite(),
        total: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().nonnegative(),
        waiting: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().nonnegative(),
        shipping: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().nonnegative(),
        cancelled: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().nonnegative(),
        skipped: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().nonnegative(),
        merged: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().nonnegative()
    })
});
const record = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid(),
    trackingCode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(512),
    status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'ACCEPTED',
        'DUPLICATE',
        'CANCELLED',
        'PICKED_UP',
        'UNKNOWN'
    ]),
    scannedAt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().nonnegative(),
    orderId: text.optional(),
    carrier: text.optional(),
    firstScannedAt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().nonnegative().optional(),
    scanCount: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional()
});
const mutation = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].discriminatedUnion('action', [
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        action: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('scan'),
        requestId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid(),
        trackingCode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(512)
    }),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        action: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('import'),
        requestId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid(),
        data: dataset,
        clear: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean()
    }),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        action: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('reset'),
        requestId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid()
    }),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        action: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].literal('migrate'),
        requestId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid(),
        data: dataset,
        history: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(record).max(1000000)
    })
]);
function json(data, status = 200) {
    return Response.json(data, {
        status,
        headers: {
            'Cache-Control': 'no-store'
        }
    });
}
function failure(error) {
    if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$packRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RequestError"]) return json({
        error: error.message
    }, error.status);
    if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].ZodError || error instanceof SyntaxError) return json({
        error: 'Invalid request data.'
    }, 400);
    console.error('Pack Check database operation failed', error instanceof Error ? error.name : 'UnknownError');
    return json({
        error: 'Không kết nối được database. Dừng bàn giao và thử lại khi có mạng.'
    }, 503);
}
async function GET(request) {
    try {
        const url = new URL(request.url);
        if (url.searchParams.get('view') === 'history') {
            const offset = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.number().int().min(0).max(10000000).parse(url.searchParams.get('offset') ?? 0);
            const limit = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.number().int().min(1).max(100).parse(url.searchParams.get('limit') ?? 20);
            return json(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$packRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getHistory"])(offset, limit));
        }
        return json(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$packRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getState"])());
    } catch (error) {
        return failure(error);
    }
}
async function POST(request) {
    try {
        const origin = request.headers.get('origin');
        if (origin && origin !== new URL(request.url).origin) return json({
            error: 'Cross-origin requests are not allowed.'
        }, 403);
        if (!request.headers.get('content-type')?.includes('application/json')) return json({
            error: 'JSON required.'
        }, 415);
        if (Number(request.headers.get('content-length')) > 100 * 1024 * 1024) return json({
            error: 'Import is too large.'
        }, 413);
        const body = mutation.parse(await request.json());
        if (body.action === 'scan') return json(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$packRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["scanTrackingCode"])(body.trackingCode, body.requestId));
        if (body.action === 'import') return json(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$packRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["importDataset"])(body.data, body.clear, body.requestId));
        if (body.action === 'reset') return json(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$packRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clearScanHistory"])(body.requestId));
        return json(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$packRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["migrateLocalData"])(body.data, body.history, body.requestId));
    } catch (error) {
        return failure(error);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/importComparison.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compareImports",
    ()=>compareImports
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$orderStatus$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/orderStatus.ts [app-route] (ecmascript)");
;
function compareImports(previous, incoming, accepted) {
    const old = new Map(previous.map((order)=>[
            order.trackingCode,
            order
        ]));
    const next = new Map(incoming.map((order)=>[
            order.trackingCode,
            order
        ]));
    const scanned = new Set(accepted.map((item)=>item.trackingCode));
    let newlyAvailable = 0;
    for (const order of next.values()){
        const before = old.get(order.trackingCode);
        if (!scanned.has(order.trackingCode) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$orderStatus$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["determineOrderStatus"])(order) === 'AVAILABLE' && (!before || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$orderStatus$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["determineOrderStatus"])(before) !== 'AVAILABLE')) newlyAvailable++;
    }
    const issues = [];
    for (const item of accepted){
        const current = next.get(item.trackingCode);
        if (current && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$orderStatus$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["determineOrderStatus"])(current) !== 'CANCELLED') continue;
        const before = old.get(item.trackingCode);
        issues.push({
            trackingCode: item.trackingCode,
            orderId: current?.orderId ?? before?.orderId,
            carrier: current?.carrier ?? before?.carrier,
            firstScannedAt: item.firstScannedAt,
            kind: current ? 'CANCELLED' : 'MISSING',
            previousStatus: before?.orderStatus,
            currentStatus: current?.orderStatus
        });
    }
    issues.sort((a, b)=>a.kind.localeCompare(b.kind) || a.trackingCode.localeCompare(b.trackingCode));
    return {
        newlyAvailable,
        issues
    };
}
}),
"[project]/src/lib/normalization.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeText",
    ()=>normalizeText,
    "normalizeTrackingCode",
    ()=>normalizeTrackingCode
]);
function normalizeTrackingCode(value) {
    return String(value ?? "").normalize("NFKC").replace(/[\s\u200B-\u200D\uFEFF]/g, "").toUpperCase();
}
function normalizeText(value) {
    return String(value ?? "").normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("vi");
}
}),
"[project]/src/lib/orderStatus.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "determineOrderStatus",
    ()=>determineOrderStatus,
    "isCancelled",
    ()=>isCancelled,
    "isPickedUp",
    ()=>isPickedUp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$normalization$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/normalization.ts [app-route] (ecmascript)");
;
const emptyReasons = new Set([
    "",
    "-",
    "--",
    "n/a",
    "na",
    "null",
    "none",
    "không",
    "không có",
    "0"
]);
function isCancelled(order) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$normalization$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeText"])(order.orderStatus) === "đã hủy" || !emptyReasons.has((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$normalization$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeText"])(order.cancellationReason));
}
function isPickedUp(order) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$normalization$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeText"])(order.orderStatus) === "đang giao";
}
function determineOrderStatus(order) {
    return isCancelled(order) ? "CANCELLED" : isPickedUp(order) ? "PICKED_UP" : "AVAILABLE";
}
}),
"[project]/src/server/database.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "initializeDatabase",
    ()=>initializeDatabase,
    "pool",
    ()=>pool,
    "table",
    ()=>table,
    "transaction",
    ()=>transaction
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/node_modules/pg)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const schema = process.env.PACK_CHECK_DB_SCHEMA || 'pack_check';
if (!/^[a-z][a-z0-9_]*$/.test(schema)) throw new Error('Invalid database schema');
const globals = globalThis;
function pool() {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
    const url = new URL(process.env.DATABASE_URL);
    if (url.searchParams.get('sslmode') === 'require') url.searchParams.set('sslmode', 'verify-full');
    return globals.packPool ??= new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["Pool"]({
        connectionString: url.toString(),
        max: 5,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
        statement_timeout: 30000
    });
}
function table(name) {
    return `"${schema}"."${name}"`;
}
async function initializeDatabase() {
    globals.packInit ??= (async ()=>{
        const client = await pool().connect();
        try {
            await client.query('BEGIN');
            await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
                'pack-check-schema-' + schema
            ]);
            await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}";
        CREATE TABLE IF NOT EXISTS ${table('workspace')} (id integer PRIMARY KEY CHECK (id=1), metadata jsonb, counters jsonb NOT NULL, revision bigint NOT NULL DEFAULT 0);
        INSERT INTO ${table('workspace')} (id,counters) VALUES (1,'{"ACCEPTED":0,"DUPLICATE":0,"CANCELLED":0,"PICKED_UP":0,"UNKNOWN":0}') ON CONFLICT DO NOTHING;
        CREATE TABLE IF NOT EXISTS ${table('orders')} (tracking_code text PRIMARY KEY, data jsonb NOT NULL);
        CREATE TABLE IF NOT EXISTS ${table('accepted')} (tracking_code text PRIMARY KEY, data jsonb NOT NULL);
        CREATE TABLE IF NOT EXISTS ${table('history')} (id uuid PRIMARY KEY, scanned_at bigint NOT NULL, data jsonb NOT NULL);
        CREATE INDEX IF NOT EXISTS history_time ON ${table('history')} (scanned_at DESC,id DESC);
        CREATE TABLE IF NOT EXISTS ${table('operations')} (id uuid PRIMARY KEY, kind text NOT NULL, response jsonb NOT NULL);
      `);
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally{
            client.release();
        }
    })().catch((error)=>{
        globals.packInit = undefined;
        throw error;
    });
    await globals.packInit;
}
async function transaction(fn) {
    await initializeDatabase();
    const client = await pool().connect();
    try {
        await client.query('BEGIN');
        // One operator workspace: serialize imports, resets and scans across devices.
        await client.query(`SELECT id FROM ${table('workspace')} WHERE id=1 FOR UPDATE`);
        const value = await fn(client);
        await client.query('COMMIT');
        return value;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally{
        client.release();
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/server/packRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "RequestError",
    ()=>RequestError,
    "clearScanHistory",
    ()=>clearScanHistory,
    "getHistory",
    ()=>getHistory,
    "getState",
    ()=>getState,
    "importDataset",
    ()=>importDataset,
    "migrateLocalData",
    ()=>migrateLocalData,
    "scanTrackingCode",
    ()=>scanTrackingCode
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$importComparison$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/importComparison.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/database.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$normalization$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/normalization.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$orderStatus$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/orderStatus.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$scan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/scan.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
class RequestError extends Error {
    status;
    constructor(message, status = 400){
        super(message), this.status = status;
    }
}
async function state(client) {
    const { rows } = await client.query(`SELECT metadata,counters,revision::text FROM ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["table"])('workspace')} WHERE id=1`);
    return rows[0];
}
async function getState() {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initializeDatabase"])();
    return state((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pool"])());
}
async function getHistory(offset, limit) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initializeDatabase"])();
    const { rows } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pool"])().query(`SELECT data FROM ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["table"])('history')} ORDER BY scanned_at DESC,id DESC LIMIT $1 OFFSET $2`, [
        limit,
        offset
    ]);
    return rows.map((row)=>row.data);
}
async function prior(client, id, kind) {
    const { rows } = await client.query(`SELECT kind,response FROM ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["table"])('operations')} WHERE id=$1`, [
        id
    ]);
    if (rows[0] && rows[0].kind !== kind) throw new RequestError('Request ID already used', 409);
    return rows[0]?.response;
}
async function remember(client, id, kind, response) {
    await client.query(`INSERT INTO ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["table"])('operations')} (id,kind,response) VALUES ($1,$2,$3::jsonb)`, [
        id,
        kind,
        JSON.stringify(response)
    ]);
}
async function scanTrackingCode(rawCode, requestId) {
    const trackingCode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$normalization$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeTrackingCode"])(rawCode);
    if (!trackingCode || trackingCode.length > 512) throw new RequestError('Invalid tracking code');
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transaction"])(async (client)=>{
        const previous = await prior(client, requestId, 'scan');
        if (previous) {
            if (previous.record.trackingCode !== trackingCode) throw new RequestError('Request ID does not match this parcel', 409);
            return previous;
        }
        const workspace = await state(client);
        if (!workspace.metadata) throw new RequestError('Import a Shopee file before scanning.', 409);
        const lookup = await client.query(`SELECT (SELECT data FROM ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["table"])('orders')} WHERE tracking_code=$1) AS "order", (SELECT data FROM ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["table"])('accepted')} WHERE tracking_code=$1) AS accepted`, [
            trackingCode
        ]);
        const order = lookup.rows[0].order;
        const accepted = lookup.rows[0].accepted;
        const availability = order ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$orderStatus$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["determineOrderStatus"])(order) : null;
        const status = !order ? 'UNKNOWN' : availability !== 'AVAILABLE' ? availability : accepted ? 'DUPLICATE' : 'ACCEPTED';
        const scannedAt = Date.now();
        const record = {
            id: requestId,
            trackingCode,
            status,
            scannedAt,
            order: order || undefined,
            orderId: order?.orderId,
            carrier: order?.carrier
        };
        if (status === 'ACCEPTED' || status === 'DUPLICATE') {
            record.firstScannedAt = accepted?.firstScannedAt ?? scannedAt;
            record.scanCount = (accepted?.scanCount ?? 0) + 1;
            const value = {
                trackingCode,
                firstScannedAt: record.firstScannedAt,
                lastScannedAt: scannedAt,
                scanCount: record.scanCount
            };
            await client.query(`INSERT INTO ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["table"])('accepted')} (tracking_code,data) VALUES ($1,$2::jsonb) ON CONFLICT (tracking_code) DO UPDATE SET data=EXCLUDED.data`, [
                trackingCode,
                JSON.stringify(value)
            ]);
        }
        const counters = workspace.counters;
        counters[status]++;
        await client.query(`WITH saved AS (INSERT INTO ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["table"])('history')} (id,scanned_at,data) VALUES ($1,$2,$3::jsonb)) UPDATE ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["table"])('workspace')} SET counters=$4::jsonb,revision=revision+1 WHERE id=1`, [
            record.id,
            scannedAt,
            JSON.stringify(record),
            JSON.stringify(counters)
        ]);
        const response = {
            record,
            counters
        };
        await remember(client, requestId, 'scan', response);
        return response;
    });
}
async function putOrders(client, data) {
    await client.query(`DELETE FROM ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["table"])('orders')}`);
    for(let i = 0; i < data.orders.length; i += 2000){
        await client.query(`INSERT INTO ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["table"])('orders')} (tracking_code,data) SELECT value->>'trackingCode',value FROM jsonb_array_elements($1::jsonb) ON CONFLICT(tracking_code) DO UPDATE SET data=EXCLUDED.data`, [
            JSON.stringify(data.orders.slice(i, i + 2000))
        ]);
    }
    const values = data.orders;
    const metadata = {
        ...data.metadata,
        importedAt: Date.now(),
        total: values.length,
        cancelled: values.filter((o)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$orderStatus$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["determineOrderStatus"])(o) === 'CANCELLED').length,
        shipping: values.filter((o)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$orderStatus$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["determineOrderStatus"])(o) === 'PICKED_UP').length,
        waiting: values.filter((o)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$orderStatus$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["determineOrderStatus"])(o) === 'AVAILABLE' && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$normalization$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeText"])(o.orderStatus) === 'chờ giao hàng').length
    };
    await client.query(`UPDATE ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["table"])('workspace')} SET metadata=$1::jsonb,revision=revision+1 WHERE id=1`, [
        JSON.stringify(metadata)
    ]);
}
async function clearHistory(client) {
    await client.query(`DELETE FROM ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["table"])('history')}; DELETE FROM ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["table"])('accepted')}`);
    await client.query(`UPDATE ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["table"])('workspace')} SET counters=$1::jsonb,revision=revision+1 WHERE id=1`, [
        JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$scan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["emptyCounters"])())
    ]);
}
async function importDataset(data, clear, id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])()) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transaction"])(async (client)=>{
        const previous = await prior(client, id, 'import');
        if (previous) return previous;
        const workspace = await state(client);
        // Compare under the same workspace lock as scans and replacement, before clearing history.
        const comparison = workspace.metadata ? await (async ()=>{
            const old = await client.query(`SELECT data FROM ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["table"])('orders')}`);
            const accepted = await client.query(`SELECT data FROM ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["table"])('accepted')}`);
            return {
                ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$importComparison$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["compareImports"])(old.rows.map((row)=>row.data), data.orders, accepted.rows.map((row)=>row.data)),
                previousFilename: workspace.metadata.filename,
                comparedAt: Date.now(),
                historyCleared: clear
            };
        })() : undefined;
        await putOrders(client, {
            ...data,
            metadata: {
                ...data.metadata,
                comparison
            }
        });
        if (clear) await clearHistory(client);
        const response = await state(client);
        await remember(client, id, 'import', response);
        return response;
    });
}
async function clearScanHistory(id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])()) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transaction"])(async (client)=>{
        const previous = await prior(client, id, 'reset');
        if (previous) return previous;
        await clearHistory(client);
        const response = await state(client);
        await remember(client, id, 'reset', response);
        return response;
    });
}
async function migrateLocalData(data, history, id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transaction"])(async (client)=>{
        const previous = await prior(client, id, 'migrate');
        if (previous) return previous;
        const workspace = await state(client);
        if (workspace.metadata) return {
            migrated: false
        };
        await putOrders(client, data);
        const accepted = new Map();
        const counters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$scan$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["emptyCounters"])();
        for (const row of [
            ...history
        ].sort((a, b)=>a.scannedAt - b.scannedAt)){
            row.trackingCode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$normalization$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeTrackingCode"])(row.trackingCode);
            counters[row.status]++;
            if (row.status === 'ACCEPTED' || row.status === 'DUPLICATE') {
                const old = accepted.get(row.trackingCode);
                accepted.set(row.trackingCode, {
                    trackingCode: row.trackingCode,
                    firstScannedAt: Math.min(old?.firstScannedAt ?? Infinity, row.firstScannedAt ?? row.scannedAt),
                    lastScannedAt: Math.max(old?.lastScannedAt ?? 0, row.scannedAt),
                    scanCount: Math.max((old?.scanCount ?? 0) + 1, row.scanCount ?? 1)
                });
            }
        }
        for(let i = 0; i < history.length; i += 2000)await client.query(`INSERT INTO ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["table"])('history')} (id,scanned_at,data) SELECT (value->>'id')::uuid,(value->>'scannedAt')::bigint,value FROM jsonb_array_elements($1::jsonb)`, [
            JSON.stringify(history.slice(i, i + 2000))
        ]);
        const states = [
            ...accepted.values()
        ];
        for(let i = 0; i < states.length; i += 2000)await client.query(`INSERT INTO ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["table"])('accepted')} (tracking_code,data) SELECT value->>'trackingCode',value FROM jsonb_array_elements($1::jsonb)`, [
            JSON.stringify(states.slice(i, i + 2000))
        ]);
        await client.query(`UPDATE ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["table"])('workspace')} SET counters=$1::jsonb WHERE id=1`, [
            JSON.stringify(counters)
        ]);
        const response = {
            migrated: true
        };
        await remember(client, id, 'migrate', response);
        return response;
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/types/scan.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "emptyCounters",
    ()=>emptyCounters
]);
const emptyCounters = ()=>({
        ACCEPTED: 0,
        DUPLICATE: 0,
        CANCELLED: 0,
        PICKED_UP: 0,
        UNKNOWN: 0
    });
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0wnmwde._.js.map