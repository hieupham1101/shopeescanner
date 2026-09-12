import { Check, OctagonX, Truck, TriangleAlert, Copy } from "lucide-react";
import type { ScanResult as Result, ScanResultStatus } from "../types/scan";
export const resultLabels: Record<ScanResultStatus, string> = {
  ACCEPTED: "OK to hand over",
  DUPLICATE: "Duplicate parcel",
  CANCELLED: "Order cancelled",
  PICKED_UP: "Already picked up",
  UNKNOWN: "Order not found",
};
export default function ScanResult({
  result,
  dismiss,
}: {
  result: Result;
  dismiss: () => void;
}) {
  const Icon = {
    ACCEPTED: Check,
    DUPLICATE: Copy,
    CANCELLED: OctagonX,
    PICKED_UP: Truck,
    UNKNOWN: TriangleAlert,
  }[result.status];
  return (
    <div
      className={`result-overlay result-${result.status}`}
      role="status"
      aria-live="assertive"
    >
      <button className="result-dismiss" onClick={dismiss}>
        Dismiss · Esc
      </button>
      <Icon size={88} />
      <h2>{resultLabels[result.status]}</h2>
      <strong className="result-code">{result.trackingCode}</strong>
      {result.order && (
        <p>
          {result.order.carrier || "Carrier not provided"} <span> / </span>{" "}
          Shopee order: {result.order.orderId || "—"}
        </p>
      )}
      {result.status === "UNKNOWN" && (
        <p>Not found in the current Shopee data.</p>
      )}
      {result.status === "CANCELLED" && (
        <p>
          Reason:{" "}
          {result.order?.cancellationReason || "Order marked Đã hủy in Shopee"}
        </p>
      )}
      {result.status === "PICKED_UP" && (
        <p>
          Status: Đang giao
          {result.order?.deliveryTime &&
            ` · Time: ${result.order.deliveryTime}`}
        </p>
      )}
      {result.status === "ACCEPTED" && (
        <p>Status: {result.order?.orderStatus || "Not provided"}</p>
      )}
      {result.status === "DUPLICATE" && (
        <p>
          Previously scanned:{" "}
          {new Date(result.firstScannedAt!).toLocaleTimeString()} · Scan count:{" "}
          {result.scanCount}
        </p>
      )}
      <div className="handover-rule">
        {result.status === "ACCEPTED"
          ? "THE PARCEL CAN GO"
          : ["DUPLICATE", "PICKED_UP"].includes(result.status)
            ? "DO NOT HAND OVER AGAIN"
            : "DO NOT HAND OVER"}
      </div>
      <small>Scanner stays active · Ready for your next parcel</small>
    </div>
  );
}
