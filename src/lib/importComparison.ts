import type { ShopeeOrder } from '../types/order';
import type { AcceptedState } from '../types/scan';
import { determineOrderStatus } from './orderStatus';

export interface ImportIssue {
  trackingCode: string;
  orderId?: string;
  carrier?: string;
  firstScannedAt: number;
  kind: 'CANCELLED' | 'MISSING';
  previousStatus?: string;
  currentStatus?: string;
}
export interface ImportComparison {
  previousFilename: string;
  comparedAt: number;
  historyCleared: boolean;
  newlyAvailable: number;
  issues: ImportIssue[];
}

// Accepted codes are authoritative even if absent from the previous export.
export function compareImports(previous: ShopeeOrder[], incoming: ShopeeOrder[], accepted: AcceptedState[]): Pick<ImportComparison, 'newlyAvailable' | 'issues'> {
  const old = new Map(previous.map(order => [order.trackingCode, order]));
  const next = new Map(incoming.map(order => [order.trackingCode, order]));
  const scanned = new Set(accepted.map(item => item.trackingCode));
  let newlyAvailable = 0;
  for (const order of next.values()) {
    const before = old.get(order.trackingCode);
    if (!scanned.has(order.trackingCode) && determineOrderStatus(order) === 'AVAILABLE' &&
        (!before || determineOrderStatus(before) !== 'AVAILABLE')) newlyAvailable++;
  }
  const issues: ImportIssue[] = [];
  for (const item of accepted) {
    const current = next.get(item.trackingCode);
    if (current && determineOrderStatus(current) !== 'CANCELLED') continue;
    const before = old.get(item.trackingCode);
    issues.push({ trackingCode: item.trackingCode, orderId: current?.orderId ?? before?.orderId,
      carrier: current?.carrier ?? before?.carrier, firstScannedAt: item.firstScannedAt,
      kind: current ? 'CANCELLED' : 'MISSING', previousStatus: before?.orderStatus,
      currentStatus: current?.orderStatus });
  }
  issues.sort((a, b) => a.kind.localeCompare(b.kind) || a.trackingCode.localeCompare(b.trackingCode));
  return { newlyAvailable, issues };
}
