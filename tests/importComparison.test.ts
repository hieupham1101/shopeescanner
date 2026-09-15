import { expect, it } from 'vitest';
import { compareImports } from '../src/lib/importComparison';
const order = (trackingCode: string, orderStatus = 'Chờ giao hàng') => ({ trackingCode, orderId: trackingCode, orderStatus });
const accepted = (trackingCode: string) => ({ trackingCode, firstScannedAt: 100, lastScannedAt: 100, scanCount: 1 });
it('flags accepted cancellations and missing parcels, excluding failed or unscanned codes', () => {
  const result = compareImports([order('A'), order('B'), order('C')], [order('A', 'Đã hủy'), order('C', 'Đã hủy')], [accepted('A'), accepted('B')]);
  expect(result.issues.map(i => [i.trackingCode, i.kind])).toEqual([['A', 'CANCELLED'], ['B', 'MISSING']]);
  expect(result.issues[0].firstScannedAt).toBe(100);
});
it('keeps unresolved warnings across repeated imports and clears them when status recovers', () => {
  expect(compareImports([], [], [accepted('A')]).issues[0].kind).toBe('MISSING');
  expect(compareImports([order('A', 'Đã hủy')], [order('A', 'Đã hủy')], [accepted('A')]).issues).toHaveLength(1);
  expect(compareImports([], [order('A')], [accepted('A')]).issues).toHaveLength(0);
});
it('counts new availability uniquely and excludes accepted parcels and unchanged availability', () => {
  const result = compareImports([order('A'), order('B', 'Đã hủy')], [order('A'), order('B'), order('C'), order('C'), order('D')], [accepted('D')]);
  expect(result.newlyAvailable).toBe(2);
});
it('honors cancellation reasons and does not flag picked-up parcels as cancellations', () => {
  const result = compareImports([], [{ ...order('A'), cancellationReason: 'Buyer cancelled' }, order('B', 'Đang giao')], [accepted('A'), accepted('B')]);
  expect(result.issues.map(i => i.trackingCode)).toEqual(['A']);
});
