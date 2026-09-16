import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { loadEnvConfig } from '@next/env';
import type { Dataset } from '../src/types/order';
loadEnvConfig(process.cwd());
const schema = 'pack_check_test_' + randomUUID().replaceAll('-', '');
process.env.PACK_CHECK_DB_SCHEMA = schema;
let repo: typeof import('../src/server/packRepository');
let db: typeof import('../src/server/database');
const data: Dataset = { metadata: { filename: 'integration.xlsx', importedAt: 1, total: 3, waiting: 1, shipping: 1, cancelled: 1, skipped: 0, merged: 0 }, orders: [
  { orderId: 'O1', trackingCode: 'VALID', orderStatus: 'Chờ giao hàng', carrier: 'SPX' },
  { orderId: 'O2', trackingCode: 'CANCELLED', orderStatus: 'Đã hủy' },
  { orderId: 'O3', trackingCode: 'PICKED', orderStatus: 'Đang giao' },
] };
describe.skipIf(!process.env.DATABASE_URL)('PostgreSQL shared workspace (isolated test schema)', () => {
  beforeAll(async () => { repo = await import('../src/server/packRepository'); db = await import('../src/server/database'); await db.initializeDatabase(); }, 30000);
  afterAll(async () => { if (db) { await db.pool().query(`DROP SCHEMA "${schema}" CASCADE`); await db.pool().end(); } }, 30000);
  beforeEach(async () => { await repo.importDataset(data, true); }, 30000);
  it('shares acceptance across devices and prevents concurrent double approval', async () => {
    const results = await Promise.all([repo.scanTrackingCode('VALID', randomUUID()), repo.scanTrackingCode('VALID', randomUUID())]);
    expect(results.map(r => r.record.status).sort()).toEqual(['ACCEPTED','DUPLICATE']);
    expect((await repo.getHistory(0, 20))).toHaveLength(2);
    expect((await repo.getState()).counters).toMatchObject({ACCEPTED:1,DUPLICATE:1});
  });
  it('retries a lost response idempotently, including after reset', async () => {
    const id = randomUUID(); const first = await repo.scanTrackingCode('VALID', id); const retry = await repo.scanTrackingCode('VALID', id);
    expect(retry).toEqual(first); expect(await repo.getHistory(0,20)).toHaveLength(1);
    await repo.clearScanHistory(); expect((await repo.scanTrackingCode('VALID', id)).record.id).toBe(id); expect(await repo.getHistory(0,20)).toHaveLength(0);
  });
  it('server applies current status priority, regardless of previous acceptance', async () => {
    await repo.scanTrackingCode('VALID', randomUUID());
    for (const [tracking, status] of [['MISSING','UNKNOWN'],['CANCELLED','CANCELLED'],['PICKED','PICKED_UP']]) expect((await repo.scanTrackingCode(tracking,randomUUID())).record.status).toBe(status);
    const changed = structuredClone(data); changed.orders[0].orderStatus='Đang giao'; await repo.importDataset(changed,false);
    expect((await repo.scanTrackingCode('VALID',randomUUID())).record.status).toBe('PICKED_UP');
    changed.orders[0].cancellationReason='Buyer cancelled'; await repo.importDataset(changed,false);
    expect((await repo.scanTrackingCode('VALID',randomUUID())).record.status).toBe('CANCELLED');
  });
  it('keeps history on file replacement and clears only when requested', async () => {
    await repo.scanTrackingCode('VALID',randomUUID()); await repo.importDataset(data,false);
    expect((await repo.scanTrackingCode('VALID',randomUUID())).record.status).toBe('DUPLICATE');
    await repo.importDataset(data,true); expect((await repo.scanTrackingCode('VALID',randomUUID())).record.status).toBe('ACCEPTED');
  });
  it('persists import warnings before a requested history reset and replays imports idempotently', async () => {
    await repo.scanTrackingCode('VALID', randomUUID());
    const changed = structuredClone(data); changed.orders[0].orderStatus = 'Đã hủy';
    const id = randomUUID();
    const result = await repo.importDataset(changed, true, id);
    expect(result.metadata.comparison.issues).toMatchObject([{ trackingCode: 'VALID', kind: 'CANCELLED' }]);
    expect(result.metadata.comparison.historyCleared).toBe(true);
    expect((await repo.getState()).metadata.comparison).toEqual(result.metadata.comparison);
    expect(await repo.getHistory(0, 20)).toHaveLength(0);
    expect(await repo.importDataset(changed, true, id)).toEqual(result);
  });
  it('migrates local accepted history once without replacing an existing workspace', async () => {
    await db.pool().query(`UPDATE ${db.table('workspace')} SET metadata=NULL WHERE id=1`);
    const history = [{ id: randomUUID(), trackingCode:'VALID',status:'ACCEPTED' as const,scannedAt:1000,firstScannedAt:1000,scanCount:1 }];
    expect(await repo.migrateLocalData(data,history,randomUUID())).toEqual({migrated:true});
    const duplicate = await repo.scanTrackingCode('VALID',randomUUID()); expect(duplicate.record.status).toBe('DUPLICATE'); expect(duplicate.record.firstScannedAt).toBe(1000);
    expect(await repo.migrateLocalData(data,history,randomUUID())).toEqual({migrated:false});
  });
  it('browses all matching records before pagination and handles literal search characters', async () => {
    await repo.scanTrackingCode('VALID', randomUUID());
    await repo.scanTrackingCode('VALID', randomUUID());
    await repo.scanTrackingCode('VALID', randomUUID());
    const duplicates = await repo.browseParcels('scans', 'DUPLICATE', 'valid', 'spx', 0, 1);
    expect(duplicates.total).toBe(2);
    expect(duplicates.rows).toHaveLength(1);
    expect(duplicates.rows[0].scan.status).toBe('DUPLICATE');
    const remaining = await repo.browseParcels('orders', 'UNSCANNED', '', '', 0, 50);
    expect(remaining.total).toBe(2);
    expect(remaining.rows.every((row: { order: { trackingCode: string } }) => row.order.trackingCode !== 'VALID')).toBe(true);
    expect((await repo.browseParcels('orders', 'ALL', 'O1', '', 0, 50)).total).toBe(1);
    expect((await repo.browseParcels('orders', 'ALL', '%', '', 0, 50)).total).toBe(0);
    expect((await repo.browseParcels('scans', 'DUPLICATE', '', '', 100, 50))).toEqual({ total: 2, rows: [] });
  });
  it('imports 50,000 rows and uses the tracking primary-key lookup', async () => {
    const large = { ...data, orders:Array.from({length:50000},(_,i)=>({orderId:`O${i}`,trackingCode:`SPX${i}`,orderStatus:'Chờ giao hàng'})) };
    await repo.importDataset(large,true); expect((await repo.getState()).metadata.total).toBe(50000);
    expect((await repo.scanTrackingCode('SPX49999',randomUUID())).record.status).toBe('ACCEPTED');
  },60000);
});
