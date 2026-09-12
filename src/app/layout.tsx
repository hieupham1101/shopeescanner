import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../index.css";
export const metadata: Metadata = {
  title: "Kiểm đơn Shopee — Kiểm tra trước khi bàn giao",
  description: "Quét mã vận đơn Shopee, kiểm tra đơn trùng và trạng thái trước khi bàn giao.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon-192.png" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kiểm đơn",
  },
};
export const viewport: Viewport = {
  themeColor: "#101312",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
