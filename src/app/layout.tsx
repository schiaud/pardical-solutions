import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pardical Solutions — Auto Parts Broker Management Software",
  description:
    "The all-in-one platform for auto parts brokers. Order management, real-time pricing, warehouse tracking, bank reconciliation, eBay integration, and employee performance — automated.",
  keywords: [
    "auto parts broker software",
    "auto parts management",
    "car parts broker",
    "auto recycler software",
    "parts broker tools",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
