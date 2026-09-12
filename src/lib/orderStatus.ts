import type { ShopeeOrder } from "../types/order";
import { normalizeText } from "./normalization";
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
  "0",
]);
export function isCancelled(order: ShopeeOrder) {
  return (
    normalizeText(order.orderStatus) === "đã hủy" ||
    !emptyReasons.has(normalizeText(order.cancellationReason))
  );
}
export function isPickedUp(order: ShopeeOrder) {
  return normalizeText(order.orderStatus) === "đang giao";
}
export function determineOrderStatus(order: ShopeeOrder) {
  return isCancelled(order)
    ? "CANCELLED"
    : isPickedUp(order)
      ? "PICKED_UP"
      : "AVAILABLE";
}
