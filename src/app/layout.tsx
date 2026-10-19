import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Muller Next trial files — swap for the licensed files (same weights) before launch.
const muller = localFont({
  src: [
    { path: "./fonts/MullerNextTrial-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/MullerNextTrial-ExtraBold.otf", weight: "800", style: "normal" },
    { path: "./fonts/MullerNextTrial-Heavy.otf", weight: "900", style: "normal" },
  ],
  variable: "--font-muller",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

// Your own domain once set; otherwise Vercel's production address (set automatically on Vercel).
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "One Less Thing | Daily gut care, made simple",
  description:
    "One Less Thing is a daily fibre supplement that mixes into water. Launching soon, starting with India. Sign up for early access.",
  openGraph: {
    title: "One Less Thing",
    description: "One less thing to worry about. Daily gut care, made simple.",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#D9C8F0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${muller.variable} ${dmSans.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
