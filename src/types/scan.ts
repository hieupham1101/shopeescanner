import type { ShopeeOrder } from "./order";
export type ScanResultStatus =
  "ACCEPTED" | "DUPLICATE" | "CANCELLED" | "PICKED_UP" | "UNKNOWN";
export type ScanSource = "usb" | "manual" | "camera";
export interface AcceptedState {
  trackingCode: string;
  firstScannedAt: number;
  lastScannedAt: number;
  scanCount: number;
}
export interface ScanRecord {
  id: string;
  trackingCode: string;
  status: ScanResultStatus;
  scannedAt: number;
  orderId?: string;
  carrier?: string;
  firstScannedAt?: number;
  scanCount?: number;
}
export interface ScanResult extends ScanRecord {
  order?: ShopeeOrder;
}
export type Counters = Record<ScanResultStatus, number>;
export const emptyCounters = (): Counters => ({
  ACCEPTED: 0,
  DUPLICATE: 0,
  CANCELLED: 0,
  PICKED_UP: 0,
  UNKNOWN: 0,
});
