import * as XLSX from "xlsx";
import type { Dataset, ShopeeOrder } from "../types/order";
import { normalizeText, normalizeTrackingCode } from "./normalization";
import { determineOrderStatus } from "./orderStatus";
export function parseShopeeFile(
  buffer: ArrayBuffer,
  filename: string,
): Dataset {
  const workbook = XLSX.read(buffer, {
    type: "array",
    cellText: true,
    cellNF: true,
  });
  const orders = new Map<string, ShopeeOrder>();
  let found = false,
    skipped = 0,
    merged = 0;
  for (const name of workbook.SheetNames) {
    const rows = XLSX.utils.sheet_to_json<string[]>(workbook.Sheets[name], {
      header: 1,
      raw: false,
      defval: "",
    });
    const headerIndex = rows.findIndex((row) =>
      row.some((cell) => normalizeText(cell) === "mã vận đơn"),
    );
    if (headerIndex < 0) continue;
    found = true;
    const headers = rows[headerIndex].map(normalizeText);
    const index = (name: string) => headers.indexOf(normalizeText(name));
    const fields = {
      orderId: index("Mã đơn hàng"),
      trackingCode: index("Mã vận đơn"),
      orderStatus: index("Trạng Thái Đơn Hàng"),
      cancellationReason: index("Lý do hủy"),
      carrier: index("Đơn Vị Vận Chuyển"),
      shippingMethod: index("Phương thức giao hàng"),
      shipDate: index("Ngày gửi hàng"),
      deliveryTime: index("Thời gian giao hàng"),
      returnRefundStatus: index("Trạng thái Trả hàng/Hoàn tiền"),
    };
    for (let i = headerIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row.some((value) => String(value).trim())) continue;
      const order = Object.fromEntries(
        Object.entries(fields).map(([key, col]) => [
          key,
          String(row[col] ?? "").trim(),
        ]),
      ) as unknown as ShopeeOrder;
      order.trackingCode = normalizeTrackingCode(order.trackingCode);
      if (!order.trackingCode) {
        skipped++;
        continue;
      }
      const previous = orders.get(order.trackingCode);
      if (previous) {
        merged++;
        // Multi-item exports repeat parcels; preserve the most restrictive row.
        const rank = { AVAILABLE: 0, PICKED_UP: 1, CANCELLED: 2 };
        if (
          rank[determineOrderStatus(previous)] >
          rank[determineOrderStatus(order)]
        )
          continue;
      }
      orders.set(order.trackingCode, order);
    }
  }
  if (!found)
    throw new Error(
      "Không tìm thấy cột Mã vận đơn. Vui lòng chọn tệp đơn hàng xuất từ Shopee.",
    );
  if (!orders.size)
    throw new Error(
      "Tệp không có mã vận đơn. Vui lòng nhập tệp Shopee có thông tin vận chuyển.",
    );
  const values = [...orders.values()];
  return {
    orders: values,
    metadata: {
      filename,
      importedAt: Date.now(),
      total: values.length,
      waiting: values.filter(
        (o) =>
          determineOrderStatus(o) === "AVAILABLE" &&
          normalizeText(o.orderStatus) === "chờ giao hàng",
      ).length,
      shipping: values.filter((o) => determineOrderStatus(o) === "PICKED_UP")
        .length,
      cancelled: values.filter((o) => determineOrderStatus(o) === "CANCELLED")
        .length,
      skipped,
      merged,
    },
  };
}
