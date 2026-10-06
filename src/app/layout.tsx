import type { Metadata, Viewport } from "next";
import { GeistPixelSquare } from "geist/font/pixel";
import { Geist } from "next/font/google";
import { lv } from "@/content/lv";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});


export const metadata: Metadata = {
  title: lv.meta.title,
  description: lv.meta.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f2ef" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1917" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="lv" className={`${geistSans.variable} ${GeistPixelSquare.variable} antialiased`}>
      <body className="min-h-[100dvh]">{children}</body>
    </html>
  );
}
