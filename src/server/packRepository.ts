import { compareImports } from '../lib/importComparison';
import type { PoolClient } from 'pg';
import { randomUUID } from 'node:crypto';
import { initializeDatabase, pool, table, transaction } from './database';
import { normalizeTrackingCode, normalizeText } from '../lib/normalization';
import { determineOrderStatus } from '../lib/orderStatus';
import type { Dataset, ShopeeOrder } from '../types/order';
import { emptyCounters, type AcceptedState, type Counters, type ScanResult, type ScanRecord } from '../types/scan';
export class RequestError extends Error { constructor(message: string, public status = 400) { super(message); } }
async function state(client: Pick<PoolClient, 'query'>) {
  const { rows } = await client.query(`SELECT metadata,counters,revision::text FROM ${table('workspace')} WHERE id=1`);
  return rows[0];
}
export async function getState() { await initializeDatabase(); return state(pool()); }
export async function getHistory(offset: number, limit: number) {
  await initializeDatabase();
  const { rows } = await pool().query(`SELECT data FROM ${table('history')} ORDER BY scanned_at DESC,id DESC LIMIT $1 OFFSET $2`, [limit, offset]);
  return rows.map(row => row.data as ScanRecord);
}
async function prior(client: PoolClient, id: string, kind: string) {
  const { rows } = await client.query(`SELECT kind,response FROM ${table('operations')} WHERE id=$1`, [id]);
  if (rows[0] && rows[0].kind !== kind) throw new RequestError('Request ID already used', 409);
  return rows[0]?.response;
}
async function remember(client: PoolClient, id: string, kind: string, response: unknown) {
  await client.query(`INSERT INTO ${table('operations')} (id,kind,response) VALUES ($1,$2,$3::jsonb)`, [id, kind, JSON.stringify(response)]);
}
export async function scanTrackingCode(rawCode: string, requestId: string) {
  const trackingCode = normalizeTrackingCode(rawCode);
  if (!trackingCode || trackingCode.length > 512) throw new RequestError('Invalid tracking code');
  return transaction(async client => {
    const previous = await prior(client, requestId, 'scan');
    if (previous) {
      if (previous.record.trackingCode !== trackingCode) throw new RequestError('Request ID does not match this parcel', 409);
      return previous as { record: ScanResult; counters: Counters };
    }
    const workspace = await state(client);
    if (!workspace.metadata) throw new RequestError('Import a Shopee file before scanning.', 409);
    const lookup = await client.query(`SELECT (SELECT data FROM ${table('orders')} WHERE tracking_code=$1) AS "order", (SELECT data FROM ${table('accepted')} WHERE tracking_code=$1) AS accepted`, [trackingCode]);
    const order = lookup.rows[0].order as ShopeeOrder | undefined;
    const accepted = lookup.rows[0].accepted as AcceptedState | undefined;
    const availability = order ? determineOrderStatus(order) : null;
    // A carrier status update must not hide an earlier warehouse scan.
    const status = !order ? 'UNKNOWN' : availability === 'CANCELLED' ? 'CANCELLED' : accepted ? 'DUPLICATE' : availability === 'PICKED_UP' ? 'PICKED_UP' : 'ACCEPTED';
    const scannedAt = Date.now();
    const record: ScanResult = { id: requestId, trackingCode, status, scannedAt, order: order || undefined, orderId: order?.orderId, carrier: order?.carrier };
    if (status === 'ACCEPTED' || status === 'DUPLICATE') {
      record.firstScannedAt = accepted?.firstScannedAt ?? scannedAt;
      record.scanCount = (accepted?.scanCount ?? 0) + 1;
      const value: AcceptedState = { trackingCode, firstScannedAt: record.firstScannedAt, lastScannedAt: scannedAt, scanCount: record.scanCount };
      await client.query(`INSERT INTO ${table('accepted')} (tracking_code,data) VALUES ($1,$2::jsonb) ON CONFLICT (tracking_code) DO UPDATE SET data=EXCLUDED.data`, [trackingCode, JSON.stringify(value)]);
    }
    const counters: Counters = workspace.counters; counters[status]++;
    await client.query(`WITH saved AS (INSERT INTO ${table('history')} (id,scanned_at,data) VALUES ($1,$2,$3::jsonb)) UPDATE ${table('workspace')} SET counters=$4::jsonb,revision=revision+1 WHERE id=1`, [record.id, scannedAt, JSON.stringify(record), JSON.stringify(counters)]);
    const response = { record, counters };
    await remember(client, requestId, 'scan', response); return response;
  });
}
async function putOrders(client: PoolClient, data: Dataset) {
  await client.query(`DELETE FROM ${table('orders')}`);
  for (let i = 0; i < data.orders.length; i += 2000) {
    await client.query(`INSERT INTO ${table('orders')} (tracking_code,data) SELECT value->>'trackingCode',value FROM jsonb_array_elements($1::jsonb) ON CONFLICT(tracking_code) DO UPDATE SET data=EXCLUDED.data`, [JSON.stringify(data.orders.slice(i, i + 2000))]);
  }
  const values = data.orders;
  const metadata = { ...data.metadata, importedAt: Date.now(), total: values.length, cancelled: values.filter(o => determineOrderStatus(o) === 'CANCELLED').length, shipping: values.filter(o => determineOrderStatus(o) === 'PICKED_UP').length, waiting: values.filter(o => determineOrderStatus(o) === 'AVAILABLE' && normalizeText(o.orderStatus) === 'chờ giao hàng').length };
  await client.query(`UPDATE ${table('workspace')} SET metadata=$1::jsonb,revision=revision+1 WHERE id=1`, [JSON.stringify(metadata)]);
}
async function clearHistory(client: PoolClient) {
  await client.query(`DELETE FROM ${table('history')}; DELETE FROM ${table('accepted')}`);
  await client.query(`UPDATE ${table('workspace')} SET counters=$1::jsonb,revision=revision+1 WHERE id=1`, [JSON.stringify(emptyCounters())]);
}
export async function importDataset(data: Dataset, clear: boolean, id: string = randomUUID()) {
  return transaction(async client => {
    const previous = await prior(client, id, 'import'); if (previous) return previous;
    const workspace = await state(client);
    // Compare under the same workspace lock as scans and replacement, before clearing history.
    const comparison = workspace.metadata ? await (async () => {
      const old = await client.query(`SELECT data FROM ${table('orders')}`);
      const accepted = await client.query(`SELECT data FROM ${table('accepted')}`);
      return { ...compareImports(old.rows.map(row => row.data), data.orders, accepted.rows.map(row => row.data)),
        previousFilename: workspace.metadata.filename, comparedAt: Date.now(), historyCleared: clear };
    })() : undefined;
    await putOrders(client, { ...data, metadata: { ...data.metadata, comparison } });
    if (clear) await clearHistory(client);
    const response = await state(client); await remember(client, id, 'import', response); return response;
  });
}
export async function clearScanHistory(id: string = randomUUID()) {
  return transaction(async client => {
    const previous = await prior(client, id, 'reset'); if (previous) return previous;
    await clearHistory(client); const response = await state(client); await remember(client, id, 'reset', response); return response;
  });
}
export async function migrateLocalData(data: Dataset, history: ScanRecord[], id: string) {
  return transaction(async client => {
    const previous = await prior(client, id, 'migrate'); if (previous) return previous;
    const workspace = await state(client);
    if (workspace.metadata) return { migrated: false };
    await putOrders(client, data);
    const accepted = new Map<string, AcceptedState>(); const counters = emptyCounters();
    for (const row of [...history].sort((a, b) => a.scannedAt - b.scannedAt)) {
      row.trackingCode = normalizeTrackingCode(row.trackingCode); counters[row.status]++;
      if (row.status === 'ACCEPTED' || row.status === 'DUPLICATE') {
        const old = accepted.get(row.trackingCode);
        accepted.set(row.trackingCode, { trackingCode: row.trackingCode, firstScannedAt: Math.min(old?.firstScannedAt ?? Infinity, row.firstScannedAt ?? row.scannedAt), lastScannedAt: Math.max(old?.lastScannedAt ?? 0, row.scannedAt), scanCount: Math.max((old?.scanCount ?? 0) + 1, row.scanCount ?? 1) });
      }
    }
    for (let i = 0; i < history.length; i += 2000) await client.query(`INSERT INTO ${table('history')} (id,scanned_at,data) SELECT (value->>'id')::uuid,(value->>'scannedAt')::bigint,value FROM jsonb_array_elements($1::jsonb)`, [JSON.stringify(history.slice(i, i + 2000))]);
    const states = [...accepted.values()];
    for (let i = 0; i < states.length; i += 2000) await client.query(`INSERT INTO ${table('accepted')} (tracking_code,data) SELECT value->>'trackingCode',value FROM jsonb_array_elements($1::jsonb)`, [JSON.stringify(states.slice(i, i + 2000))]);
    await client.query(`UPDATE ${table('workspace')} SET counters=$1::jsonb WHERE id=1`, [JSON.stringify(counters)]);
    const response = { migrated: true }; await remember(client, id, 'migrate', response); return response;
  });
}

export async function browseParcels(kind: 'orders' | 'scans', filter: string, query: string, carrier: string, offset: number, limit: number) {
  await initializeDatabase();
  const orders = kind === 'orders';
  // A single statement keeps the count and page on the same database snapshot.
  const source = orders
    ? `SELECT o.tracking_code AS key, o.data AS item, a.data AS accepted FROM ${table('orders')} o LEFT JOIN ${table('accepted')} a USING (tracking_code)`
    : `SELECT id::text AS key, data AS item, scanned_at FROM ${table('history')}`;
  const condition = orders ? `($1 <> 'UNSCANNED' OR accepted IS NULL)` : `($1 = 'ALL' OR item->>'status' = $1)`;
  const payload = orders ? `jsonb_build_object('order', item, 'acceptedAt', accepted->'firstScannedAt')` : `jsonb_build_object('scan', item)`;
  const sort = orders ? 'key' : 'scanned_at DESC, key DESC';
  const { rows } = await pool().query(`WITH source AS (${source}), filtered AS (
    SELECT * FROM source WHERE ${condition}
    AND ($2 = '' OR strpos(lower(concat_ws(' ', item->>'trackingCode', item->>'orderId')), lower($2)) > 0)
    AND ($3 = '' OR strpos(lower(COALESCE(item->>'carrier', '')), lower($3)) > 0)
  ), page AS (SELECT ${payload} AS data FROM filtered ORDER BY ${sort} LIMIT $4 OFFSET $5)
  SELECT (SELECT count(*)::int FROM filtered) AS total, COALESCE((SELECT jsonb_agg(data) FROM page), '[]'::jsonb) AS rows`, [filter, query, carrier, limit, offset]);
  return rows[0];
}
