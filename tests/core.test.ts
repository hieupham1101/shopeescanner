import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as XLSX from "xlsx";
import { ScanProcessor, CameraDebounce } from "../src/lib/scanProcessor";
import {
  commitScan,
  loadData,
  readHistory,
  resetHistory,
  saveDataset,
} from "../src/lib/localStorage";
import { parseShopeeFile } from "../src/lib/shopeeParser";
import { normalizeTrackingCode } from "../src/lib/normalization";
import { determineOrderStatus } from "../src/lib/orderStatus";
import type { Dataset, ShopeeOrder } from "../src/types/order";
const order = (
  trackingCode: string,
  orderStatus = "Chờ giao hàng",
  extra = {},
): ShopeeOrder => ({
  trackingCode,
  orderStatus,
  orderId: trackingCode,
  carrier: "SPX",
  ...extra,
});
const orders = [
  order("VALID"),
  order("CANCEL", "Đã hủy"),
  order("PICKED", "Đang giao"),
  order("REASON", "Chờ giao hàng", { cancellationReason: "Buyer requested" }),
];
const dataset: Dataset = {
  orders,
  metadata: {
    filename: "test.xlsx",
    importedAt: Date.now(),
    total: 4,
    waiting: 1,
    shipping: 1,
    cancelled: 2,
    skipped: 0,
    merged: 0,
  },
};
function localProcessor(map: Map<string, ShopeeOrder>) {
  return new ScanProcessor(async (trackingCode, id) => {
    const order = map.get(trackingCode);
    const availability = order ? determineOrderStatus(order) : null;
    const status = !order ? 'UNKNOWN' : availability === 'AVAILABLE' ? 'ACCEPTED' : availability!;
    const result = await commitScan({ id, trackingCode, status, scannedAt: Date.now(), orderId: order?.orderId, carrier: order?.carrier });
    return { record: { ...result.record, order }, counters: result.counters };
  });
}
const engine = () =>
  localProcessor(new Map(orders.map((o) => [o.trackingCode, o])));
function workbook(rows: unknown[][]) {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(rows), "Orders");
  return XLSX.write(book, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}
beforeEach(async () => {
  vi.useRealTimers();
  await saveDataset(dataset, true);
});
describe("scan business rules and persistence", () => {
  it("A–E: exact priority, valid acceptance, real duplicate", async () => {
    const e = engine();
    for (const [code, status] of [
      ["MISSING", "UNKNOWN"],
      ["CANCEL", "CANCELLED"],
      ["PICKED", "PICKED_UP"],
      ["VALID", "ACCEPTED"],
      ["VALID", "DUPLICATE"],
    ])
      expect((await e.processScan(code))?.result.status).toBe(status);
    expect((await e.processScan("VALID"))?.result.scanCount).toBe(3);
    expect((await readHistory()).length).toBe(6);
  });
  it("only accepted parcels gain duplicate state", async () => {
    const e = engine();
    for (const code of ["MISSING", "CANCEL", "PICKED", "REASON"]) {
      const first = await e.processScan(code);
      const second = await e.processScan(code);
      expect(second?.result.status).toBe(first?.result.status);
      expect(second?.result.scanCount).toBeUndefined();
    }
  });
  it("F: ten camera frames make one history record and one result", async () => {
    const e = engine();
    const results = await Promise.all(
      Array.from({ length: 10 }, () => e.processScan("VALID", "camera")),
    );
    expect(results.filter(Boolean)).toHaveLength(1);
    expect(await readHistory()).toHaveLength(1);
    expect((await e.processScan("VALID", "usb"))?.result.status).toBe(
      "DUPLICATE",
    );
  });
  it("camera debounce lasts while the label stays in frame, then rearms", () => {
    const d = new CameraDebounce();
    expect(d.ignore("A", 0)).toBe(false);
    expect(d.ignore("A", 1000)).toBe(true);
    expect(d.ignore("A", 2000)).toBe(true);
    expect(d.ignore("A", 3600)).toBe(false);
  });
  it("G: fresh processor restores accepted state and first timestamp", async () => {
    const first = await engine().processScan("VALID");
    const data = await loadData();
    const fresh = localProcessor(
      new Map(data.orders.map((o) => [o.trackingCode, o])),
    );
    const next = await fresh.processScan("VALID");
    expect(next?.result.status).toBe("DUPLICATE");
    expect(next?.result.firstScannedAt).toBe(first?.result.scannedAt);
    expect(data.counters.ACCEPTED).toBe(1);
  });
  it("concurrent scans across processors cannot both be accepted", async () => {
    const results = await Promise.all([
      engine().processScan("VALID"),
      engine().processScan("VALID"),
    ]);
    expect(results.map((r) => r?.result.status).sort()).toEqual([
      "ACCEPTED",
      "DUPLICATE",
    ]);
  });
  it("new cancellation or pickup overrides historical acceptance", async () => {
    await engine().processScan("VALID");
    for (const [status, expected] of [
      ["Đã hủy", "CANCELLED"],
      ["Đang giao", "PICKED_UP"],
    ])
      expect(
        (
          await localProcessor(
            new Map([["VALID", order("VALID", status)]]),
          ).processScan("VALID")
        )?.result.status,
      ).toBe(expected);
  });
  it("keep and reset imports behave correctly", async () => {
    await engine().processScan("VALID");
    await saveDataset(dataset, false);
    expect((await engine().processScan("VALID"))?.result.status).toBe(
      "DUPLICATE",
    );
    await saveDataset(dataset, true);
    expect(await readHistory()).toHaveLength(0);
    expect((await engine().processScan("VALID"))?.result.status).toBe(
      "ACCEPTED",
    );
    await resetHistory();
    expect((await loadData()).metadata?.total).toBe(4);
    expect((await loadData()).counters.ACCEPTED).toBe(0);
  });
  it("shipping date alone is not pickup, meaningful cancellation reason wins", () => {
    expect(
      determineOrderStatus(
        order("A", "Chờ giao hàng", {
          shipDate: "9/11/2026",
          cancellationReason: "-",
        }),
      ),
    ).toBe("AVAILABLE");
    expect(
      determineOrderStatus(
        order("B", "Đang giao", { cancellationReason: "Cancelled by buyer" }),
      ),
    ).toBe("CANCELLED");
  });
});
describe("Excel import", () => {
  it("finds reordered headers and formatted leading zero numbers", () => {
    const data = workbook([
      ["Report"],
      [" Trạng Thái Đơn Hàng ", " Mã vận đơn ", "Mã đơn hàng"],
      [" Chờ giao hàng ", " 001 234 ", " O1 "],
    ]);
    expect(parseShopeeFile(data, "file.xlsx").orders[0]).toMatchObject({
      trackingCode: "001234",
      orderId: "O1",
    });
    const book = XLSX.read(data);
    book.Sheets.Orders.B3 = { t: "n", v: 123, z: "000000" };
    expect(
      parseShopeeFile(
        XLSX.write(book, { type: "array", bookType: "xlsx" }),
        "file.xlsx",
      ).orders[0].trackingCode,
    ).toBe("000123");
  });
  it("missing tracking header fails clearly; optional fields can be absent", () => {
    expect(() =>
      parseShopeeFile(workbook([["wrong"], ["ABC"]]), "bad.xlsx"),
    ).toThrow("Không tìm thấy cột Mã vận đơn");
    expect(
      parseShopeeFile(
        workbook([
          ["Mã vận đơn", "Trạng Thái Đơn Hàng"],
          ["ABC", "Đang giao"],
        ]),
        "file.xlsx",
      ).metadata.shipping,
    ).toBe(1);
  });
  it("merges repeated line items conservatively and skips empty tracking", () => {
    const data = parseShopeeFile(
      workbook([
        ["Mã vận đơn", "Trạng Thái Đơn Hàng"],
        ["A", "Đã hủy"],
        ["A", "Chờ giao hàng"],
        ["", "Chờ giao hàng"],
      ]),
      "file.xlsx",
    );
    expect(data.metadata).toMatchObject({
      total: 1,
      merged: 1,
      skipped: 1,
      cancelled: 1,
    });
  });
  it("J: parses, saves and looks up 50,000 orders", async () => {
    const rows = [
      ["Mã vận đơn", "Trạng Thái Đơn Hàng"],
      ...Array.from({ length: 50000 }, (_, i) => [
        `SPX${String(i).padStart(9, "0")}`,
        "Chờ giao hàng",
      ]),
    ];
    const start = performance.now();
    const data = parseShopeeFile(workbook(rows), "large.xlsx");
    expect(data.orders).toHaveLength(50000);
    await saveDataset(data, true);
    const map = new Map(data.orders.map((o) => [o.trackingCode, o]));
    const spy = vi.spyOn(map, "get");
    const e = localProcessor(map);
    expect((await e.processScan("SPX000049999"))?.result.status).toBe(
      "ACCEPTED",
    );
    expect(spy).toHaveBeenCalledTimes(1);
    console.log(
      `50k generated Excel + parse + IndexedDB import: ${Math.round(performance.now() - start)}ms`,
    );
  }, 30000);
  it("normalizes Unicode/whitespace without dropping zeros", () => {
    expect(normalizeTrackingCode(" ００1\u200b ab\n")).toBe("001AB");
    expect(normalizeTrackingCode(null)).toBe("");
  });
});
