import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QR Resto - Pesan & Bayar Mandiri",
  description: "Sistem pemesanan & pembayaran restoran berbasis QR Code",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ea580c",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
