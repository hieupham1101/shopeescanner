import { openDB, type DBSchema } from "idb";
import type { Dataset, ImportMetadata, ShopeeOrder } from "../types/order";
import {
  emptyCounters,
  type AcceptedState,
  type Counters,
  type ScanRecord,
} from "../types/scan";
interface PackDB extends DBSchema {
  orders: { key: string; value: ShopeeOrder };
  accepted: { key: string; value: AcceptedState };
  history: { key: string; value: ScanRecord; indexes: { time: number } };
  meta: { key: string; value: ImportMetadata | Counters };
}
const db = () =>
  openDB<PackDB>("shopee-pack-check", 1, {
    upgrade(db) {
      db.createObjectStore("orders", { keyPath: "trackingCode" });
      db.createObjectStore("accepted", { keyPath: "trackingCode" });
      db.createObjectStore("history", { keyPath: "id" }).createIndex(
        "time",
        "scannedAt",
      );
      db.createObjectStore("meta");
    },
  });
export async function loadData() {
  const database = await db();
  const [orders, metadata, counters] = await Promise.all([
    database.getAll("orders"),
    database.get("meta", "file"),
    database.get("meta", "counters"),
  ]);
  return {
    orders,
    metadata: metadata as ImportMetadata | undefined,
    counters: (counters as Counters) ?? emptyCounters(),
  };
}
export async function saveDataset(data: Dataset, clear: boolean) {
  const database = await db();
  const tx = database.transaction(
    ["orders", "meta", "accepted", "history"],
    "readwrite",
  );
  await tx.objectStore("orders").clear();
  for (const order of data.orders) void tx.objectStore("orders").put(order);
  void tx.objectStore("meta").put(data.metadata, "file");
  if (clear) {
    void tx.objectStore("accepted").clear();
    void tx.objectStore("history").clear();
    void tx.objectStore("meta").put(emptyCounters(), "counters");
  }
  await tx.done;
}
export async function commitScan(
  record: ScanRecord,
): Promise<{ record: ScanRecord; counters: Counters }> {
  const database = await db();
  const tx = database.transaction(["accepted", "history", "meta"], "readwrite");
  if (record.status === "ACCEPTED" || record.status === "PICKED_UP") {
    const existing = await tx.objectStore("accepted").get(record.trackingCode);
    if (record.status === "ACCEPTED" || existing) {
      record = {
        ...record,
        status: existing ? "DUPLICATE" : "ACCEPTED",
        firstScannedAt: existing?.firstScannedAt ?? record.scannedAt,
        scanCount: (existing?.scanCount ?? 0) + 1,
      };
      await tx
        .objectStore("accepted")
        .put({
          trackingCode: record.trackingCode,
          firstScannedAt: record.firstScannedAt!,
          lastScannedAt: record.scannedAt,
          scanCount: record.scanCount!,
        });
    }
  }
  const counters =
    ((await tx.objectStore("meta").get("counters")) as Counters) ??
    emptyCounters();
  counters[record.status]++;
  await tx.objectStore("history").put(record);
  await tx.objectStore("meta").put(counters, "counters");
  await tx.done;
  return { record, counters };
}
export async function readHistory(offset = 0, limit = 20) {
  const database = await db();
  let cursor = await database
    .transaction("history")
    .store.index("time")
    .openCursor(null, "prev");
  const result: ScanRecord[] = [];
  if (cursor && offset) cursor = await cursor.advance(offset);
  while (cursor && result.length < limit) {
    result.push(cursor.value);
    cursor = await cursor.continue();
  }
  return result;
}
export async function resetHistory() {
  const database = await db();
  const tx = database.transaction(["history", "accepted", "meta"], "readwrite");
  await Promise.all([
    tx.objectStore("history").clear(),
    tx.objectStore("accepted").clear(),
    tx.objectStore("meta").put(emptyCounters(), "counters"),
  ]);
  await tx.done;
}

// Read-only bridge for existing device data. Never erase the local backup.
export async function exportLocalSnapshot() {
  const database = await db();
  const tx = database.transaction(['orders', 'meta', 'history'], 'readonly');
  const [orders, metadata, history] = await Promise.all([tx.objectStore('orders').getAll(), tx.objectStore('meta').get('file'), tx.objectStore('history').getAll()]);
  await tx.done;
  return metadata && orders.length ? { data: { orders, metadata: metadata as ImportMetadata }, history } : null;
}
