import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display-var",
  weight: ["400", "500", "600", "700"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body-var",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-var",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "ShopifyTrack Pro — Server-Side Tracking for Shopify in 3 Minutes",
    template: "%s · ShopifyTrack Pro",
  },
  description:
    "Compile error-free GTM web & server containers, multi-platform Conversions API templates and Shopify Custom Pixels — automatically. Plus a Chrome inspector to verify every event.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="grain bg-ink text-bone antialiased">{children}</body>
    </html>
  );
}
