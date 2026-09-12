import { Check, OctagonX, Truck, TriangleAlert, Copy } from "lucide-react";
import type { ScanResult as Result, ScanResultStatus } from "../types/scan";
export const resultLabels: Record<ScanResultStatus, string> = {
  ACCEPTED: "Được bàn giao",
  DUPLICATE: "Đơn trùng",
  CANCELLED: "Đơn huỷ",
  PICKED_UP: "Đã lấy hàng",
  UNKNOWN: "Không tìm thấy",
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
        Đóng · Esc
      </button>
      <Icon size={88} />
      <h2>{resultLabels[result.status]}</h2>
      <strong className="result-code">{result.trackingCode}</strong>
      {result.order && (
        <p>
          {result.order.carrier || "Chưa có đơn vị vận chuyển"} <span> / </span>{" "}
          Đơn Shopee: {result.order.orderId || "—"}
        </p>
      )}
      {result.status === "UNKNOWN" && (
        <p>Không tìm thấy trong tệp Shopee hiện tại.</p>
      )}
      {result.status === "CANCELLED" && (
        <p>
          Lý do:{" "}
          {result.order?.cancellationReason || "Đơn được đánh dấu Đã huỷ trên Shopee"}
        </p>
      )}
      {result.status === "PICKED_UP" && (
        <p>
          Trạng thái: Đang giao
          {result.order?.deliveryTime &&
            ` · Thời gian: ${result.order.deliveryTime}`}
        </p>
      )}
      {result.status === "ACCEPTED" && (
        <p>Trạng thái: {result.order?.orderStatus || "Chưa có thông tin"}</p>
      )}
      {result.status === "DUPLICATE" && (
        <p>
          Đã quét lúc:{" "}
          {new Date(result.firstScannedAt!).toLocaleTimeString("vi-VN")} · Số lần quét:{" "}
          {result.scanCount}
        </p>
      )}
      <div className="handover-rule">
        {result.status === "ACCEPTED"
          ? "CÓ THỂ BÀN GIAO"
          : ["DUPLICATE", "PICKED_UP"].includes(result.status)
            ? "KHÔNG BÀN GIAO LẠI"
            : "KHÔNG BÀN GIAO"}
      </div>
      <small>Máy quét đang hoạt động · Sẵn sàng cho bưu kiện tiếp theo</small>
    </div>
  );
}
