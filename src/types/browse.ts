import type { ShopeeOrder } from './order';
import type { ScanRecord, ScanResultStatus } from './scan';
export type BrowseKind = 'orders' | 'scans';
export type BrowseFilter = 'ALL' | 'UNSCANNED' | ScanResultStatus;
export interface BrowseRow { order?: ShopeeOrder; scan?: ScanRecord; acceptedAt?: number }
export interface BrowseResult { rows: BrowseRow[]; total: number }
