(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/normalization.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/orderStatus.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "determineOrderStatus",
    ()=>determineOrderStatus,
    "isCancelled",
    ()=>isCancelled,
    "isPickedUp",
    ()=>isPickedUp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$normalization$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/normalization.ts [app-client] (ecmascript)");
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$normalization$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeText"])(order.orderStatus) === "đã hủy" || !emptyReasons.has((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$normalization$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeText"])(order.cancellationReason));
}
function isPickedUp(order) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$normalization$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeText"])(order.orderStatus) === "đang giao";
}
function determineOrderStatus(order) {
    return isCancelled(order) ? "CANCELLED" : isPickedUp(order) ? "PICKED_UP" : "AVAILABLE";
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/shopeeParser.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseShopeeFile",
    ()=>parseShopeeFile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$normalization$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/normalization.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$orderStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/orderStatus.ts [app-client] (ecmascript)");
;
;
;
function parseShopeeFile(buffer, filename) {
    const workbook = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["read"](buffer, {
        type: "array",
        cellText: true,
        cellNF: true
    });
    const orders = new Map();
    let found = false, skipped = 0, merged = 0;
    for (const name of workbook.SheetNames){
        const rows = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].sheet_to_json(workbook.Sheets[name], {
            header: 1,
            raw: false,
            defval: ""
        });
        const headerIndex = rows.findIndex((row)=>row.some((cell)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$normalization$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeText"])(cell) === "mã vận đơn"));
        if (headerIndex < 0) continue;
        found = true;
        const headers = rows[headerIndex].map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$normalization$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeText"]);
        const index = (name)=>headers.indexOf((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$normalization$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeText"])(name));
        const fields = {
            orderId: index("Mã đơn hàng"),
            trackingCode: index("Mã vận đơn"),
            orderStatus: index("Trạng Thái Đơn Hàng"),
            cancellationReason: index("Lý do hủy"),
            carrier: index("Đơn Vị Vận Chuyển"),
            shippingMethod: index("Phương thức giao hàng"),
            shipDate: index("Ngày gửi hàng"),
            deliveryTime: index("Thời gian giao hàng"),
            returnRefundStatus: index("Trạng thái Trả hàng/Hoàn tiền")
        };
        for(let i = headerIndex + 1; i < rows.length; i++){
            const row = rows[i];
            if (!row.some((value)=>String(value).trim())) continue;
            const order = Object.fromEntries(Object.entries(fields).map(([key, col])=>[
                    key,
                    String(row[col] ?? "").trim()
                ]));
            order.trackingCode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$normalization$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeTrackingCode"])(order.trackingCode);
            if (!order.trackingCode) {
                skipped++;
                continue;
            }
            const previous = orders.get(order.trackingCode);
            if (previous) {
                merged++;
                // Multi-item exports repeat parcels; preserve the most restrictive row.
                const rank = {
                    AVAILABLE: 0,
                    PICKED_UP: 1,
                    CANCELLED: 2
                };
                if (rank[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$orderStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["determineOrderStatus"])(previous)] > rank[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$orderStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["determineOrderStatus"])(order)]) continue;
            }
            orders.set(order.trackingCode, order);
        }
    }
    if (!found) throw new Error("This file does not appear to be a supported Shopee order export because the tracking-code column was not found.");
    if (!orders.size) throw new Error("No tracking codes were found in this file. Import an export containing shipping labels.");
    const values = [
        ...orders.values()
    ];
    return {
        orders: values,
        metadata: {
            filename,
            importedAt: Date.now(),
            total: values.length,
            waiting: values.filter((o)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$orderStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["determineOrderStatus"])(o) === "AVAILABLE" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$normalization$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeText"])(o.orderStatus) === "chờ giao hàng").length,
            shipping: values.filter((o)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$orderStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["determineOrderStatus"])(o) === "PICKED_UP").length,
            cancelled: values.filter((o)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$orderStatus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["determineOrderStatus"])(o) === "CANCELLED").length,
            skipped,
            merged
        }
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/workers/import.worker.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$shopeeParser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/shopeeParser.ts [app-client] (ecmascript)");
;
self.onmessage = (event)=>{
    try {
        self.postMessage({
            data: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$shopeeParser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseShopeeFile"])(event.data.buffer, event.data.filename)
        });
    } catch (error) {
        self.postMessage({
            error: error instanceof Error ? error.message : "Unable to read Excel file."
        });
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_179igt3._.js.map