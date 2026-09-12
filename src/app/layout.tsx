import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../index.css";
export const metadata: Metadata = {
  title: "Shopee Pack Check — Final check before handover",
  description: "Fast, local parcel verification for Shopee shipping labels.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon-192.png" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pack Check",
  },
};
export const viewport: Viewport = {
  themeColor: "#101312",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
