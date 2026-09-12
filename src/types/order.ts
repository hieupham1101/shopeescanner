export interface ShopeeOrder {
  orderId: string;
  trackingCode: string;
  orderStatus: string;
  cancellationReason?: string;
  carrier?: string;
  shippingMethod?: string;
  shipDate?: string;
  deliveryTime?: string;
  returnRefundStatus?: string;
}
export interface ImportMetadata {
  filename: string;
  importedAt: number;
  total: number;
  waiting: number;
  shipping: number;
  cancelled: number;
  skipped: number;
  merged: number;
}
export interface Dataset {
  orders: ShopeeOrder[];
  metadata: ImportMetadata;
}
